'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import TopNav from './TopNav'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

// Routes that should not show navigation and sidebars
const publicRoutes = ['/', '/login', '/signup']

export default function ClientMainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const isPublicRoute = publicRoutes.includes(pathname || '')
  const isForgotPassword = pathname === '/forgot-password'
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname || '')
  const isHomeUpdated = pathname === '/home-updated'
  const isHomePage = pathname === '/home'

  // Detect fullscreen mode from URL parameters or localStorage
  useEffect(() => {
    // Check if current route is home or home-updated (which have fullscreen capability)
    if (isHomeUpdated || isHomePage) {
      // Listen for fullscreen mode changes from the page
      const handleFullscreenChange = () => {
        const fullscreenMode = localStorage.getItem('viewMode') === 'fullscreen'
        setIsFullscreen(fullscreenMode)
      }
      
      // Initial check
      handleFullscreenChange()
      
      // Listen for storage changes
      window.addEventListener('storage', handleFullscreenChange)
      
      // Also listen for custom event from the page
      window.addEventListener('viewModeChange', handleFullscreenChange)
      
      // Check for fullscreen on interval (more robust detection)
      const interval = setInterval(handleFullscreenChange, 100)
      
      return () => {
        window.removeEventListener('storage', handleFullscreenChange)
        window.removeEventListener('viewModeChange', handleFullscreenChange)
        clearInterval(interval)
      }
    } else {
      setIsFullscreen(false)
    }
  }, [pathname, isHomeUpdated, isHomePage])

  if (isPublicRoute) {
    return children
  }

  // If in fullscreen mode, return only the children without any layout
  if (isFullscreen) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {(isAuthPage || !isPublicRoute) && <TopNav />}
      {!isForgotPassword && !isAuthPage && (isHomeUpdated || isHomePage) && <LeftSidebar />}
      {!isForgotPassword && !isAuthPage && (isHomeUpdated || isHomePage) && <RightSidebar />}
      
      <main className={`${(!isForgotPassword && !isAuthPage && (isHomeUpdated || isHomePage)) ? 'lg:pl-64 lg:pr-80' : ''} ${isAuthPage ? '' : 'pt-16'}`}>
        <div className={`${(!isForgotPassword && !isAuthPage && (isHomeUpdated || isHomePage)) ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : (!isForgotPassword && !isAuthPage) ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  )
} 