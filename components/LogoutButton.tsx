'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

interface LogoutButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'text'
}

export default function LogoutButton({ 
  className = '', 
  variant = 'primary' 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signOut } = useAuth()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut()
      // Redirect is handled by the auth context
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Define button styles based on variant
  let buttonStyle = ''
  
  switch (variant) {
    case 'primary':
      buttonStyle = 'bg-indigo-600 hover:bg-indigo-700 text-white'
      break
    case 'secondary':
      buttonStyle = 'bg-gray-200 hover:bg-gray-300 text-gray-800'
      break
    case 'text':
      buttonStyle = 'bg-transparent hover:text-indigo-700 text-gray-700'
      break
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${buttonStyle} ${
        isLoading ? 'opacity-75 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isLoading ? 'Signing out...' : 'Sign out'}
    </button>
  )
} 