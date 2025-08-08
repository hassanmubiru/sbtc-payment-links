'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export default function ErrorBoundary({ children, fallback: Fallback }: ErrorBoundaryProps) {
  const [state, setState] = useState<ErrorBoundaryState>({ hasError: false })

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setState({
        hasError: true,
        error: new Error(event.message),
        errorInfo: { componentStack: event.filename + ':' + event.lineno }
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setState({
        hasError: true,
        error: new Error(event.reason),
        errorInfo: { componentStack: 'Promise rejection' }
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const resetError = () => {
    setState({ hasError: false })
  }

  if (state.hasError) {
    if (Fallback) {
      return <Fallback error={state.error!} resetError={resetError} />
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          
          {process.env.NODE_ENV === 'development' && state.error && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Error Details (Development)
              </summary>
              <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-800 overflow-auto max-h-32">
                <div className="mb-2">
                  <strong>Error:</strong> {state.error.message}
                </div>
                <div className="mb-2">
                  <strong>Stack:</strong> {state.error.stack}
                </div>
                {state.errorInfo && (
                  <div>
                    <strong>Component Stack:</strong> {state.errorInfo.componentStack}
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="space-y-3">
            <button
              onClick={resetError}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            <a
              href="/"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </a>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            If this problem persists, please{' '}
            <a 
              href="https://github.com/your-username/sbtc-payment-links/issues" 
              className="text-blue-500 hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              report an issue
            </a>
            .
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
