import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = params

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    })

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })
      return NextResponse.json({ liked: false })
    }

    await prisma.like.create({
      data: {
        postId,
        userId: session.user.id,
      },
    })

    // Emit socket event for real-time updates
    global.io?.emit('post-liked', { postId, userId: session.user.id })

    return NextResponse.json({ liked: true })
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
} 
 
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = params

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    })

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })
      return NextResponse.json({ liked: false })
    }

    await prisma.like.create({
      data: {
        postId,
        userId: session.user.id,
      },
    })

    // Emit socket event for real-time updates
    global.io?.emit('post-liked', { postId, userId: session.user.id })

    return NextResponse.json({ liked: true })
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
} 
 
 