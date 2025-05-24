import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log(`Delete post request: postId=${postId}, userId=${userId}`)

    // Use transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the post to verify ownership
      const post = await tx.post.findUnique({
        where: { id: postId },
        include: { author: true }
      })

      if (!post) {
        throw new Error('Post not found')
      }

      // Check if user owns the post
      if (post.authorId !== userId && post.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own posts')
      }

      // Soft delete: mark as deleted instead of removing from database
      const deletedPost = await tx.post.update({
        where: { id: postId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      })

      return deletedPost
    })

    console.log(`Post soft-deleted successfully: ${postId}`)

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Post not found')) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
} 