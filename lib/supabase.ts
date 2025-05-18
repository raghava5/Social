import { createBrowserClient } from '@supabase/ssr'
import { mockAuthClient, isMockAuthEnabled } from './mock-auth'

export const createClient = () => {
  // Use mock auth client in development if no valid Supabase credentials
  if (isMockAuthEnabled) {
    console.log('Using mock authentication for development')
    return mockAuthClient
  }

  // Use real Supabase client if credentials are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
} 