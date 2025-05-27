'use client'

import { useEffect, useState } from 'react'

interface ClientHydrationWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * ClientHydrationWrapper prevents hydration mismatches by only rendering 
 * children on the client side after initial hydration is complete.
 */
export default function ClientHydrationWrapper({ 
  children, 
  fallback = null 
}: ClientHydrationWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 