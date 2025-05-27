import { NextResponse } from 'next/server'
import { getOptimizedPrisma } from '@/lib/prisma-optimized'

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const body = await req.json()
    const { commentId, content, userId } = body

    console.log('Edit comment request:', { postId, commentId, content, userId })

    if (!commentId || !content || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prisma = getOptimizedPrisma()

    // Verify the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: true }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update the comment with isEdited flag
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
        isEdited: true  // ✅ EXPLICITLY SET EDITED FLAG
      },
      include: { user: true }
    })

    console.log('Comment updated successfully:', updatedComment.id)

    return NextResponse.json({
      success: true,
      comment: {
        id: updatedComment.id,
        content: updatedComment.content,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        isEdited: updatedComment.isEdited, // ✅ RETURN EDITED FLAG
        user: {
          id: updatedComment.user.id,
          firstName: updatedComment.user.firstName,
          lastName: updatedComment.user.lastName,
          profileImageUrl: updatedComment.user.profileImageUrl
        }
      }
    })
  } catch (error) {
    console.error('Error editing comment:', error)
    return NextResponse.json(
      { error: 'Failed to edit comment' },
      { status: 500 }
    )
  }
}

// ✅ ALSO SUPPORT PUT METHOD
export async function PUT(
  req: Request,
  { params }: { params: { postId: string } }
) {
  return PATCH(req, { params })
} 