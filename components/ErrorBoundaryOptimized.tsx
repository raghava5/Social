'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showErrorDetails?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorId?: string
  retryCount: number
}

export default class OptimizedErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null
  private maxRetries = 3
  private retryDelay = 2000

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      retryCount: 0 
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return { 
      hasError: true, 
      error,
      errorId,
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced error logging
    console.group(`🚨 Error Boundary Caught Error [${this.state.errorId}]`)
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Component Stack:', errorInfo.componentStack)
    console.error('Error Stack:', error.stack)
    console.groupEnd()

    // Report error to monitoring service
    this.reportError(error, errorInfo)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Clean up any potential memory leaks caused by the error
    this.cleanupResources(error)
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      console.log('Reporting error to monitoring service...')
      
      // You can integrate with services like:
      // Sentry.captureException(error, { extra: errorInfo })
      // LogRocket.captureException(error)
    }

    // Store error in local storage for debugging
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId
      }
      
      localStorage.setItem(`error_${this.state.errorId}`, JSON.stringify(errorData))
    } catch (e) {
      console.warn('Failed to store error data:', e)
    }
  }

  private cleanupResources(error: Error) {
    // Clean up common sources of memory leaks
    try {
      // Revoke blob URLs
      if (typeof window !== 'undefined') {
        // Clean up any blob URLs that might be hanging around
        const blobUrls = Array.from(document.querySelectorAll('img, video, audio'))
          .map(el => (el as HTMLImageElement | HTMLVideoElement | HTMLAudioElement).src)
          .filter(src => src && src.startsWith('blob:'))
        blobUrls.forEach(url => {
          try {
            URL.revokeObjectURL(url)
          } catch (e) {
            // Ignore revoke errors
          }
        })

        // Clear any intervals/timeouts that might be hanging
        // Note: This is aggressive and might clear legitimate timers
        // Only do this if the error is severe
        if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
          // Clear high-numbered intervals (likely our app's)
          const lastTimeoutId = Number(setTimeout(() => {}, 0))
          for (let i = lastTimeoutId; i > 100; i--) {
            clearTimeout(i)
            clearInterval(i)
          }
        }
      }
    } catch (cleanupError) {
      console.warn('Error during cleanup:', cleanupError)
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.warn('Maximum retry attempts reached')
      return
    }

    console.log(`Retrying... Attempt ${this.state.retryCount + 1}/${this.maxRetries}`)

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }))

    // Add delay before retry to prevent rapid retries
    this.retryTimeout = setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: undefined,
        errorId: undefined
      })
    }, this.retryDelay)
  }

  private handleReload = () => {
    // Force page reload as last resort
    window.location.reload()
  }

  private handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/'
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>
              
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. You can try refreshing the page or returning to the home page.
              </p>

              {/* Action buttons */}
              <div className="space-y-3">
                {this.state.retryCount < this.maxRetries && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    disabled={this.state.retryCount >= this.maxRetries}
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                  </button>
                )}
                
                <button
                  onClick={this.handleReload}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  Reload Page
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
                >
                  Go to Home
                </button>
              </div>

              {/* Error details in development */}
              {(process.env.NODE_ENV === 'development' || this.props.showErrorDetails) && this.state.error && (
                <div className="mt-6 p-4 bg-gray-100 rounded text-left overflow-auto max-h-40">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Error Details (Development):
                  </p>
                  <p className="text-sm text-red-600 font-mono mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-xs text-gray-700 overflow-auto">
                      {this.state.error.stack.split('\n').slice(0, 10).join('\n')}
                    </pre>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Error ID: {this.state.errorId}
                  </p>
                </div>
              )}

              {/* Retry count indicator */}
              {this.state.retryCount > 0 && (
                <div className="mt-4 text-sm text-gray-500">
                  Retry attempt: {this.state.retryCount}/{this.maxRetries}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <OptimizedErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </OptimizedErrorBoundary>
    )
  }
} 