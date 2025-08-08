'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { StacksMainnet, StacksTestnet } from '@stacks/network'
import { CheckCircle, AlertCircle, ExternalLink, ArrowLeft } from 'lucide-react'
import { ParsedPaymentData, parsePaymentUrl, formatAmount, shortenAddress } from '@/utils/paymentUtils'
import { useStacksWallet } from '@/hooks/useStacksWallet'

function PaymentPageContent() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<ParsedPaymentData>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionId, setTransactionId] = useState<string>('')
  const [paymentError, setPaymentError] = useState<string>('')
  const [network] = useState(new StacksMainnet()) // Change to StacksTestnet() for testing

  // Use the wallet hook
  const { 
    isConnected, 
    userAddress, 
    error: walletError, 
    isLoading: walletLoading,
    connectWallet,
    hasProvider 
  } = useStacksWallet()

  // Combined error state
  const error = walletError || paymentError

  useEffect(() => {
    // Parse URL parameters
    const amount = searchParams.get('amount')
    const recipient = searchParams.get('recipient')
    const label = searchParams.get('label')
    const message = searchParams.get('message')

    setPaymentData({
      amount: amount || undefined,
      recipient: recipient || undefined,
      label: label || undefined,
      message: message || undefined,
    })
  }, [searchParams])

  const handleConnectWallet = async () => {
    setPaymentError('') // Clear any previous payment errors
    await connectWallet()
  }

  const sendPayment = async () => {
    if (!paymentData.amount || !paymentData.recipient || !userAddress) {
      setPaymentError('Missing payment information')
      return
    }

    setIsProcessing(true)
    setPaymentError('')

    try {
      // Convert amount to microSTX (1 STX = 1,000,000 microSTX)
      const amountInMicroSTX = Math.floor(parseFloat(paymentData.amount) * 1000000)

      // For now, simulate a successful transaction since we don't have a real wallet connection
      // In a real implementation, this would use the wallet's signTransaction method
      console.log('Simulating STX transfer:', {
        from: userAddress,
        to: paymentData.recipient,
        amount: amountInMicroSTX,
        memo: paymentData.message || paymentData.label || 'sBTC Payment'
      })

      // Simulate transaction processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate a mock transaction ID
      const mockTxId = 'mock_' + Date.now().toString(16) + '_' + Math.random().toString(16).slice(2, 8)
      
      console.log('Mock transaction completed:', mockTxId)
      setTransactionId(mockTxId)

      // TODO: Replace with real wallet integration
      // This would typically look like:
      /*
      const txOptions = {
        recipient: paymentData.recipient,
        amount: amountInMicroSTX.toString(),
        memo: paymentData.message || paymentData.label || 'sBTC Payment',
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      }

      // Use wallet provider to sign and broadcast
      if (provider && provider.signTransaction) {
        const signedTx = await provider.signTransaction(txOptions)
        const broadcastResponse = await fetch(`${network.coreApiUrl}/v2/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          body: signedTx,
        })
        
        if (broadcastResponse.ok) {
          const result = await broadcastResponse.text()
          setTransactionId(result.replace(/"/g, ''))
        } else {
          throw new Error('Transaction broadcast failed')
        }
      } else {
        throw new Error('Wallet does not support transaction signing')
      }
      */

    } catch (error) {
      console.error('Payment failed:', error)
      setPaymentError('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!paymentData.amount || !paymentData.recipient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Payment Request</h1>
          <p className="text-gray-600 mb-6">
            This payment link is missing required information. Please check the link and try again.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </a>
        </div>
      </div>
    )
  }

  if (transactionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Simulated!</h1>
          <p className="text-gray-600 mb-6">
            Your payment has been simulated successfully. In a real implementation, this would be sent to the Stacks network.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Mock Transaction ID</div>
            <div className="font-mono text-sm break-all">{transactionId}</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="text-sm text-blue-700">
              <strong>Note:</strong> This is a demonstration. No real transaction was sent. 
              In production, this would integrate with a real Stacks wallet.
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Another Payment
            </button>
            <a
              href="/"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Create New Payment
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Request</h1>
          <p className="text-gray-600">Complete your sBTC payment</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 rounded-xl p-6 text-white mb-6">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold">{formatAmount(paymentData.amount || '0')} sBTC</div>
            <div className="text-sm opacity-80">Amount to Send</div>
          </div>
          
          {paymentData.label && (
            <div className="mb-3">
              <div className="text-sm opacity-80">Payment For</div>
              <div className="font-medium">{paymentData.label}</div>
            </div>
          )}
          
          <div className="mb-3">
            <div className="text-sm opacity-80">To</div>
            <div className="font-mono text-sm">{shortenAddress(paymentData.recipient || '', 6)}</div>
          </div>
          
          {paymentData.message && (
            <div>
              <div className="text-sm opacity-80">Message</div>
              <div className="text-sm">{paymentData.message}</div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Wallet Connection and Payment */}
        {!isConnected ? (
          <div className="space-y-4">
            {/* Debug Info - Show wallet detection status */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
              <div className="font-medium text-gray-700 mb-2">Debug Info:</div>
              <div className="space-y-1 text-gray-600">
                <div>Wallet Provider: {hasProvider ? '✓ Detected' : '✗ None found'}</div>
                <div>Loading: {walletLoading ? 'Yes' : 'No'}</div>
                <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
                {walletError && <div className="text-red-600">Error: {walletError}</div>}
              </div>
            </div>

            {!hasProvider && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-yellow-700 text-sm">
                    <div className="font-medium mb-1">No Stacks wallet detected</div>
                    <div>Please install a Stacks wallet extension:</div>
                    <ul className="mt-2 space-y-1">
                      <li>• <a href="https://leather.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Leather Wallet</a> (Recommended)</li>
                      <li>• <a href="https://www.xverse.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Xverse Wallet</a></li>
                    </ul>
                    <div className="mt-2 text-xs">After installation, refresh this page.</div>
                  </div>
                </div>
              </div>
            )}
            
            {hasProvider && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-red-700 text-sm">
                    <div className="font-medium mb-1">Wallet connection failed</div>
                    <div className="whitespace-pre-line">{error}</div>
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2 text-xs">
                        Development mode: Try the mock payment option below for testing.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleConnectWallet}
              disabled={!hasProvider || walletLoading}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {walletLoading ? 'Detecting Wallet...' : 
               !hasProvider ? 'Install Wallet First' :
               'Connect Wallet to Pay'}
            </button>
            
            {/* Development Mock Option */}
            {process.env.NODE_ENV === 'development' && (
              <div className="border-t pt-4">
                <div className="text-center text-sm text-gray-500 mb-2">Development Testing</div>
                <button
                  onClick={() => {
                    // Simulate successful connection for development
                    const mockAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
                    console.log('Using development mock wallet:', mockAddress)
                    // You would typically set this in your wallet state
                    alert(`Mock wallet connected!\nAddress: ${mockAddress}\n\nNote: This is for development testing only.`)
                  }}
                  className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-500 transition-colors text-sm"
                >
                  Use Mock Wallet (Dev Only)
                </button>
              </div>
            )}
            
            {/* Mock Payment Option for Testing */}
            <div className="border-t pt-4">
              <div className="text-center text-sm text-gray-500 mb-2">For Testing</div>
              <button
                onClick={() => {
                  // Simulate successful payment for demo
                  setTransactionId('mock-tx-' + Date.now())
                }}
                className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-500 transition-colors text-sm"
              >
                Mock Payment (Demo Only)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Connected: {shortenAddress(userAddress, 4)}
            </div>
            <button
              onClick={sendPayment}
              disabled={isProcessing}
              className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing Payment...' : 'Send Payment'}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-500 hover:text-blue-600 text-sm transition-colors"
          >
            ← Back to Payment Generator
          </a>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}
