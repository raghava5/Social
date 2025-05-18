// Mock authentication service for development purposes
// This simulates Supabase auth functionality without requiring a real Supabase project

import { User, Session } from '@supabase/supabase-js'

// Simple in-memory storage
const users: Record<string, { email: string; password: string; user: User; userData: any }> = {}
let currentSession: Session | null = null

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development'
const useMockAuth = isDev && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-url'))

// Mock Supabase auth client
export const mockAuthClient = {
  auth: {
    // Sign up with email and password
    signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: any } }) => {
      if (!useMockAuth) {
        throw new Error('Mock auth is disabled')
      }

      // Validate email and password
      if (!email || !password) {
        return {
          data: { user: null, session: null },
          error: { message: 'Email and password are required' }
        }
      }

      // Check if user already exists
      if (users[email]) {
        return {
          data: { user: null, session: null },
          error: { message: 'User already exists' }
        }
      }

      // Create mock user
      const userData = options?.data || {}
      const user: User = {
        id: `mock-${Date.now()}`,
        app_metadata: {},
        user_metadata: userData,
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: email,
        email_confirmed_at: new Date().toISOString(),
        phone: '',
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: '',
        updated_at: new Date().toISOString()
      }

      // Store user
      users[email] = { email, password, user, userData }

      // Create a mock session in real implementation
      // For development, we'll just say it's successful
      return {
        data: { 
          user,
          session: null // No session on signup (would require email confirmation)
        },
        error: null
      }
    },

    // Sign in with email and password
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (!useMockAuth) {
        throw new Error('Mock auth is disabled')
      }

      // Check if user exists
      const user = users[email]
      if (!user) {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid email or password' }
        }
      }

      // Check password
      if (user.password !== password) {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid email or password' }
        }
      }

      // Create mock session
      const session: Session = {
        access_token: `mock-token-${Date.now()}`,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: `mock-refresh-${Date.now()}`,
        user: user.user,
        expires_at: Math.floor(Date.now() / 1000) + 3600
      }

      // Set as current session
      currentSession = session

      // Return success
      return {
        data: { user: user.user, session },
        error: null
      }
    },

    // Sign out
    signOut: async () => {
      if (!useMockAuth) {
        throw new Error('Mock auth is disabled')
      }

      currentSession = null
      return { error: null }
    },

    // Get current session
    getSession: async () => {
      if (!useMockAuth) {
        throw new Error('Mock auth is disabled')
      }

      return { data: { session: currentSession }, error: null }
    },

    // Listen for auth state changes
    onAuthStateChange: (callback: any) => {
      if (!useMockAuth) {
        throw new Error('Mock auth is disabled')
      }

      // In a real implementation, this would set up event listeners
      // For our mock, we'll just return a no-op unsubscribe function
      return {
        data: { 
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    }
  }
}

// Export flag to check if mock auth is enabled
export const isMockAuthEnabled = useMockAuth 