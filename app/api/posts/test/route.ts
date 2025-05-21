import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Try to create a test post
    const testPost = await prisma.post.create({
      data: {
        content: "Test post",
        userId: "test-user", // This will fail if no user exists
        authorId: "test-user",
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful",
      post: testPost 
    })
  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred',
      type: 'Database connection test failed'
    }, { 
      status: 500 
    })
  }
} 