import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const body = await req.json()
    const { userId } = body

    if (!postId || !userId) {
      return NextResponse.json({ error: 'Post ID and user ID are required' }, { status: 400 })
    }

    console.log(`Delete post request: postId=${postId}, userId=${userId}`)

    // Verify the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.authorId !== userId && post.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Soft delete: mark as deleted instead of removing from database
    const deletedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`Post soft-deleted successfully: ${postId}`)

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
} 