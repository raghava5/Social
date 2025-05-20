import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  
  // Get all methods from the auth object
  const authMethods = Object.getOwnPropertyNames(supabase.auth)
  
  // Filter out internal methods
  const publicMethods = authMethods.filter(method => !method.startsWith('_'))
  
  return NextResponse.json({
    authMethods: publicMethods
  })
} 