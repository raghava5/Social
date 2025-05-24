import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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
    const cookieStore = await cookies()
    const response = NextResponse.redirect(new URL('/login', requestUrl.origin))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          }
        }
      }
    )

    await supabase.auth.exchangeCodeForSession(code)
    return response
  } catch (error: any) {
    console.error('Error in auth callback:', error)
    return NextResponse.redirect(
      new URL('/login?error=Verification failed. Please try again.', request.url)
    )
  }
} 