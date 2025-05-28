import { NextResponse } from 'next/server'
import { getOptimizedPrisma } from '@/lib/prisma-optimized'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const prisma = getOptimizedPrisma()

    // Fetch saved posts for the user
    const savedPosts = await prisma.bookmark.findMany({
      where: { 
        userId,
        post: {
          isDeleted: false // Only show non-deleted posts
        }
      },
      include: {
        post: {
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
            },
            _count: {
              select: {
                bookmarks: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const transformedPosts = savedPosts.map((bookmark: any) => ({
      id: bookmark.id,
      postId: bookmark.postId,
      userId: bookmark.userId,
      createdAt: bookmark.createdAt,
      post: {
        id: bookmark.post.id,
        content: bookmark.post.content,
        images: bookmark.post.images,
        videos: bookmark.post.videos,
        createdAt: bookmark.post.createdAt,
        updatedAt: bookmark.post.updatedAt,
        isEdited: bookmark.post.updatedAt > bookmark.post.createdAt,
        author: {
          id: bookmark.post.author.id,
          name: `${bookmark.post.author.firstName} ${bookmark.post.author.lastName}`,
          profileImageUrl: bookmark.post.author.profileImageUrl
        },
        likes: bookmark.post.likes,
        comments: bookmark.post.comments,
        shares: bookmark.post._count.bookmarks,
        spoke: bookmark.post.spoke,
        location: bookmark.post.location,
        feeling: bookmark.post.feeling,
        tags: bookmark.post.tags ? bookmark.post.tags.split(',') : []
      }
    }))

    return NextResponse.json({
      success: true,
      savedPosts: transformedPosts
    })
  } catch (error) {
    console.error('Error fetching saved posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved posts' },
      { status: 500 }
    )
  }
} 