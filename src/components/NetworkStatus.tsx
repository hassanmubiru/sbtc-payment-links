'use client'

import { useState, useEffect } from 'react'
import { Activity, Server, Clock, Users } from 'lucide-react'
import { getNetworkInfo, getCurrentBlockHeight } from '@/utils/stacksApi'

interface NetworkStats {
  networkId: string
  chainId: string
  blockHeight: number
  burnBlockHeight: number
  peerVersion: string
  poxConsensus?: string
}

export default function NetworkStatus() {
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by only showing content after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchNetworkInfo = async () => {
    if (!isMounted) return
    
    try {
      setError(null)
      
      // Try to fetch network info with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      console.log('Fetching network info...')
      
      const [networkInfo, blockHeight] = await Promise.race([
        Promise.all([
          getNetworkInfo().catch((err) => {
            console.warn('Network info failed:', err)
            return null
          }),
          getCurrentBlockHeight().catch((err) => {
            console.warn('Block height failed:', err)
            return null
          })
        ]),
        timeoutPromise
      ]) as [any, number | null]

      console.log('Network info response:', { networkInfo, blockHeight })

      if (networkInfo) {
        const stats: NetworkStats = {
          networkId: String(networkInfo.network_id || 'Unknown'),
          chainId: networkInfo.burn_block_height ? 'Mainnet' : 'Testnet',
          blockHeight: Number(blockHeight || networkInfo.stacks_tip_height || 0),
          burnBlockHeight: Number(networkInfo.burn_block_height || 0),
          peerVersion: String(networkInfo.peer_version || 'Unknown'),
          poxConsensus: networkInfo.pox_consensus
        }
        setNetworkStats(stats)
        setLastUpdated(new Date())
        console.log('Network stats updated:', stats)
      } else {
        // If no network info, create a fallback status
        console.log('Using fallback network data')
        setNetworkStats({
          networkId: 'Mainnet',
          chainId: 'Mainnet',
          blockHeight: 0,
          burnBlockHeight: 0,
          peerVersion: 'Unknown',
        })
        setError('API temporarily unavailable')
      }
    } catch (error) {
      console.warn('Error fetching network info:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(`Connection failed: ${errorMessage}`)
      // Set fallback data
      setNetworkStats({
        networkId: 'Mainnet',
        chainId: 'Mainnet',
        blockHeight: 0,
        burnBlockHeight: 0,
        peerVersion: 'Unknown',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isMounted) return
    
    fetchNetworkInfo()
    
    // Update every 30 seconds
    const interval = setInterval(fetchNetworkInfo, 30000)
    return () => clearInterval(interval)
  }, [isMounted])

  const formatPeerVersion = (version: string): string => {
    if (!version || typeof version !== 'string') return 'Unknown'
    const parts = version.split('/')
    return parts.length > 0 ? parts[0] : version
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error || !networkStats) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center text-red-600">
          <Server className="h-5 w-5 mr-2" />
          <span className="text-sm">{error || 'Unable to connect to Stacks network'}</span>
        </div>
        <button 
          onClick={fetchNetworkInfo}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-green-500" />
          Network Status
        </h3>
        <div className="flex items-center text-green-600">
          <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
            error ? 'bg-yellow-500' : 'bg-green-500'
          }`}></div>
          <span className="text-xs">{error ? 'Offline' : 'Live'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Server className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Network</p>
              <p className="text-sm font-medium">{networkStats.chainId}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Block Height</p>
              <p className="text-sm font-medium">
                {networkStats.blockHeight > 0 ? networkStats.blockHeight.toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Burn Height</p>
              <p className="text-sm font-medium">
                {networkStats.burnBlockHeight > 0 ? networkStats.burnBlockHeight.toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <Activity className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Version</p>
              <p className="text-sm font-medium">{formatPeerVersion(networkStats.peerVersion)}</p>
            </div>
          </div>
        </div>
      </div>

      {lastUpdated && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-2 text-center">
          <p className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded inline-block">
            {error}
          </p>
        </div>
      )}
    </div>
  )
}
