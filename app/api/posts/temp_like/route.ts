import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(
  req: Request
) {
  try {
    // Get postId from the request
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')
    
    console.log('Received like request for postId:', postId)
    
    if (!postId) {
      console.error('Missing postId in request')
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Get current user from Supabase auth
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handle cookie setting error
            }
          },
        },
      }
    )

    // Get session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      console.error('No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', session.user.id)

    // Get post
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { likes: true }
      })
  
      if (!post) {
        console.error('Post not found:', postId)
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
  
      console.log('Post found:', post.id, 'with', post.likes.length, 'likes')
  
      // Check if user already liked the post
      const existingLike = await prisma.like.findFirst({
        where: {
          postId,
          userId: session.user.id
        }
      })
  
      console.log('Existing like check:', existingLike ? 'Found' : 'Not found')
  
      if (existingLike) {
        // Unlike: Remove the like
        const deleted = await prisma.like.delete({
          where: { id: existingLike.id }
        })
  
        console.log('Like removed:', deleted.id)
  
        return NextResponse.json({ 
          liked: false, 
          likeCount: (post.likes.length - 1),
          message: 'Post unliked successfully'
        })
      } else {
        // Like: Create new like
        const created = await prisma.like.create({
          data: {
            postId,
            userId: session.user.id,
            reactionType: 'like'
          }
        })
  
        console.log('Like created:', created.id)
  
        return NextResponse.json({ 
          liked: true, 
          likeCount: (post.likes.length + 1),
          message: 'Post liked successfully'
        })
      }
    } catch (dbError) {
      console.error('Database error when processing like:', dbError)
      return NextResponse.json(
        { error: 'Database error when processing like' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in like API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 