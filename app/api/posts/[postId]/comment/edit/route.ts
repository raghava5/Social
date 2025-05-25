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
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        updatedAt: new Date()
      },
      include: { user: true }
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: updatedComment.id,
        content: updatedComment.content,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        isEdited: true,
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