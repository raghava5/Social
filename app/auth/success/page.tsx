'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthSuccess() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)
  
  useEffect(() => {
    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push('/home')
    }, 3000)
    
    // Update countdown
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [router])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Signup Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your account has been verified. Welcome to Seven Spokes!
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to homepage in {countdown} seconds...
        </p>
      </div>
    </div>
  )
} 