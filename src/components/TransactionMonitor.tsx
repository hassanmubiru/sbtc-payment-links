'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { getAddressTransactions, Transaction } from '@/utils/stacksApi'

interface TransactionMonitorProps {
  address: string
  expectedAmount: string
  onPaymentReceived?: (transaction: Transaction) => void
}

export default function TransactionMonitor({ 
  address, 
  expectedAmount, 
  onPaymentReceived 
}: TransactionMonitorProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [paymentReceived, setPaymentReceived] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const startMonitoring = () => {
    setIsMonitoring(true)
    checkForTransactions()
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  const checkForTransactions = async () => {
    if (!address || !isMounted) return

    try {
      console.log('Checking transactions for address:', address)
      const txList = await getAddressTransactions(address, 10)
      
      if (txList?.results) {
        const recentTxs = txList.results.filter(tx => 
          tx.tx_status === 'success' && 
          new Date(tx.burn_block_time * 1000) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
        )
        
        setTransactions(recentTxs)
        
        // Check for matching payment
        const matchingTx = recentTxs.find(tx => {
          // This is a simplified check - in reality you'd need to parse the transaction details
          // to check for the exact amount and type
          return tx.tx_type === 'token_transfer' && tx.tx_status === 'success'
        })

        if (matchingTx && !paymentReceived) {
          setPaymentReceived(true)
          onPaymentReceived?.(matchingTx)
        }
      } else {
        console.warn('No transaction data received, API may be unavailable')
        // Don't set error state, just log the issue
      }
      
      setLastChecked(new Date())
    } catch (error) {
      console.warn('Error checking transactions (API may be unavailable):', error)
      // Set last checked time even on error to show we tried
      setLastChecked(new Date())
      // Don't throw error - just continue monitoring
    }
  }

  useEffect(() => {
    if (!isMonitoring || !isMounted) return

    const interval = setInterval(checkForTransactions, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [isMonitoring, address, expectedAmount, paymentReceived, isMounted])

  const getStacksExplorerUrl = (txId: string) => {
    if (!isMounted) return '#'
    
    const network = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'mainnet'
    const baseUrl = network === 'mainnet' 
      ? 'https://explorer.stacks.co'
      : 'https://explorer.stacks.co/?chain=testnet'
    return `${baseUrl}/txid/${txId}`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Monitor</h3>
        <div className="flex space-x-2">
          {!isMonitoring ? (
            <button
              onClick={startMonitoring}
              disabled={!address}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Monitoring
            </button>
          ) : (
            <button
              onClick={stopMonitoring}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Stop Monitoring
            </button>
          )}
        </div>
      </div>

      {!address && (
        <div className="text-center py-6 text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Enter a recipient address to monitor for payments</p>
        </div>
      )}

      {address && !isMonitoring && (
        <div className="text-center py-6 text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Click "Start Monitoring" to watch for incoming payments</p>
        </div>
      )}

      {isMonitoring && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">
                Monitoring for {expectedAmount} sBTC payment
              </span>
            </div>
            {lastChecked && (
              <span className="text-xs text-blue-600">
                Last checked: {lastChecked.toLocaleTimeString()}
              </span>
            )}
          </div>

          {paymentReceived && (
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Payment received!
              </span>
            </div>
          )}

          {transactions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Transactions</h4>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.tx_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-gray-600 truncate">
                        {tx.tx_id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tx.tx_type} • {tx.tx_status}
                      </p>
                    </div>
                    <a
                      href={getStacksExplorerUrl(tx.tx_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                      title="View on explorer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {transactions.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No recent transactions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
