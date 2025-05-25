import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { uploadToS3 } from '@/lib/s3'
import { analyzeText } from '../ai/text-analysis'

export async function POST(req: Request) {
  try {
    console.log('Prisma connecting to:', process.env.DATABASE_URL?.split('@')[1] || 'Unknown')
    console.log('Postgres connecting to:', process.env.POSTGRES_URL?.split('@')[1] || 'Unknown')
    console.log('Testing Postgres connection...')
    
    // Create Supabase server client
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
      console.log('Unauthorized: No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const content = formData.get('content') as string
    const feeling = formData.get('feeling') as string || null
    const location = formData.get('location') as string || null
    const spoke = formData.get('spoke') as string || null
    const type = formData.get('type') as string || 'user-post'
    const tags = formData.getAll('tags') as string[]
    const files = formData.getAll('files') as File[]

    console.log('Post data:', { content, feeling, location, spoke, type, tags })

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Analyze content and auto-assign spoke if not provided
    let assignedSpoke = spoke;
    try {
      if (!assignedSpoke) {
        const analysis = await analyzeText(content);
        if (analysis.spokeTag.confidence > 0.4) {
          assignedSpoke = analysis.spokeTag.spoke;
          console.log(`Auto-assigned spoke: ${assignedSpoke} (confidence: ${analysis.spokeTag.confidence})`);
          console.log(`Reasoning: ${analysis.spokeTag.reasoning}`);
        }
      }
    } catch (error) {
      console.error('Error analyzing content for spoke tagging:', error);
      // Continue without auto-assignment if analysis fails
    }

    // Upload media files
    const imageUrls: string[] = []
    const videoUrls: string[] = []

    try {
      for (const file of files) {
        const url = await uploadToS3(file)
        if (file.type.startsWith('image/')) {
          imageUrls.push(url)
        } else if (file.type.startsWith('video/')) {
          videoUrls.push(url)
        }
      }
    } catch (uploadError) {
      console.error('Error uploading files:', uploadError)
      return NextResponse.json({ error: 'Failed to upload media files' }, { status: 500 })
    }

    console.log('Media URLs:', { imageUrls, videoUrls })

    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      // Create user if they don't exist
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email!,
          username: session.user.email!.split('@')[0],
          firstName: session.user.user_metadata?.firstName || 'Anonymous',
          lastName: session.user.user_metadata?.lastName || 'User',
          passwordHash: '', // Not used with Supabase auth
        },
      })
    }

    // Create post in database
    const post = await prisma.post.create({
      data: {
        content,
        feeling: feeling || undefined,
        location: location || undefined,
        spoke: assignedSpoke || undefined,
        type,
        tags: tags.length > 0 ? tags.join(',') : undefined,
        images: imageUrls.length > 0 ? imageUrls.join(',') : undefined,
        videos: videoUrls.length > 0 ? videoUrls.join(',') : undefined,
        userId: user.id,
        authorId: user.id,
      },
      include: {
        author: true,
        likes: true,
        comments: true,
      },
    })

    console.log('Post created:', post)

    // Emit socket event for real-time updates
    if ((global as any).io) {
      console.log('Emitting new-post event')
      ;(global as any).io.emit('new-post', post)
    } else {
      console.log('WebSocket server not available')
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const spoke = searchParams.get('spoke')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get current user session for like status
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

    const { data: { session } } = await supabase.auth.getSession()
    const currentUserId = session?.user?.id

    const where = {
      ...(spoke ? { spoke } : {}),
      ...(type ? { type } : {}),
      isDeleted: false, // Only show non-deleted posts
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: true,
        likes: true,
        comments: {
          include: {
            user: true,
            likes: true,
            replies: {
              include: {
                user: true,
                likes: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    // Add user-specific like status to each post
    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLikedByCurrentUser: currentUserId ? post.likes.some(like => like.userId === currentUserId) : false,
    }))

    const total = await prisma.post.count({ where })

    return NextResponse.json({
      posts: postsWithLikeStatus,
      total,
      hasMore: skip + posts.length < total,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
} 