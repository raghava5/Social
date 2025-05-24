import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const body = await req.json()
    const { commentId, content, userId } = body

    if (!commentId || !content || !userId) {
      return NextResponse.json({ error: 'Comment ID, content, and user ID are required' }, { status: 400 })
    }

    console.log(`Edit comment request: commentId=${commentId}, userId=${userId}`)

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

      // Check if user owns the comment
      if (comment.userId !== userId) {
        throw new Error('Unauthorized: You can only edit your own comments')
      }

      // Update the comment
      const updatedComment = await tx.comment.update({
        where: { id: commentId },
        data: {
          content: content.trim(),
          isEdited: true,
          updatedAt: new Date()
        },
        include: {
          user: true
        }
      })

      return updatedComment
    })

    console.log(`Comment edited successfully: ${commentId}`)

    return NextResponse.json({
      success: true,
      comment: result
    })
  } catch (error) {
    console.error('Error editing comment:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Comment not found')) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to edit comment' },
      { status: 500 }
    )
  }
} 