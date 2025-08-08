import { StacksNetwork, StacksMainnet, StacksTestnet } from '@stacks/network'

export interface StacksApiConfig {
  network: StacksNetwork
  apiUrl: string
}

export interface AddressBalance {
  stx: {
    balance: string
    total_sent: string
    total_received: string
    lock_tx_id: string
    locked: string
    lock_height: number
    burnchain_lock_height: number
    burnchain_unlock_height: number
  }
  fungible_tokens: Record<string, any>
  non_fungible_tokens: Record<string, any>
}

export interface Transaction {
  tx_id: string
  tx_status: string
  tx_type: string
  fee_rate: string
  sender_address: string
  sponsored: boolean
  post_condition_mode: string
  block_hash: string
  block_height: number
  burn_block_time: number
  canonical: boolean
  microblock_canonical: boolean
  microblock_sequence: number
  microblock_hash: string
  parent_microblock_hash: string
  is_unanchored: boolean
  anchor_mode: string
  events: any[]
}

export interface TransactionList {
  limit: number
  offset: number
  total: number
  results: Transaction[]
}

// Get Stacks network configuration
export function getStacksConfig(): StacksApiConfig {
  const networkName = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'mainnet'
  const apiUrl = process.env.NEXT_PUBLIC_STACKS_API_URL || 
    (networkName === 'mainnet' 
      ? 'https://stacks-node-api.mainnet.stacks.co'
      : 'https://stacks-node-api.testnet.stacks.co')

  const network = networkName === 'mainnet' ? new StacksMainnet() : new StacksTestnet()

  return {
    network,
    apiUrl
  }
}

// Validate Stacks address using the API
export async function validateStacksAddressWithApi(address: string): Promise<boolean> {
  const { apiUrl } = getStacksConfig()
  const endpoints = [
    `${apiUrl}/extended/v1/address/${address}/balances`,
    // Fallback to different API nodes
    `https://api.hiro.so/extended/v1/address/${address}/balances`,
    `https://stacks-node-api.mainnet.stacks.co/extended/v1/address/${address}/balances`
  ]

  for (const endpoint of endpoints) {
    try {
      console.log('Trying address validation from:', endpoint)
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      })
      
      console.log('Address validation response status:', response.status, 'from', endpoint)
      
      // If we get a 200 response, the address exists and is valid
      if (response.ok) {
        return true
      }
      
      // 404 means address not found but could still be valid format
      if (response.status === 404) {
        return false // Address format may be valid but not found on blockchain
      }
      
      // Other errors suggest invalid format or network issues, try next endpoint
      continue
    } catch (error) {
      console.warn(`Address validation failed from ${endpoint}:`, error)
      continue
    }
  }

  console.warn('All address validation endpoints failed, falling back to format validation')
  // On network error, don't fail validation - let format validation handle it
  return true // Assume valid if we can't reach any API
}

// Get address balance from Stacks API
export async function getAddressBalance(address: string): Promise<AddressBalance | null> {
  const { apiUrl } = getStacksConfig()
  const endpoints = [
    `${apiUrl}/extended/v1/address/${address}/balances`,
    // Fallback to different API nodes
    `https://api.hiro.so/extended/v1/address/${address}/balances`,
    `https://stacks-node-api.mainnet.stacks.co/extended/v1/address/${address}/balances`
  ]

  for (const endpoint of endpoints) {
    try {
      console.log('Trying balance from:', endpoint)
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      })
      
      console.log('Balance response status:', response.status, 'from', endpoint)
      
      if (response.ok) {
        const balance: AddressBalance = await response.json()
        console.log('Balance data:', balance)
        return balance
      }
    } catch (error) {
      console.warn(`Error fetching balance from ${endpoint}:`, error)
      continue
    }
  }

  console.warn('All balance endpoints failed')
  return null
}

