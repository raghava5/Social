import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import { AuthProvider } from '@/context/AuthContext'
import ClientMainLayout from './components/ClientMainLayout'

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
        <AuthProvider>
          <ClientMainLayout>{children}</ClientMainLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
