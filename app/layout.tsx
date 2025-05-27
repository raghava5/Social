import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import { AuthProvider } from '@/context/AuthContext'
import ClientMainLayout from './components/ClientMainLayout'
import OptimizedErrorBoundary from '@/components/ErrorBoundaryOptimized'
import '@/lib/error-handler-global' // Auto-initialize global error handler

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Social Network',
  description: 'Connect and share with friends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <OptimizedErrorBoundary>
          <AuthProvider>
            <ClientMainLayout>{children}</ClientMainLayout>
          </AuthProvider>
        </OptimizedErrorBoundary>
      </body>
    </html>
  )
}
