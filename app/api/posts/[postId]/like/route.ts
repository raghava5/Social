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

    // Get user ID from request body (simplified approach)
    const body = await req.json().catch(() => ({}))
    const userId = body.userId || 'temp-user-id'

    console.log(`Like request: postId=${postId}, userId=${userId}`)

    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx: any) => {
      // Ensure user exists in database
      let user = await tx.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        user = await tx.user.create({
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

      // Get post to verify it exists
      const post = await tx.post.findUnique({
        where: { id: postId }
      })

      if (!post) {
        throw new Error('Post not found')
      }

      // Check if user already liked the post
      const existingLike = await tx.like.findFirst({
        where: {
          postId,
          userId: userId
        }
      })

      let liked = false

      if (existingLike) {
        // Unlike: Remove the like
        await tx.like.delete({
          where: { id: existingLike.id }
        })
        liked = false
      } else {
        // Like: Create new like
        await tx.like.create({
          data: {
            postId,
            userId: userId,
            reactionType: 'like'
          }
        })
        liked = true
      }

      // Get fresh like count after the operation
      const updatedPost = await tx.post.findUnique({
        where: { id: postId },
        include: { likes: true }
      })

      return {
        liked,
        likeCount: updatedPost?.likes.length || 0,
        postId
      }
    })

    console.log(`Like processed: liked=${result.liked}, count=${result.likeCount}`)

    // 🚀 REAL-TIME UPDATE: Broadcast like update via WebSocket
    if (global.io) {
      global.io.emit('post_liked', {
        postId: result.postId,
        likeCount: result.likeCount,
        userId: userId,
        liked: result.liked
      })
      console.log(`📡 Broadcasted like update for post ${postId}: ${result.likeCount} likes`)
    }

    return NextResponse.json({ 
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error processing like:', error)
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    )
  }
} 