import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password']

// Determine if we're in development
const isDevelopment = process.env.NODE_ENV === 'development'

// Only use mock auth if explicitly in development and no valid credentials
const hasSuabaseCredentials = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-url.supabase.co'

const useMockAuth = isDevelopment && !hasSuabaseCredentials

export async function middleware(request: NextRequest) {
  // Initialize response
  const res = NextResponse.next()
  
  // Get the pathname from the request
  const { pathname } = request.nextUrl
  
  // Skip auth check completely in development with mock auth
  if (useMockAuth) {
    console.log('Using mock auth middleware')
    // Only redirect logged-in users from login/signup in mock mode
    // This requires checking cookies to see if we have a mock session
    const hasMockSession = request.cookies.get('mock_auth_session')?.value === 'true'
    
    if (hasMockSession && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    
    return res
  }
  
  // Check if we have Supabase credentials
  if (!hasSuabaseCredentials) {
    console.warn('Supabase credentials not found. Authentication checks are disabled.')
    return res
  }
  
  try {
    // Create Supabase client for middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
          set: (name, value, options) => {
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove: (name, options) => {
            res.cookies.delete({
              name,
              ...options,
            })
          },
        },
      }
    )
    
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    // If the route is public, allow access
    if (publicRoutes.includes(pathname)) {
      // If user is logged in and trying to access login/signup pages, redirect to home
      if (session && (pathname === '/login' || pathname === '/signup')) {
        return NextResponse.redirect(new URL('/home', request.url))
      }
      return res
    }
    
    // If user is not authenticated and trying to access a protected route, redirect to login
    if (!session) {
      // Store original URL to redirect after login
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      
      return NextResponse.redirect(redirectUrl)
    }
  } catch (error) {
    console.error('Error in auth middleware:', error)
    
    // In development, allow access even if auth fails
    if (isDevelopment) {
      return res
    }
    
    // In production, redirect to login for protected routes
    if (!publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // User is authenticated and accessing a protected route, allow access
  return res
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api routes that are publicly accessible
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/public).*)',
  ],
} 