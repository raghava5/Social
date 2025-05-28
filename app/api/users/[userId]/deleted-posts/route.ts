import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Fetch deleted posts for the user
    const deletedPosts = await prisma.post.findMany({
      where: {
        userId,
        isDeleted: true
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true
          }
        },
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        deletedAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const transformedPosts = deletedPosts.map((post: any) => ({
      id: post.id,
      content: post.content,
      images: post.images,
      videos: post.videos,
      createdAt: post.createdAt,
      deletedAt: post.deletedAt,
      author: {
        id: post.author.id,
        name: `${post.author.firstName} ${post.author.lastName}`,
        profileImageUrl: post.author.profileImageUrl
      },
      likes: post.likes,
      comments: post.comments,
      shares: 0,
      spoke: post.spoke,
      location: post.location,
      feeling: post.feeling,
      tags: post.tags ? post.tags.split(',') : []
    }))

    return NextResponse.json({
      success: true,
      deletedPosts: transformedPosts
    })
  } catch (error) {
    console.error('Error fetching deleted posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deleted posts' },
      { status: 500 }
    )
  }
} 