import { PaymentData } from '@/app/page'

export interface ParsedPaymentData {
  amount?: string
  recipient?: string
  label?: string
  message?: string
}

// Generate a payment URL following BIP21-like standard for sBTC
export function generatePaymentUrl(paymentData: PaymentData): string {
  const { amount, recipient, label, message } = paymentData
  
  if (!amount || !recipient) {
    throw new Error('Amount and recipient are required')
  }

  // Validate amount
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Amount must be a valid number greater than 0')
  }

  if (numAmount < 0.00000001) {
    throw new Error('Amount must be at least 0.00000001 sBTC')
  }

  // Validate recipient address (basic Stacks address validation)
  if (!isValidStacksAddress(recipient.trim())) {
    throw new Error('Invalid Stacks address')
  }

  // Create web URL for the payment page
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/pay`
    : 'http://localhost:3000/pay'
  
  const params = new URLSearchParams()

  // Add required parameters
  params.append('amount', amount)
  params.append('recipient', recipient.trim())

  // Add optional parameters
  if (label && label.trim()) {
    params.append('label', label.trim())
  }
  
  if (message && message.trim()) {
    params.append('message', message.trim())
  }

  // Return the complete URL
  return `${baseUrl}?${params.toString()}`
}

// Parse a payment URL back into payment data
export function parsePaymentUrl(url: string): ParsedPaymentData {
  try {
    // Handle both sbtc: protocol and regular URLs
    let parsedUrl: URL
    
    if (url.startsWith('sbtc:')) {
      // Convert sbtc: protocol to https: for URL parsing
      const httpsUrl = url.replace('sbtc:', 'https://')
      parsedUrl = new URL(httpsUrl)
    } else {
      parsedUrl = new URL(url)
    }

    const recipient = parsedUrl.hostname || parsedUrl.pathname.replace('/', '')
    const searchParams = parsedUrl.searchParams

    return {
      recipient,
      amount: searchParams.get('amount') || undefined,
      label: searchParams.get('label') || undefined,
      message: searchParams.get('message') || undefined,
    }
  } catch (error) {
    throw new Error('Invalid payment URL format')
  }
}

// Validate Stacks address format
export function isValidStacksAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }

  const trimmedAddress = address.trim()
  
  // Check minimum length
  if (trimmedAddress.length !== 40) {
    return false
  }
  
  // Basic validation for Stacks addresses
  // Mainnet addresses start with SP, testnet with ST, contract addresses with SM
  // Allow for more flexible character set (Crockford Base32)
  const stacksAddressRegex = /^(SP|ST|SM)[0-9A-Z]{38}$/i
  return stacksAddressRegex.test(trimmedAddress.toUpperCase())
}

// Format amount for display
export function formatAmount(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'
  
  // Handle very small amounts
  if (num < 0.00000001) return '0'
  
  // Use appropriate decimal places
  if (num >= 1) {
    return num.toFixed(8).replace(/\.?0+$/, '')
  } else {
    return num.toFixed(8).replace(/\.?0+$/, '')
  }
}

// Generate shareable text for social media
export function generateShareText(paymentData: PaymentData, url: string): string {
  const { amount, label, message } = paymentData
  
  let text = `sBTC Payment Request: ${formatAmount(amount)} sBTC`
  
  if (label) {
    text += ` - ${label}`
  }
  
  if (message) {
    text += `\n${message}`
  }
  
  text += `\n\nPay here: ${url}`
  
  return text
}

// Validate payment data
export function validatePaymentData(paymentData: PaymentData): string | null {
  const { amount, recipient } = paymentData
  
  if (!amount || amount === '0' || parseFloat(amount) <= 0) {
    return 'Amount must be greater than 0'
  }
  
  if (parseFloat(amount) < 0.00000001) {
    return 'Amount must be at least 0.00000001 sBTC'
  }
  
  if (!recipient) {
    return 'Recipient address is required'
  }
  
  if (!isValidStacksAddress(recipient)) {
    return 'Invalid Stacks address format'
  }
  
  return null
}

// Create web-friendly URL for sharing
export function createWebUrl(paymentData: PaymentData): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sbtc-pay.com'
  const params = new URLSearchParams()
  
  if (paymentData.amount) params.append('amount', paymentData.amount)
  if (paymentData.recipient) params.append('recipient', paymentData.recipient)
  if (paymentData.label) params.append('label', paymentData.label)
  if (paymentData.message) params.append('message', paymentData.message)
  
  return `${baseUrl}/pay?${params.toString()}`
}

// Shorten a long address for display
export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}
