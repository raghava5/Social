'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { isMockAuthEnabled } from '@/lib/mock-auth'
import Cookies from 'js-cookie'

// Define the shape of our auth context
interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create the auth provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      setIsLoading(true)
      
      try {
        // Check active session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        if (session) {
          setSession(session)
          setUser(session.user)
          
          // Set mock auth cookie for middleware if using mock auth
          if (isMockAuthEnabled) {
            Cookies.set('mock_auth_session', 'true', { path: '/' })
          }
        }
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event)
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setIsLoading(false)
      
      // Update mock auth cookie
      if (isMockAuthEnabled) {
        if (event === 'SIGNED_IN' && newSession) {
          Cookies.set('mock_auth_session', 'true', { path: '/' })
        } else if (event === 'SIGNED_OUT') {
          Cookies.remove('mock_auth_session', { path: '/' })
        }
      }
      
      // Optional: Redirect based on auth events
      if (event === 'SIGNED_IN') {
        router.push('/home')
      }
      if (event === 'SIGNED_OUT') {
        router.push('/')
      }
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  // Sign up function
  const signUp = async (email: string, password: string, userData?: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      // For mock auth, create session immediately since we don't have email verification
      if (isMockAuthEnabled && data.user) {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (signInData.session) {
          setSession(signInData.session)
          setUser(signInData.user)
          Cookies.set('mock_auth_session', 'true', { path: '/' })
        }
      }
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'An unknown error occurred' }
    }
  }

  // Sign in function
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      // Update mock auth cookie
      if (isMockAuthEnabled && data.session) {
        Cookies.set('mock_auth_session', 'true', { path: '/' })
      }
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' }
    }
  }

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut()
    
    // Remove mock auth cookie
    if (isMockAuthEnabled) {
      Cookies.remove('mock_auth_session', { path: '/' })
    }
    
    // Always reset the user and session state
    setUser(null)
    setSession(null)
    
    // Redirect is also handled by the auth state change listener
    // but we include it here for extra reliability
    router.push('/')
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut
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