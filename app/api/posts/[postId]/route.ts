import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = params

    // Check if the user owns the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the post and all related data
    await prisma.post.delete({
      where: { id: postId },
    })

    // Emit socket event for real-time updates
    global.io?.emit('post-deleted', postId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = params
    const { content, feeling, location } = await req.json()

    // Check if the user owns the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content,
        feeling,
        location,
        isEdited: true,
      },
      include: {
        author: true,
        likes: true,
        comments: true,
      },
    })

    // Emit socket event for real-time updates
    global.io?.emit('post-updated', updatedPost)

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params

    // Get current user session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handle cookie setting error
            }
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    const post = await prisma.post.findUnique({
      where: { 
        id: postId,
        isDeleted: false
      },
      include: {
        author: true,
        likes: true,
        comments: {
          include: {
            user: true,
            likes: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Add user-specific like status
    const isLikedByCurrentUser = session?.user?.id 
      ? post.likes.some(like => like.userId === session.user.id) 
      : false

    const postWithLikeStatus = {
      ...post,
      isLikedByCurrentUser,
    }

    return NextResponse.json(postWithLikeStatus)

  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
} 