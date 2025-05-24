import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const body = await req.json().catch(() => ({}))
    const { commentId, userId } = body

    if (!commentId || !userId) {
      return NextResponse.json({ error: 'Comment ID and user ID are required' }, { status: 400 })
    }

    console.log(`Delete comment request: commentId=${commentId}, userId=${userId}`)

    // Use transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the comment to verify ownership
      const comment = await tx.comment.findUnique({
        where: { id: commentId },
        include: { user: true, post: true }
      })

      if (!comment) {
        throw new Error('Comment not found')
      }

      // Check if user owns the comment OR owns the post
      if (comment.userId !== userId && comment.post.authorId !== userId) {
        throw new Error('Unauthorized: You can only delete your own comments or comments on your posts')
      }

      // Soft delete: mark as deleted instead of removing from database
      const deletedComment = await tx.comment.update({
        where: { id: commentId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      })

      return deletedComment
    })

    console.log(`Comment soft-deleted successfully: ${commentId}`)

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Comment not found')) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
} 