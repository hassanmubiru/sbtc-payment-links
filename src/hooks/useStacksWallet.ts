'use client'

import { useState, useEffect, useCallback } from 'react'

interface WalletState {
  isConnected: boolean
  userAddress: string
  error: string | null
  isLoading: boolean
}

interface StacksWalletProvider {
  showConnect?: (options: any) => void
  connect?: (options: any) => void
  [key: string]: any
}

export function useStacksWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    userAddress: '',
    error: null,
    isLoading: false
  })

  const [provider, setProvider] = useState<StacksWalletProvider | null>(null)

  // Detect available wallet providers with error handling for extension conflicts
  const detectWalletProvider = useCallback((): StacksWalletProvider | null => {
    if (typeof window === 'undefined') return null

    console.log('Detecting wallet providers...')

    // Safe property access function to avoid extension conflicts
    const safeGet = (path: string): any => {
      try {
        const parts = path.split('.')
        let obj = window as any
        for (const part of parts) {
          if (obj && typeof obj === 'object' && part in obj) {
            obj = obj[part]
          } else {
            return null
          }
        }
        return obj
      } catch (error) {
        console.warn(`Error accessing ${path}:`, error)
        return null
      }
    }

    // Try different wallet provider locations with safe access
    const providerPaths = [
      'StacksProvider',
      'LeatherProvider', 
      'XverseProviders.StacksProvider',
      'btc',
      'stacksWallet',
      'wallet.stacks',
      // Additional fallback locations
      'ethereum.stacks', // Some wallets inject here
      'wallets.stacks',
      'stacks'
    ]

    console.log('Checking provider paths...')

    for (let i = 0; i < providerPaths.length; i++) {
      const path = providerPaths[i]
      try {
        const provider = safeGet(path)
        if (provider && typeof provider === 'object') {
          // Check if it looks like a valid wallet provider
          const hasConnectMethod = provider.showConnect || provider.connect || provider.request
          const hasStacksMethods = provider.getAddresses || provider.signTransaction || provider.sendTransfer
          const hasWalletProperties = provider.isConnected !== undefined || provider.accounts || provider.selectedAddress
          
          if (hasConnectMethod || hasStacksMethods || hasWalletProperties) {
            console.log(`Found wallet provider at ${path}:`, {
              type: provider.constructor?.name || 'Unknown',
              methods: {
                showConnect: !!provider.showConnect,
                connect: !!provider.connect,
                request: !!provider.request,
                getAddresses: !!provider.getAddresses,
                signTransaction: !!provider.signTransaction
              }
            })
            return provider
          }
        }
      } catch (error) {
        console.warn(`Error checking provider at ${path}:`, error)
        continue
      }
    }

    // Try to find any object that looks like a Stacks provider
    console.log('Scanning all window properties for Stacks providers...')
    try {
      const windowKeys = Object.getOwnPropertyNames(window)
      for (const key of windowKeys) {
        if (key.toLowerCase().includes('stacks') || 
            key.toLowerCase().includes('leather') || 
            key.toLowerCase().includes('xverse')) {
          try {
            const obj = (window as any)[key]
            if (obj && typeof obj === 'object' && 
                (obj.showConnect || obj.connect || obj.request || obj.getAddresses)) {
              console.log(`Found wallet provider in window.${key}:`, obj)
              return obj
            }
          } catch (e) {
            // Skip properties that can't be accessed
            continue
          }
        }
      }
    } catch (error) {
      console.warn('Error scanning window properties:', error)
    }

    // Try to manually trigger wallet injection
    console.log('No providers found, triggering wallet detection events...')
    
    // Dispatch custom events that some wallets listen for
    try {
      const events = [
        'stacks-wallet-check',
        'wallet-check', 
        'web3-check',
        'ethereum-check'
      ]
      
      for (const eventName of events) {
        window.dispatchEvent(new CustomEvent(eventName, { detail: { source: 'sbtc-payment-links' } }))
      }
    } catch (e) {
      console.warn('Could not dispatch wallet check events:', e)
    }

    return null
  }, [])

  // Initialize wallet detection with error handling for extension conflicts
  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const maxRetries = 20 // Increased retries for extension conflicts

    const checkForWallet = () => {
      if (!mounted) return

      console.log(`Wallet check attempt ${retryCount + 1}/${maxRetries}`)
      
      try {
        const detectedProvider = detectWalletProvider()
        
        if (detectedProvider) {
          console.log('Wallet provider detected!', detectedProvider)
          setProvider(detectedProvider)
          setWalletState(prev => ({ ...prev, error: null }))
        } else if (retryCount < maxRetries) {
          retryCount++
          // Exponential backoff for retries to handle extension loading delays
          const delay = Math.min(1000 + (retryCount * 500), 5000)
          setTimeout(checkForWallet, delay)
        } else {
          console.log('No wallet found after all retries')
          setWalletState(prev => ({ 
            ...prev, 
            error: 'No Stacks wallet found. Please install a Stacks wallet extension like Leather or Xverse and refresh the page.' 
          }))
        }
      } catch (error) {
        console.error('Error during wallet detection:', error)
        
        // If we get an extension conflict error, wait longer and retry
        if (error instanceof Error && 
            (error.message.includes('StacksProvider') || 
             error.message.includes('redefine property'))) {
          console.log('Extension conflict detected, waiting longer...')
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(checkForWallet, 3000) // Wait 3 seconds for extensions to settle
          } else {
            setWalletState(prev => ({ 
              ...prev, 
              error: 'Wallet extension conflict detected. Please try refreshing the page or disable conflicting extensions.' 
            }))
          }
        } else {
          // Other errors
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          setWalletState(prev => ({ 
            ...prev, 
            error: `Wallet detection error: ${errorMessage}` 
          }))
        }
      }
    }

    // Initial check with longer delay to let extensions settle
    setTimeout(checkForWallet, 2000)

    // Listen for wallet provider injection with error handling
    const handleWalletReady = (event?: Event) => {
      console.log('Wallet ready event received:', event?.type)
      if (mounted) {
        try {
          setTimeout(checkForWallet, 1000)
        } catch (error) {
          console.warn('Error handling wallet ready event:', error)
        }
      }
    }

    // Listen for various wallet events
    const events = [
      'StacksWalletReady',
      'LeatherReady', 
      'XverseReady',
      'stacks-wallet-ready',
      'wallet-ready',
      'web3Ready',
      'ethereumReady'
    ]

    events.forEach(event => {
      try {
        window.addEventListener(event, handleWalletReady)
      } catch (error) {
        console.warn(`Could not add listener for ${event}:`, error)
      }
    })
    
    return () => {
      mounted = false
      events.forEach(event => {
        try {
          window.removeEventListener(event, handleWalletReady)
        } catch (error) {
          console.warn(`Could not remove listener for ${event}:`, error)
        }
      })
    }
  }, [detectWalletProvider])

  const connectWallet = useCallback(async () => {
    if (!provider) {
      setWalletState(prev => ({ 
        ...prev, 
        error: 'No wallet provider available' 
      }))
      return false
    }

    setWalletState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('Attempting to connect with provider:', provider)
      console.log('Provider methods:', {
        showConnect: !!provider.showConnect,
        connect: !!provider.connect,
        request: !!provider.request,
        getAddresses: !!provider.getAddresses,
        signTransaction: !!provider.signTransaction
      })

      // Try different connection methods based on wallet type
      let authResponse = null
      let connectionMethod = 'unknown'
      
      // Method 1: Stacks Connect (Leather, Hiro, etc.)
      if (!authResponse && provider.showConnect) {
        connectionMethod = 'showConnect'
        console.log('Trying showConnect method')
        try {
          authResponse = await new Promise((resolve, reject) => {
            const appDetails = {
              name: 'sBTC Payment Links',
              icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '',
            }

            const authOptions = {
              redirectTo: '/',
              onFinish: resolve,
              onCancel: () => reject(new Error('User cancelled wallet connection')),
              appDetails,
            }

            try {
              provider.showConnect!(authOptions)
            } catch (providerError) {
              reject(providerError)
            }
          })
          console.log('showConnect succeeded')
        } catch (showConnectError) {
          console.warn('showConnect method failed:', showConnectError)
          authResponse = null
        }
      }
      
      // Method 2: Direct connect method
      if (!authResponse && provider.connect) {
        connectionMethod = 'connect'
        console.log('Trying connect method')
        const connectOptions = {
          appDetails: {
            name: 'sBTC Payment Links',
            icon: typeof window !== 'undefined' ? window.location.origin + '/favicon.ico' : '',
          }
        }
        
        try {
          authResponse = await provider.connect!(connectOptions)
          console.log('connect succeeded')
        } catch (connectError) {
          console.warn('Connect with options failed, trying minimal options:', connectError)
          try {
            authResponse = await provider.connect!({})
            console.log('connect with minimal options succeeded')
          } catch (minimalConnectError) {
            console.warn('Connect method failed completely:', minimalConnectError)
            authResponse = null
          }
        }
      }
      
      // Method 3: Request method (for modern wallets) - with implementation check
      if (!authResponse && provider.request) {
        connectionMethod = 'request'
        console.log('Trying request method')
        try {
          // Test if request method is actually implemented
          authResponse = await provider.request({
            method: 'stx_requestAccounts'
          })
          console.log('request method succeeded')
        } catch (requestError) {
          console.warn('stx_requestAccounts failed:', requestError)
          // Check if it's a "not implemented" error
          if (requestError instanceof Error && 
              (requestError.message.includes('not implemented') || 
               requestError.message.includes('function is not implemented'))) {
            console.log('Request method not implemented, continuing to next method...')
            authResponse = null
          } else {
            // Try alternative request method
            try {
              authResponse = await provider.request({
                method: 'wallet_requestPermissions',
                params: [{ 'stx_accounts': {} }]
              })
              console.log('alternative request method succeeded')
            } catch (altRequestError) {
              console.warn('Alternative request method also failed:', altRequestError)
              authResponse = null
            }
          }
        }
      }
      
      // Method 4: getAddresses method (direct address access)
      if (!authResponse && provider.getAddresses) {
        connectionMethod = 'getAddresses'
        console.log('Trying getAddresses method')
        try {
          const addresses = await provider.getAddresses()
          if (addresses && addresses.length > 0) {
            authResponse = { addresses }
            console.log('getAddresses succeeded')
          }
        } catch (getAddressesError) {
          console.warn('getAddresses method failed:', getAddressesError)
          authResponse = null
        }
      }
      
      if (!authResponse) {
        const availableMethods = Object.keys(provider).filter(key => 
          ['showConnect', 'connect', 'request', 'getAddresses'].includes(key) && 
          typeof provider[key] === 'function'
        )
        
        console.warn(`All connection methods failed. Tried: ${connectionMethod}. Available methods: ${availableMethods.join(', ')}`)
        
        // For development/testing, provide a mock connection option
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: offering mock connection')
          const shouldUseMock = confirm(
            'Wallet connection failed. Would you like to use a mock wallet for testing?\n\n' +
            'This will simulate a successful connection with a test address.'
          )
          
          if (shouldUseMock) {
            authResponse = {
              addresses: ['ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'], // Test address
              mock: true
            }
            connectionMethod = 'mock'
            console.log('Using mock wallet connection')
          }
        }
        
        if (!authResponse) {
          throw new Error(
            `No supported connection method worked.\n\n` +
            `Tried: ${connectionMethod}\n` +
            `Available methods: ${availableMethods.join(', ')}\n\n` +
            `This usually means:\n` +
            `• No wallet extension is properly installed\n` +
            `• The wallet extension is not compatible with this app\n` +
            `• The wallet needs to be updated\n\n` +
            `Please install a compatible Stacks wallet like Leather or Xverse.`
          )
        }
      }

      console.log('Auth response:', authResponse)

      // Handle different response formats
      let address = null
      
      if (authResponse) {
        // Format 1: Stacks Connect response
        if ((authResponse as any).userSession) {
          const userData = (authResponse as any).userSession.loadUserData()
          address = userData?.profile?.stxAddress?.mainnet || 
                   userData?.profile?.stxAddress?.testnet
        }
        // Format 2: Direct addresses array
        else if ((authResponse as any).addresses && Array.isArray((authResponse as any).addresses)) {
          address = (authResponse as any).addresses[0]
        }
        // Format 3: Address in response object
        else if ((authResponse as any).address) {
          address = (authResponse as any).address
        }
        // Format 4: Array response (from request method)
        else if (Array.isArray(authResponse) && authResponse.length > 0) {
          address = authResponse[0]
        }
      }

      if (address) {
        console.log('Successfully connected with address:', address)
        setWalletState({
          isConnected: true,
          userAddress: address,
          error: null,
          isLoading: false
        })
        return true
      } else {
        throw new Error('Could not retrieve wallet address from connection response')
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      setWalletState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
      return false
    }
  }, [provider])

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      userAddress: '',
      error: null,
      isLoading: false
    })
  }, [])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    hasProvider: !!provider
  }
}
