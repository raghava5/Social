import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  // Handle error in URL parameters
  if (error) {
    console.error('Error in auth callback:', { error, errorDescription })
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`, request.url)
    )
  }
  
  if (!code) {
    console.error('Missing verification code')
    return NextResponse.redirect(
      new URL('/login?error=Missing verification code', request.url)
    )
  }
  
  try {
    // Create response to handle cookies
    const response = NextResponse.redirect(
      new URL('/auth/success', request.url)
    )
    
    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set({
                name,
                value,
                ...options
              })
            })
          }
        },
      }
    )
    
    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      
      // Handle expired verification link
      if (exchangeError.message.includes('expired')) {
        return NextResponse.redirect(
          new URL('/login?error=Verification link has expired. Please request a new one.', request.url)
        )
      }
      
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
      )
    }
    
    // Successfully verified, redirect to success page
    return response
  } catch (error: any) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(
      new URL('/login?error=Verification failed. Please try again.', request.url)
    )
  }
} 