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

    console.log(`Permanent delete post request: postId=${postId}, userId=${userId}`)

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

    if (!post.isDeleted) {
      return NextResponse.json({ error: 'Post is not deleted' }, { status: 400 })
    }

    // Delete all related data first (comments, likes, bookmarks)
    await prisma.comment.deleteMany({
      where: { postId }
    })

    await prisma.like.deleteMany({
      where: { postId }
    })

    await prisma.bookmark.deleteMany({
      where: { postId }
    })

    // Permanently delete the post
    await prisma.post.delete({
      where: { id: postId }
    })

    console.log(`Post permanently deleted: ${postId}`)

    return NextResponse.json({
      success: true,
      message: 'Post permanently deleted'
    })
  } catch (error) {
    console.error('Error permanently deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to permanently delete post' },
      { status: 500 }
    )
  }
} 