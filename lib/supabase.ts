import { createBrowserClient } from '@supabase/ssr'
import { mockAuthClient, isMockAuthEnabled } from './mock-auth'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // Only use mock auth if explicitly desired and no valid credentials
  if (isMockAuthEnabled && (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project-url.supabase.co')) {
    console.log('Using mock authentication for development')
    return mockAuthClient
  }

  // Use real Supabase client
  console.log('Using real Supabase authentication')
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
} 