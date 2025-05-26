import { NextRequest, NextResponse } from 'next/server'

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export async function POST(request: NextRequest) {
  try {
    const { action, postId } = await request.json()
    
    // Simple rate limiting logic
    const key = `${action}_${postId || 'global'}`
    const now = Date.now()
    const windowMs = 60000 // 1 minute window
    
    let record = rateLimitStore.get(key)
    
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs }
    } else {
      record.count++
    }
    
    rateLimitStore.set(key, record)
    
    // Allow up to 10 actions per minute
    const limit = 10
    
    if (record.count > limit) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          retryAfter: Math.ceil((record.resetTime - now) / 1000) 
        },
        { status: 429 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      remaining: limit - record.count 
    })
    
  } catch (error) {
    console.error('Rate limit check error:', error)
    return NextResponse.json(
      { error: 'Failed to check rate limit' },
      { status: 500 }
    )
  }
} 