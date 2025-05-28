import { NextResponse } from 'next/server'
import { getOptimizedPrisma } from '@/lib/prisma-optimized'
import { invalidatePostsCache } from '@/lib/posts-cache'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const userId = body.userId || 'temp-user-id'

    console.log(`Save post request: postId=${postId}, userId=${userId}`)

    const prisma = getOptimizedPrisma()

    // Use transaction for consistency
    const result = await prisma.$transaction(async (tx: any) => {
      // Ensure user exists
      let user = await tx.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        user = await tx.user.create({
          data: {
            id: userId,
            email: `${userId}@temp.com`,
            username: userId,
            firstName: 'User',
            lastName: `${userId.substring(0, 4)}`,
            passwordHash: '',
          }
        })
      }

      // Check if post exists
      const post = await tx.post.findUnique({
        where: { id: postId }
      })

      if (!post) {
        throw new Error('Post not found')
      }

      // Check if already saved
      const existingSave = await tx.bookmark.findFirst({
        where: {
          postId,
          userId
        }
      })

      let saved = false

      if (existingSave) {
        // Unsave: Remove from saved posts
        await tx.bookmark.delete({
          where: { id: existingSave.id }
        })
        saved = false
      } else {
        // Save: Add to saved posts
        await tx.bookmark.create({
          data: {
            postId,
            userId
          }
        })
        saved = true
      }

      return { saved, postId }
    })

    console.log(`Post save toggled: saved=${result.saved}`)

    // 🚀 CACHE INVALIDATION: Clear cache for this user
    invalidatePostsCache({ userId })

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error saving post:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Post not found')) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const userId = body.userId

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    console.log(`Unsave post request: postId=${postId}, userId=${userId}`)

    const prisma = getOptimizedPrisma()

    // Find and delete the bookmark
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        postId,
        userId
      }
    })

    if (!bookmark) {
      return NextResponse.json({ error: 'Post not saved' }, { status: 404 })
    }

    await prisma.bookmark.delete({
      where: { id: bookmark.id }
    })

    console.log(`Post unsaved successfully: ${postId}`)

    return NextResponse.json({
      success: true,
      message: 'Post unsaved successfully'
    })
  } catch (error) {
    console.error('Error unsaving post:', error)
    return NextResponse.json(
      { error: 'Failed to unsave post' },
      { status: 500 }
    )
  }
} 