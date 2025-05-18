'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const { signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      await signOut()
      router.push('/login')
    }

    performLogout()
  }, [signOut, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Logging out...</p>
    </div>
  )
} 