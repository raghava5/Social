import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const body = await req.json()
    const { content, userId = 'temp-user-id' } = body

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    console.log(`Comment request: postId=${postId}, userId=${userId}, content=${content.substring(0, 50)}...`)

    // Get post
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Create or get user in database
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@temp.com`,
          username: userId,
          firstName: 'User',
          lastName: `${userId.substring(0, 4)}`,
          passwordHash: '',
        }
      })
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: userId,
        content
      },
      include: {
        user: true
      }
    })

    console.log(`Comment created: ${comment.id}`)

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          firstName: comment.user.firstName,
          lastName: comment.user.lastName,
          profileImageUrl: comment.user.profileImageUrl
        }
      }
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
} 