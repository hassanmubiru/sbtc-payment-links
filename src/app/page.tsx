'use client'

import { useState } from 'react'
import PaymentForm from '@/components/PaymentForm'
import PaymentPreview from '@/components/PaymentPreview'
import NetworkStatus from '@/components/NetworkStatus'
import TransactionMonitor from '@/components/TransactionMonitor'
import { getNetworkInfo, getCurrentBlockHeight } from '@/utils/stacksApi'

export interface PaymentData {
  amount: string
  recipient: string
  message: string
  label: string
}

export default function Home() {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: '',
    recipient: '',
    message: '',
    label: ''
  })

  const [generatedUrl, setGeneratedUrl] = useState<string>('')

  // Debug function to test API calls
  const testAPI = async () => {
    console.log('=== Testing Stacks API ===')
    try {
      console.log('Testing network info...')
      const networkInfo = await getNetworkInfo()
      console.log('Network info result:', networkInfo)
      
      console.log('Testing block height...')
      const blockHeight = await getCurrentBlockHeight()
      console.log('Block height result:', blockHeight)
      
      alert(`API Test Results:\nNetwork Info: ${networkInfo ? 'SUCCESS' : 'FAILED'}\nBlock Height: ${blockHeight || 'FAILED'}`)
    } catch (error) {
      console.error('API test error:', error)
      alert(`API Test Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              sBTC Payment Links
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Generate shareable payment request URLs for sBTC transactions. 
              Perfect for invoices, donations, or any Bitcoin payment needs.
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Secure
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Fast
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Easy to Share
              </span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <PaymentForm 
                paymentData={paymentData}
                setPaymentData={setPaymentData}
                setGeneratedUrl={setGeneratedUrl}
              />
            </div>

            {/* Right Sidebar */}
            <div className="order-1 lg:order-2 space-y-6">
              {/* Payment Preview */}
              <PaymentPreview 
                paymentData={paymentData}
                generatedUrl={generatedUrl}
              />
              
              {/* Transaction Monitor - Only show if recipient is provided */}
              {paymentData.recipient && (
                <TransactionMonitor 
                  address={paymentData.recipient}
                  expectedAmount={paymentData.amount}
                  onPaymentReceived={(tx) => {
                    console.log('Payment received:', tx)
                    // You can add notification logic here
                  }}
                />
              )}
              
              {/* Network Status */}
              <NetworkStatus />
              
              {/* Debug Button - Remove this in production */}
              <div className="p-4 bg-gray-100 rounded-lg">
                <button
                  onClick={testAPI}
                  className="w-full px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                >
                  🔧 Test API Calls
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-bitcoin-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Links</h3>
              <p className="text-gray-600">Create shareable payment URLs with custom amounts and messages</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-bitcoin-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">QR Codes</h3>
              <p className="text-gray-600">Generate QR codes for easy mobile payments and quick scanning</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-bitcoin-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
              <p className="text-gray-600">Share via email, messaging, social media, or any communication method</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
