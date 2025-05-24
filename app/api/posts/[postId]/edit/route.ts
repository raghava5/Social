import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    const body = await req.json()
    const { content, feeling, location, tags, userId } = body

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    console.log(`Edit post request: postId=${postId}, userId=${userId}`)

    // Use transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the post to verify ownership
      const post = await tx.post.findUnique({
        where: { id: postId },
        include: { author: true }
      })

      if (!post) {
        throw new Error('Post not found')
      }

      // Check if user owns the post
      if (post.authorId !== userId && post.userId !== userId) {
        throw new Error('Unauthorized: You can only edit your own posts')
      }

      // Update the post
      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: {
          content: content.trim(),
          feeling: feeling || null,
          location: location || null,
          tags: tags && tags.length > 0 ? tags.join(',') : null,
          isEdited: true,
          updatedAt: new Date()
        },
        include: {
          author: true,
          likes: true,
          comments: {
            include: {
              user: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })

      return updatedPost
    })

    console.log(`Post edited successfully: ${postId}`)

    return NextResponse.json({
      success: true,
      post: result
    })
  } catch (error) {
    console.error('Error editing post:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Post not found')) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to edit post' },
      { status: 500 }
    )
  }
} 