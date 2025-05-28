import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const body = await req.json()
    const { commentId, userId } = body

    if (!commentId || !userId) {
      return NextResponse.json({ error: 'Comment ID and user ID are required' }, { status: 400 })
    }

    // Verify the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Check if user owns the comment or the post
    if (comment.userId !== userId && comment.post.authorId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId }
    })

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
} 