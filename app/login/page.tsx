'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { isMockAuthEnabled } from '@/lib/mock-auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, user } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  
  // Ensure redirectTo starts with '/'
  const redirectTo = params?.get('redirectTo') || '/home'
  console.log('Initial redirectTo value:', redirectTo)

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log('User already authenticated, redirecting to:', redirectTo)
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  useEffect(() => {
    if (!params) return

    // Check for verification success or error messages in URL
    const verified = params.get('verified')
    const errorParam = params.get('error')
    const redirectTo = params.get('redirectTo')
    
    if (verified === 'true') {
      setSuccessMessage('Email verified successfully! You can now log in.')
    }
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }

    // Store redirectTo in sessionStorage if present
    if (redirectTo) {
      sessionStorage.setItem('loginRedirectTo', redirectTo)
    }
  }, [params])

  // Reset error message when inputs change
  useEffect(() => {
    if (error) {
      setError('')
    }
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      // Basic validation
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password')
        setIsLoading(false)
        return
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address')
        setIsLoading(false)
        return
      }

      // Get stored redirect path
      const redirectTo = sessionStorage.getItem('loginRedirectTo')
      console.log('Attempting sign in with redirect to:', redirectTo || '/home')

      const { success, error } = await signIn(email, password, redirectTo || undefined)

      if (!success) {
        let errorMessage = error || 'Failed to sign in'
        
        // Make error messages more user-friendly
        if (error?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password'
        } else if (error?.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email before signing in'
        }
        
        setError(errorMessage)
        return
      }

      // Clear stored redirect path on successful login
      sessionStorage.removeItem('loginRedirectTo')
      
      // Show success message briefly before redirect
      setSuccessMessage('Login successful!')
      
      // Redirect is handled by the auth context
    } catch (err: any) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            create a new account
          </Link>
        </p>
        {isMockAuthEnabled && (
          <div className="mt-2 text-center text-sm text-indigo-600 font-medium">
            Development Mode: Using mock authentication
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 mb-4 rounded text-sm">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 mb-4 rounded text-sm">
              {successMessage}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  disabled={isLoading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10 ${
                    error ? 'border-red-300' : 'border-gray-300'
                  } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-end mt-2">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  tabIndex={isLoading ? -1 : 0}
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 