'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isVerificationSent, setIsVerificationSent] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    setIsSuccess(false)
    setIsVerificationSent(false)

    try {
      // Basic validation
      if (password.length < 8) {
        setError('Password must be at least 8 characters')
        setIsLoading(false)
        return
      }

      const { success, error } = await signUp(email, password, {
        name,
        avatar_url: null
      })

      if (!success) {
        setError(error || 'Failed to create account')
        return
      }

      setIsSuccess(true)
      setIsVerificationSent(true)
      setRegisteredEmail(email)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!registeredEmail) return
    
    setResendLoading(true)
    setResendSuccess(false)
    setError(null)
    
    try {
      // Make sure to use the absolute path that matches your deployed app structure
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: registeredEmail })
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to resend verification email: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 text-red-800 p-3 mb-4 rounded text-sm">
              {error}
            </div>
          )}
          
          {isSuccess && (
            <div className="bg-green-50 text-green-800 p-4 mb-6 rounded">
              <h3 className="text-sm font-medium">Registration successful!</h3>
              <p className="text-sm mt-2">
                Please check your email ({registeredEmail}) to verify your account.
              </p>
              {isVerificationSent && (
                <div className="mt-4">
                  <p className="text-sm mb-2">Didn't receive the email?</p>
                  <button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-xs bg-green-100 hover:bg-green-200 text-green-800 py-1 px-2 rounded transition-colors"
                  >
                    {resendLoading ? 'Sending...' : 'Resend verification email'}
                  </button>
                  {resendSuccess && (
                    <p className="text-xs mt-2 text-green-700">Verification email resent!</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {!isSuccess && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

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
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 