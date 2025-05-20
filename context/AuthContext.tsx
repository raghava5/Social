'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

// Define the shape of our auth context
interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string, redirectTo?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password']

// Create the auth provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Handle auth state changes and routing
  const handleAuthChange = async (event: string, newSession: Session | null) => {
    console.log('Auth state changed:', event, !!newSession)
    
    // Only update state if the event is not a token refresh
    if (event !== 'TOKEN_REFRESHED') {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setIsLoading(false)

      // Handle routing based on auth state
      const currentPath = pathname || '/'
      const isPublicRoute = publicRoutes.includes(currentPath)

      if (event === 'SIGNED_OUT' && !isPublicRoute) {
        console.log('User signed out, redirecting to login')
        router.push('/login')
      }
    }
  }

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          return
        }
        
        // Handle initial session state
        await handleAuthChange(session ? 'INITIAL_SESSION' : 'SIGNED_OUT', session)
        
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname, supabase])

  // Sign up function
  const signUp = async (email: string, password: string, userData?: any): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Starting signup process with:', { email, userData })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            email,
            email_verified: false,
            phone_verified: false
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      })
      console.log('signUp result:', { data, error })
      
      if (error) {
        console.error('Supabase auth signup error:', error)
        return { success: false, error: error.message }
      }
      
      // Check if confirmation email was sent
      if (data?.user?.identities?.length === 0) {
        return { success: false, error: 'Email already registered. Please login or reset your password.' }
      }

      // If user was created and confirmation email sent
      if (data.user && !data.session) {
        return { success: true } // Email confirmation required
      }
      
      // If Supabase signup is successful and session exists (auto-confirm enabled)
      if (data.user && data.session) {
        try {
          console.log('Supabase signup successful, calling API to create user in database')
          // Call the API to create a user in Prisma
          const response = await fetch('/api/auth/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: data.user.id,
              email,
              userData
            }),
          })
          
          console.log('API response status:', response.status)
          
          const responseData = await response.json()
          console.log('API response data:', responseData)
          
          if (!response.ok) {
            console.error('Failed to create user in database:', responseData)
            return { success: false, error: 'Failed to create user profile' }
          }
          
          console.log('User successfully created in database')
          return { success: true }
        } catch (dbError) {
          console.error('Error creating user in database:', dbError)
          return { success: false, error: 'Failed to create user profile' }
        }
      }
      
      return { success: true }
    } catch (error: any) {
      console.error('signUp exception:', error)
      return { success: false, error: error.message || 'An unknown error occurred' }
    }
  }

  // Sign in function
  const signIn = async (email: string, password: string, redirectTo?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Starting sign in process for:', email)

      // Check if email is empty or invalid format
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Please enter a valid email address' }
      }

      // Check if password is empty
      if (!password) {
        return { success: false, error: 'Please enter your password' }
      }

      // Attempt Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      // Log detailed auth result
      console.log('Supabase auth result:', { 
        success: !!data?.session,
        hasError: !!error,
        errorMessage: error?.message,
        user: data?.user ? {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at
        } : null
      })

      if (error) {
        console.error('Supabase auth error:', error)
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please verify your email before signing in' }
        }
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password' }
        }
        return { success: false, error: error.message }
      }

      if (!data?.session || !data?.user) {
        console.error('No session or user data returned')
        return { success: false, error: 'Authentication failed' }
      }

      // If email is not confirmed, don't proceed
      if (!data.user.email_confirmed_at) {
        console.log('Email not confirmed for user:', data.user.email)
        return { success: false, error: 'Please verify your email before signing in' }
      }

      // Update session state
      setSession(data.session)
      setUser(data.user)

      // Handle redirection
      if (redirectTo && redirectTo !== '/login' && redirectTo !== '/signup') {
        console.log('Redirecting to:', redirectTo)
        router.push(redirectTo)
      } else {
        router.push('/home')
      }

      return { success: true }
    } catch (error: any) {
      console.error('Unexpected error during sign in:', error)
      return { success: false, error: error.message || 'An unexpected error occurred' }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      
      // Clear all auth state
      setUser(null)
      setSession(null)
      
      // Clear any other auth-related storage
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()
      
      // Auth state change will handle the redirect
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  // Reset password function
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Starting password reset for:', email)

      // Check if email is valid
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Please enter a valid email address' }
      }

      // Check if user exists first
      try {
        const { data, error: checkError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        
        console.log('Password reset attempt result:', {
          success: !checkError,
          error: checkError?.message,
          data
        })
        
        if (checkError) {
          console.error('Error sending reset instructions:', checkError)
          if (checkError.message.includes('Email not found')) {
            return { success: false, error: 'No account found with this email address' }
          }
          return { success: false, error: checkError.message }
        }
        
        return { success: true }
      } catch (error: any) {
        console.error('Unexpected error during password reset:', {
          error: error.message,
          stack: error.stack
        })
        return { success: false, error: error.message || 'Failed to send reset instructions' }
      }
    } catch (error: any) {
      console.error('Error in resetPassword:', error)
      return { success: false, error: 'Failed to process password reset request' }
    }
  }

  // Update the value object to include resetPassword
  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 