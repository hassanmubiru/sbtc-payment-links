'use client'

import { useState, useEffect } from 'react'
import { Copy, DollarSign, User, MessageSquare, Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { PaymentData } from '@/app/page'
import { generatePaymentUrl } from '@/utils/paymentUtils'
import { validateStacksAddressWithApi, getAddressBalance, formatSTXAmount } from '@/utils/stacksApi'

interface PaymentFormProps {
  paymentData: PaymentData
  setPaymentData: (data: PaymentData) => void
  setGeneratedUrl: (url: string) => void
}

export default function PaymentForm({ paymentData, setPaymentData, setGeneratedUrl }: PaymentFormProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [addressValidation, setAddressValidation] = useState<{
    isValidating: boolean
    isValid: boolean | null
    balance: string | null
    error: string | null
  }>({
    isValidating: false,
    isValid: null,
    balance: null,
    error: null
  })

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Validate address with Stacks API when recipient changes
  useEffect(() => {
    if (!isMounted) return
    
    const validateAddress = async () => {
      if (!paymentData.recipient || paymentData.recipient.length < 10) {
        setAddressValidation({ isValidating: false, isValid: null, balance: null, error: null })
        return
      }

      console.log('Validating address:', paymentData.recipient)
      setAddressValidation(prev => ({ ...prev, isValidating: true, error: null }))

      try {
        const trimmedAddress = paymentData.recipient.trim()
        
        // Check basic format first
        if (trimmedAddress.length !== 40) {
          setAddressValidation({
            isValidating: false,
            isValid: false,
            balance: null,
            error: 'Address must be exactly 40 characters'
          })
          return
        }

        // Use format validation first (always works)
        const formatValid = /^(SP|ST|SM)[0-9A-Z]{38}$/i.test(trimmedAddress.toUpperCase())
        console.log('Format validation result:', formatValid)
        
        if (!formatValid) {
          setAddressValidation({
            isValidating: false,
            isValid: false,
            balance: null,
            error: 'Invalid Stacks address format. Must start with SP, ST, or SM.'
          })
          return
        }

        // Try API validation (may fail due to network issues)
        try {
          console.log('Attempting API validation...')
          const isValidApi = await validateStacksAddressWithApi(trimmedAddress)
          const balance = await getAddressBalance(trimmedAddress)
          
          console.log('API validation result:', { isValidApi, balance })
          
          setAddressValidation({
            isValidating: false,
            isValid: true, // Format is valid, so accept it even if API fails
            balance: balance ? formatSTXAmount(balance.stx.balance) : null,
            error: null
          })
        } catch (apiError) {
          console.warn('API validation failed, using format validation:', apiError)
          // If API fails, just use format validation
          setAddressValidation({
            isValidating: false,
            isValid: true, // Format validation passed
            balance: null,
            error: null
          })
        }

      } catch (error) {
        console.error('Address validation error:', error)
        setAddressValidation({
          isValidating: false,
          isValid: false,
          balance: null,
          error: 'Validation failed. Please check the address format.'
        })
      }
    }

    const debounceTimer = setTimeout(validateAddress, 500)
    return () => clearTimeout(debounceTimer)
  }, [paymentData.recipient, isMounted])

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    const newData = { ...paymentData, [field]: value }
    setPaymentData(newData)
    
    // Auto-generate URL as user types, but only if data is valid
    if (newData.amount && newData.recipient) {
      try {
        const url = generatePaymentUrl(newData)
        setGeneratedUrl(url)
      } catch (error) {
        // Silently fail during auto-generation - user will see errors when they click generate
        setGeneratedUrl('')
      }
    } else {
      // Clear the generated URL if required fields are missing
      setGeneratedUrl('')
    }
  }

  const handleGenerateUrl = async () => {
    console.log('Generate URL clicked with data:', paymentData)
    
    if (!paymentData.amount || !paymentData.recipient) {
      alert('Please fill in amount and recipient address')
      return
    }

    setIsGenerating(true)
    try {
      console.log('Generating URL with data:', paymentData)
      const url = generatePaymentUrl(paymentData)
      console.log('Generated URL:', url)
      setGeneratedUrl(url)
      alert(`Payment link generated successfully: ${url}`)
    } catch (error) {
      console.error('Error generating payment URL:', error)
      alert(`Error generating payment URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Payment Request</h2>
        <p className="text-gray-600">Fill in the details to generate a shareable payment link</p>
      </div>

      <form className="space-y-6">
        {/* Amount Field */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (sBTC)*
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="amount"
              step="0.00000001"
              min="0"
              placeholder="0.001"
              value={paymentData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-500 focus:border-bitcoin-500 transition-colors"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Minimum: 0.00000001 sBTC</p>
        </div>

        {/* Recipient Address Field */}
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address*
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="recipient"
              placeholder="SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173"
              value={paymentData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-bitcoin-500 focus:border-bitcoin-500 transition-colors ${
                addressValidation.isValid === false 
                  ? 'border-red-300 bg-red-50' 
                  : addressValidation.isValid === true 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
              }`}
              required
              maxLength={40}
              minLength={40}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {addressValidation.isValidating && (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              )}
              {!addressValidation.isValidating && addressValidation.isValid === true && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {!addressValidation.isValidating && addressValidation.isValid === false && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>
          <div className="mt-1 space-y-1">
            <p className="text-xs text-gray-500">
              Stacks address: 40 characters starting with SP (mainnet), ST (testnet), or SM (contract)
            </p>
            {addressValidation.isValid === true && addressValidation.balance && (
              <p className="text-xs text-green-600">
                ✓ Valid address • Balance: {addressValidation.balance} STX
              </p>
            )}
            {addressValidation.isValid === false && addressValidation.error && (
              <p className="text-xs text-red-600">
                ✗ {addressValidation.error}
              </p>
            )}
            {addressValidation.isValid === false && !addressValidation.error && paymentData.recipient.length > 10 && (
              <p className="text-xs text-red-600">
                ✗ Invalid address format or address not found
              </p>
            )}
            {paymentData.recipient.length > 0 && paymentData.recipient.length !== 40 && (
              <p className="text-xs text-yellow-600">
                Current length: {paymentData.recipient.length}/40 characters
              </p>
            )}
          </div>
        </div>

        {/* Label Field */}
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Label
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="label"
              placeholder="Invoice #123"
              value={paymentData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-500 focus:border-bitcoin-500 transition-colors"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Short description for this payment</p>
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <div className="relative">
            <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="message"
              rows={3}
              placeholder="Payment for services rendered..."
              value={paymentData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bitcoin-500 focus:border-bitcoin-500 transition-colors resize-none"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Optional message to include with the payment request</p>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerateUrl}
          disabled={
            !paymentData.amount || 
            !paymentData.recipient || 
            isGenerating || 
            addressValidation.isValidating ||
            addressValidation.isValid === false
          }
          className="w-full bg-bitcoin-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-bitcoin-600 focus:ring-2 focus:ring-bitcoin-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 
           addressValidation.isValidating ? 'Validating Address...' :
           'Generate Payment Link'}
        </button>

        {/* Example Addresses Help */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Example Valid Addresses:</h4>
          <div className="space-y-1 text-xs">
            <button
              type="button"
              onClick={() => handleInputChange('recipient', 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173')}
              className="block w-full text-left text-blue-700 hover:text-blue-900 font-mono"
            >
              SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173 (Mainnet)
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('recipient', 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')}
              className="block w-full text-left text-blue-700 hover:text-blue-900 font-mono"
            >
              ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM (Testnet)
            </button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Click any example to try it out
          </p>
        </div>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Security Notice
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Always verify the recipient address before sending payments. 
                sBTC transactions are irreversible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
