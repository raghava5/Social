import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToS3 } from '@/lib/s3'

export async function POST(req: Request) {
  try {
    console.log('Creating new post...')
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('Unauthorized: No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const content = formData.get('content') as string
    const feeling = formData.get('feeling') as string
    const location = formData.get('location') as string
    const spoke = formData.get('spoke') as string
    const type = formData.get('type') as string || 'user-post'
    const tags = formData.getAll('tags') as string[]
    const files = formData.getAll('files') as File[]

    console.log('Post data:', { content, feeling, location, spoke, type, tags })

    // Upload media files
    const imageUrls: string[] = []
    const videoUrls: string[] = []

    for (const file of files) {
      const url = await uploadToS3(file)
      if (file.type.startsWith('image/')) {
        imageUrls.push(url)
      } else if (file.type.startsWith('video/')) {
        videoUrls.push(url)
      }
    }

    console.log('Media URLs:', { imageUrls, videoUrls })

    // Create post in database
    const post = await prisma.post.create({
      data: {
        content,
        feeling,
        location,
        spoke,
        type,
        tags,
        images: imageUrls,
        videos: videoUrls,
        userId: session.user.id,
        authorId: session.user.id,
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
      { error: 'Failed to create post' },
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

    const where = {
      ...(spoke ? { spoke } : {}),
      ...(type ? { type } : {}),
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: true,
        likes: true,
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    const total = await prisma.post.count({ where })

    return NextResponse.json({
      posts,
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