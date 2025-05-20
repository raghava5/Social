import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/auth/callback']

// List of public API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/user',
  '/api/auth/validate-credentials',
  '/api/auth/resend-verification',
  '/socket.io' // Add socket.io to public API routes
]

export async function middleware(request: NextRequest) {
  // Get the pathname from the request
  const { pathname } = request.nextUrl
  console.log('Middleware processing path:', pathname)
  
  // Allow public API routes and socket.io without authentication
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    console.log('Public API route accessed:', pathname)
    return NextResponse.next()
  }

  // Create response to handle cookies
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  try {
    // Create Supabase client for middleware
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
                ...options,
              })
            })
          }
        },
      }
    )
    
    // Get session - this is the only check we need
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session status:', !!session)
    
    // If the route is public, allow access
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      console.log('Public route accessed:', pathname)
      // If user is logged in and trying to access login/signup pages, redirect to home
      if (session && (pathname === '/login' || pathname === '/signup')) {
        console.log('Authenticated user accessing login/signup, redirecting to home')
        return NextResponse.redirect(new URL('/home', request.url))
      }
      return response
    }
    
    // If user is not authenticated and trying to access a protected route, redirect to login
    if (!session) {
      console.log('Unauthenticated user accessing protected route:', pathname)
      // Store original URL to redirect after login
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      
      return NextResponse.redirect(redirectUrl)
    }
  } catch (error) {
    console.error('Error in auth middleware:', error)
    
    // In production, redirect to login for protected routes
    if (!publicRoutes.some(route => pathname.startsWith(route)) && 
        !publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // User is authenticated and accessing a protected route, allow access
  console.log('Access granted to protected route:', pathname)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 