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

    const body = await req.json()
    const { shareType = 'general', userId = 'temp-user-id' } = body

    console.log(`Share request: postId=${postId}, userId=${userId}, type=${shareType}`)

    // Get post
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment share count
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { shares: { increment: 1 } }
    })

    console.log(`Share processed: postId=${postId}, newCount=${updatedPost.shares}`)

    return NextResponse.json({ 
      success: true,
      shareCount: updatedPost.shares,
      shared: true,
      postId
    })
  } catch (error) {
    console.error('Error sharing post:', error)
    return NextResponse.json(
      { error: 'Failed to share post' },
      { status: 500 }
    )
  }
} 