'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center',
          padding: '0 1rem'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 600 }}>
            Application Error
          </h2>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
            Sorry, something went wrong with the application.
          </p>
          <button
            onClick={reset}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
} 