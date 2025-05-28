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
    const { 
      content, 
      userId = 'temp-user-id',
      userEmail,
      userFirstName,
      userLastName,
      userProfileImage,
      isAnonymous = false
    } = body

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    console.log(`Comment request: postId=${postId}, userId=${userId}, content=${content.substring(0, 50)}..., isAnonymous=${isAnonymous}`)

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
          email: userEmail || `${userId}@temp.com`,
          username: userId,
          firstName: userFirstName || 'User',
          lastName: userLastName || '',
          passwordHash: '',
          profileImageUrl: userProfileImage || null,
        }
      })
    } else {
      // Update user data if provided and avoid "user user" issue
      const updateData: any = {}
      if (userFirstName && userFirstName !== 'User') {
        updateData.firstName = userFirstName
      }
      if (userLastName && userLastName !== 'user' && userLastName !== 'User') {
        updateData.lastName = userLastName
      }
      if (userEmail) {
        updateData.email = userEmail
      }
      if (userProfileImage) {
        updateData.profileImageUrl = userProfileImage
      }
      
      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: userId },
          data: updateData
        })
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: userId,
        content,
        isAnonymous: isAnonymous
      },
      include: {
        user: true
      }
    })

    console.log(`Comment created: ${comment.id}`)

    // Get updated comment count for the post
    const commentCount = await prisma.comment.count({
      where: { postId }
    })

    // Prepare comment response with anonymous handling
    const commentResponse = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      isAnonymous: isAnonymous,
      user: isAnonymous ? {
        id: 'anonymous',
        firstName: 'Anonymous',
        lastName: '',
        profileImageUrl: null
      } : {
        id: comment.user.id,
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
        profileImageUrl: comment.user.profileImageUrl
      }
    }

    // 🚀 REAL-TIME UPDATE: Broadcast comment update via WebSocket
    if (global.io) {
      global.io.emit('post_commented', {
        postId,
        commentCount,
        comment: commentResponse
      })
      console.log(`📡 Broadcasted comment update for post ${postId}: ${commentCount} comments`)
    }

    return NextResponse.json({
      success: true,
      comment: commentResponse,
      commentCount
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
} 