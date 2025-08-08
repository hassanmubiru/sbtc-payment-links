import { useState, useEffect } from 'react'

/**
 * Hook to prevent hydration mismatches by only returning true after the component has mounted on the client
 * This is useful for components that use browser-only APIs or have different behavior on server vs client
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook to safely access window object without hydration issues
 */
export function useWindow() {
  const isClient = useIsClient()
  return isClient ? window : undefined
}

/**
 * Hook to safely access navigator object without hydration issues
 */
export function useNavigator() {
  const isClient = useIsClient()
  return isClient ? navigator : undefined
}
