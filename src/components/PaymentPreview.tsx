'use client'

import { useState, useEffect } from 'react'
import { Copy, ExternalLink, QrCode, Share2, Check } from 'lucide-react'
import QRCode from 'qrcode'
import { PaymentData } from '@/app/page'
import { useIsClient, useNavigator } from '@/hooks/useIsClient'

interface PaymentPreviewProps {
  paymentData: PaymentData
  generatedUrl: string
}

export default function PaymentPreview({ paymentData, generatedUrl }: PaymentPreviewProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const isClient = useIsClient()
  const navigator = useNavigator()
  const shareSupported = isClient && navigator && !!navigator.share

  useEffect(() => {
    if (generatedUrl && isClient) {
      generateQRCode(generatedUrl)
    }
  }, [generatedUrl, isClient])

  const generateQRCode = async (url: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      })
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const handleCopyUrl = async () => {
    if (!isClient || !navigator) return
    
    try {
      await navigator.clipboard.writeText(generatedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleShare = async () => {
    if (!shareSupported) return
    
    try {
      await navigator!.share({
        title: 'sBTC Payment Request',
        text: `Please send ${paymentData.amount} sBTC using this link: ${generatedUrl}`,
        url: generatedUrl
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const openInNewTab = () => {
    if (!isClient) return
    window.open(generatedUrl, '_blank')
  }

  if (!generatedUrl) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Preview</h3>
          <p className="text-gray-500">
            Fill in the payment details to see a preview and generate your shareable link
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Preview</h3>
        <p className="text-gray-600">Your generated payment request is ready to share</p>
      </div>

      {/* Payment Details Card */}
      <div className="bg-gradient-to-r from-bitcoin-500 to-bitcoin-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">Payment Request</h4>
          <div className="text-right">
            <div className="text-2xl font-bold">{paymentData.amount} sBTC</div>
            <div className="text-sm opacity-80">Amount</div>
          </div>
        </div>
        
        {paymentData.label && (
          <div className="mb-3">
            <div className="text-sm opacity-80">Label</div>
            <div className="font-medium">{paymentData.label}</div>
          </div>
        )}
        
        <div className="mb-3">
          <div className="text-sm opacity-80">Recipient</div>
          <div className="font-mono text-sm break-all">{paymentData.recipient}</div>
        </div>
        
        {paymentData.message && (
          <div>
            <div className="text-sm opacity-80">Message</div>
            <div className="text-sm">{paymentData.message}</div>
          </div>
        )}
      </div>

      {/* QR Code */}
      {qrCodeUrl && (
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-white rounded-lg shadow-inner">
            <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48 mx-auto" />
          </div>
          <p className="text-sm text-gray-600 mt-2">Scan with any sBTC wallet</p>
        </div>
      )}

      {/* Generated URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Generated Payment URL
        </label>
        <div className="flex">
          <input
            type="text"
            value={generatedUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm font-mono"
          />
          <button
            onClick={handleCopyUrl}
            className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
            title="Copy URL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
        {copied && (
          <p className="text-sm text-green-600 mt-1">URL copied to clipboard!</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={openInNewTab}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Link
        </button>
        
        {shareSupported ? (
          <button
            onClick={handleShare}
            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
        ) : (
          <button
            onClick={handleCopyUrl}
            className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy URL
          </button>
        )}
      </div>

      {/* Share Options */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-3">Share via:</h5>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <a
            href={`mailto:?subject=sBTC Payment Request&body=Please send ${paymentData.amount} sBTC using this link: ${generatedUrl}`}
            className="text-center py-2 px-3 bg-white rounded border hover:bg-gray-50 transition-colors"
          >
            📧 Email
          </a>
          <a
            href={`https://wa.me/?text=Payment request for ${paymentData.amount} sBTC: ${generatedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center py-2 px-3 bg-white rounded border hover:bg-gray-50 transition-colors"
          >
            💬 WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=sBTC Payment Request: ${paymentData.amount} sBTC&url=${generatedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center py-2 px-3 bg-white rounded border hover:bg-gray-50 transition-colors"
          >
            🐦 Twitter
          </a>
        </div>
      </div>
    </div>
  )
}
