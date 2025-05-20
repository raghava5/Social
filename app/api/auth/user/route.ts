import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  let retries = 0
  
  while (retries < MAX_RETRIES) {
    try {
      console.log(`User creation attempt ${retries + 1}`)
      
      // Get the user data from the request body
      const { email, userData, id } = await request.json()
      console.log('Received data:', { email, userData, id })
      
      if (!email || !id) {
        console.error('Email and ID are required')
        return NextResponse.json({ error: 'Email and ID are required' }, { status: 400 })
      }
      
      // Check if user already exists in Prisma
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { id }
          ]
        }
      })
      
      if (existingUser) {
        console.log('User already exists:', existingUser)
        return NextResponse.json({
          message: 'User already exists',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            username: existingUser.username
          }
        })
      }
      
      // Create a username based on email with timestamp to ensure uniqueness
      const timestamp = Date.now().toString(36)
      const username = `${email.split('@')[0]}_${timestamp}`
      
      // Create the user in Prisma using Supabase user ID
      console.log('Attempting to create user in Prisma with ID:', id)
      const user = await prisma.user.create({
        data: {
          id: id, // Use the provided Supabase user ID
          email: email,
          username: username,
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          passwordHash: 'supabase-auth', // Not used as auth is handled by Supabase
          isVerified: false,
          profile: {
            create: {} // Create an empty profile
          }
        },
        include: {
          profile: true
        }
      })
      
      console.log('User created successfully:', user)
      
      return NextResponse.json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        }
      })
      
    } catch (error: any) {
      console.error(`Error on attempt ${retries + 1}:`, error)
      
      // If it's a unique constraint violation, modify the username and retry
      if (error.code === 'P2002') {
        retries++
        if (retries < MAX_RETRIES) {
          console.log('Retrying with different username...')
          await wait(RETRY_DELAY)
          continue
        }
      }
      
      // For connection errors, retry
      if (error.message?.includes('connection')) {
        retries++
        if (retries < MAX_RETRIES) {
          console.log('Database connection error, retrying...')
          await wait(RETRY_DELAY)
          continue
        }
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to create user' },
        { status: 500 }
      )
    }
  }
  
  return NextResponse.json(
    { error: 'Maximum retry attempts reached' },
    { status: 500 }
  )
} 