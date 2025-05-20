'use client'

import { usePathname } from 'next/navigation'
import TopNav from './TopNav'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

// Routes that should not show navigation and sidebars
const publicRoutes = ['/', '/login', '/signup']

export default function ClientMainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicRoute = publicRoutes.includes(pathname || '')
  const isForgotPassword = pathname === '/forgot-password'
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname || '')

  if (isPublicRoute) {
    return children
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {(isAuthPage || !isPublicRoute) && <TopNav />}
      {!isForgotPassword && !isAuthPage && <LeftSidebar />}
      {!isForgotPassword && !isAuthPage && <RightSidebar />}
      
      <main className={`${!isForgotPassword && !isAuthPage ? 'lg:pl-64 lg:pr-80' : ''} ${isAuthPage ? '' : 'pt-16'}`}>
        <div className={`${!isForgotPassword && !isAuthPage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  )
} 