'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Error in Explore page:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            We encountered an error loading the Explore page. Please try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Try again
            </button>
            <Link href="/" className="block w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200">
              Return to home
            </Link>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded text-left overflow-auto">
              <p className="text-sm font-medium text-gray-900">Error details (development only):</p>
              <p className="text-sm text-gray-800 font-mono">{error.message}</p>
              {error.stack && (
                <pre className="mt-2 text-xs text-gray-700 overflow-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 