// Get address transactions from Stacks API
export async function getAddressTransactions(
  address: string, 
  limit: number = 20, 
  offset: number = 0
): Promise<TransactionList | null> {
  const { apiUrl } = getStacksConfig()
  const endpoints = [
    `${apiUrl}/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`,
    // Fallback to different API nodes
    `https://api.hiro.so/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`,
    `https://stacks-node-api.mainnet.stacks.co/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`
  ]

  for (const endpoint of endpoints) {
    try {
      console.log('Trying transactions from:', endpoint)
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      })
      
      console.log('Transactions response status:', response.status, 'from', endpoint)
      
      if (response.ok) {
        const transactions: TransactionList = await response.json()
        console.log('Transactions data:', transactions)
        return transactions
      }
    } catch (error) {
      console.warn(`Error fetching transactions from ${endpoint}:`, error)
      continue
    }
  }

  console.warn('All transaction endpoints failed')
  return null
}

// Get transaction details by ID
export async function getTransactionById(txId: string): Promise<Transaction | null> {
  try {
    const { apiUrl } = getStacksConfig()
    const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`)
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const transaction: Transaction = await response.json()
    return transaction
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return null
  }
}

// Get current block height
export async function getCurrentBlockHeight(): Promise<number | null> {
  const { apiUrl } = getStacksConfig()
  const endpoints = [
    `${apiUrl}/extended/v1/block`,
    // Fallback to different API nodes
    'https://api.hiro.so/extended/v1/block',
    'https://stacks-node-api.mainnet.stacks.co/extended/v1/block'
  ]

  for (const endpoint of endpoints) {
    try {
      console.log('Trying block height from:', endpoint)
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      })
      
      console.log('Block height response status:', response.status, 'from', endpoint)
      
      if (response.ok) {
        const data = await response.json()
        const height = data.results?.[0]?.height
        console.log('Block height data:', height)
        return height || null
      }
    } catch (error) {
      console.warn(`Error fetching block height from ${endpoint}:`, error)
      continue
    }
  }

  console.warn('All block height endpoints failed')
  return null
}

// Get network info
export async function getNetworkInfo(): Promise<any> {
  const { apiUrl } = getStacksConfig()
  const endpoints = [
    `${apiUrl}/v2/info`,
    // Fallback to different API nodes if the primary fails
    'https://api.hiro.so/v2/info',
    'https://stacks-node-api.mainnet.stacks.co/v2/info'
  ]

  for (const endpoint of endpoints) {
    try {
      console.log('Trying network info from:', endpoint)
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      })
      
      console.log('Network info response status:', response.status, 'from', endpoint)
      
      if (response.ok) {
        const info = await response.json()
        console.log('Network info data:', info)
        return info
      }
    } catch (error) {
      console.warn(`Error fetching network info from ${endpoint}:`, error)
      continue
    }
  }

  console.warn('All network info endpoints failed')
  return null
}

// Format STX amount from microSTX
export function formatSTXAmount(microStx: string | number): string {
  const amount = typeof microStx === 'string' ? parseInt(microStx) : microStx
  return (amount / 1000000).toFixed(6)
}

// Convert STX to microSTX
export function stxToMicroStx(stx: string | number): number {
  const amount = typeof stx === 'string' ? parseFloat(stx) : stx
  return Math.floor(amount * 1000000)
}

// Check if address has sufficient balance for payment
export async function checkSufficientBalance(
  address: string, 
  requiredAmount: string
): Promise<{ sufficient: boolean; currentBalance: string; error?: string }> {
  try {
    const balance = await getAddressBalance(address)
    
    if (!balance) {
      return {
        sufficient: false,
        currentBalance: '0',
        error: 'Could not fetch balance'
      }
    }

    const currentStx = formatSTXAmount(balance.stx.balance)
    const required = parseFloat(requiredAmount)
    const current = parseFloat(currentStx)

    return {
      sufficient: current >= required,
      currentBalance: currentStx
    }
  } catch (error) {
    return {
      sufficient: false,
      currentBalance: '0',
      error: 'Error checking balance'
    }
  }
}
