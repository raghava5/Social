import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (!code) {
    // Redirect to login page with error
    return NextResponse.redirect(
      new URL(`/login?error=Missing verification code`, request.url)
    )
  }
  
  try {
    // Create response to handle cookies
    const response = NextResponse.redirect(
      new URL('/login?verified=true', request.url)
    )
    
    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name, 
              value,
              ...options
            })
          },
          remove(name: string, options: any) {
            response.cookies.delete({
              name,
              ...options
            })
          },
        },
      }
    )
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }
    
    // Successfully verified, redirect to login page with success message
    return response
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(
      new URL('/login?error=Verification failed', request.url)
    )
  }
} 