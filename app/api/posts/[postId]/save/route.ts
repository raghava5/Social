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

    const body = await req.json().catch(() => ({}))
    const userId = body.userId || 'temp-user-id'

    console.log(`Save post request: postId=${postId}, userId=${userId}`)

    // Use transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
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