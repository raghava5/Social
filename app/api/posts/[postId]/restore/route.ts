import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const body = await req.json()
    const { userId } = body

    if (!postId || !userId) {
      return NextResponse.json({ error: 'Post ID and user ID are required' }, { status: 400 })
    }

    console.log(`Restore post request: postId=${postId}, userId=${userId}`)

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

    // Restore the post
    const restoredPost = await prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date()
      }
    })

    console.log(`Post restored successfully: ${postId}`)

    return NextResponse.json({
      success: true,
      message: 'Post restored successfully'
    })
  } catch (error) {
    console.error('Error restoring post:', error)
    return NextResponse.json(
      { error: 'Failed to restore post' },
      { status: 500 }
    )
  }
} 