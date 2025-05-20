import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('Validate credentials API called')
    
    // Get credentials from request body
    const { email, userId, supabaseUser } = await request.json()
    console.log('Validating credentials for:', { 
      email, 
      userId,
      supabaseConfirmed: supabaseUser?.emailConfirmed 
    })
    
    if (!email || !userId) {
      console.error('Email and userId are required')
      return NextResponse.json({ 
        valid: false,
        error: 'Email and userId are required' 
      }, { status: 400 })
    }

    // Verify email is confirmed in Supabase
    if (!supabaseUser?.emailConfirmed) {
      console.error('Email not confirmed in Supabase')
      return NextResponse.json({ 
        valid: false, 
        error: 'Please verify your email before signing in' 
      }, { status: 401 })
    }
    
    try {
      // Find user in Prisma database
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { id: userId }
          ]
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          isVerified: true
        }
      })
      
      console.log('User lookup result:', {
        found: !!user,
        matchingId: user?.id === userId,
        matchingEmail: user?.email === email
      })
      
      // If user not found, create a new one
      if (!user) {
        console.log('User not found, creating new user')
        const newUser = await prisma.user.create({
          data: {
            id: userId,
            email: email,
            username: email.split('@')[0],
            isVerified: true,
            passwordHash: 'supabase-auth', // Not used as auth is handled by Supabase
            firstName: '',
            lastName: '',
            profile: {
              create: {} // Create an empty profile
            }
          },
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            isVerified: true
          }
        })
        
        console.log('New user created:', newUser)
        return NextResponse.json({
          valid: true,
          user: newUser
        })
      }

      // If the user exists but IDs don't match, update the ID
      if (user.id !== userId) {
        console.log('Updating user ID to match Supabase ID')
        try {
          await prisma.user.update({
            where: { email },
            data: { id: userId }
          })
          console.log('Successfully updated user ID')
        } catch (updateError) {
          console.error('Failed to update user ID:', updateError)
          // Continue anyway since authentication is valid
        }
      }

      // Update verification status if needed
      if (!user.isVerified && supabaseUser.emailConfirmed) {
        await prisma.user.update({
          where: { email },
          data: { isVerified: true }
        })
        console.log('Updated user verification status')
      }
      
      // Return success with user data
      console.log('Credentials valid, returning user data')
      return NextResponse.json({
        valid: true,
        user: {
          id: userId, // Use the Supabase ID
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: true // Since Supabase confirmed the email
        }
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { valid: false, error: 'Database error occurred' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error validating credentials:', error)
    return NextResponse.json(
      { valid: false, error: error.message || 'Failed to validate credentials' },
      { status: 500 }
    )
  }
} 