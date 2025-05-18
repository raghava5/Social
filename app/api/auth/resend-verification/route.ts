import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the email from the request body
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // Create response to handle cookies
    const response = NextResponse.json({
      message: 'Verification email sent'
    })
    
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
    
    // Send verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    })
    
    if (error) {
      console.error('Error resending verification email:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'Verification email sent successfully!'
    })
  } catch (error) {
    console.error('Error in verification API:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
} 