'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function DebugPage() {
  const { user, session, isLoading, signIn } = useAuth()
  const [storedUsers, setStoredUsers] = useState<any>(null)
  const [storedSession, setStoredSession] = useState<any>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const [mockCookie, setMockCookie] = useState<string | null>(null)
  const [isDevMode, setIsDevMode] = useState<boolean>(false)

  useEffect(() => {
    // Only run in browser
    if (typeof window !== 'undefined') {
      try {
        // Check localStorage for mock auth data
        const usersJson = localStorage.getItem('mock_auth_users')
        const sessionJson = localStorage.getItem('mock_auth_session')
        const mockAuthCookie = document.cookie.split('; ').find(row => row.startsWith('mock_auth_session='))
        
        setStoredUsers(usersJson ? JSON.parse(usersJson) : null)
        setStoredSession(sessionJson ? JSON.parse(sessionJson) : null)
        setMockCookie(mockAuthCookie ? mockAuthCookie.split('=')[1] : null)
        setIsDevMode(process.env.NODE_ENV === 'development')
      } catch (error) {
        console.error('Error reading localStorage:', error)
      }
    }
  }, [refreshCount])
  
  const refreshData = () => {
    setRefreshCount(count => count + 1)
  }
  
  const clearMockAuthData = () => {
    localStorage.removeItem('mock_auth_users')
    localStorage.removeItem('mock_auth_session')
    refreshData()
  }
  
  const testLogin = async () => {
    try {
      // Attempt to sign in with test credentials
      console.log('Attempting test login')
      const result = await signIn('test@example.com', 'password123')
      console.log('Test login result:', result)
      refreshData()
    } catch (error) {
      console.error('Test login error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>
        
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Authentication State</h2>
            <p className="mb-2"><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p className="mb-2"><strong>Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">User Data:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {user ? JSON.stringify(user, null, 2) : 'Not authenticated'}
              </pre>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Session Data:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {session ? JSON.stringify(session, null, 2) : 'No session'}
              </pre>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Mock Auth Storage</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Environment:</h3>
              <p><strong>Development Mode:</strong> {isDevMode ? 'Yes' : 'No'}</p>
              <p><strong>Mock Auth Cookie:</strong> {mockCookie || 'Not set'}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Stored Users:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {storedUsers ? JSON.stringify(storedUsers, null, 2) : 'No stored users'}
              </pre>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Stored Session:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                {storedSession ? JSON.stringify(storedSession, null, 2) : 'No stored session'}
              </pre>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <button 
                onClick={refreshData}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh Data
              </button>
              
              <button 
                onClick={clearMockAuthData}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear Mock Auth Data
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Navigation</h2>
            <div className="space-x-4">
              <Link 
                href="/login" 
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 inline-block"
              >
                Go to Login
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 inline-block"
              >
                Go to Signup
              </Link>
              <Link 
                href="/home" 
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 inline-block"
              >
                Go to Home
              </Link>
              <button
                onClick={testLogin}
                className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 inline-block"
              >
                Test Login (test@example.com)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 