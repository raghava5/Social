import { CacheService } from './redis'
import { prisma } from '@/lib/db'

export interface Post {
  id: string
  authorId: string
  content: string
  images?: string
  videos?: string
  likes: number
  comments: number
  shares: number
  createdAt: Date
  updatedAt: Date
  spoke?: string
  location?: string
  feeling?: string
  tags?: string[]
  isLikedByCurrentUser?: boolean
  isSharedByCurrentUser?: boolean
  priority?: number
}

export interface FeedOptions {
  userId: string
  limit?: number
  offset?: number
  lastPostId?: string
  feedType?: 'home' | 'trending' | 'following' | 'discover'
  includeShared?: boolean
  maxAge?: number // Maximum age of posts in hours
}

export interface FeedResult {
  posts: Post[]
  hasMore: boolean
  nextCursor?: string
  lastUpdated: number
}

export class FeedService {
  // Simplified home feed - just returns recent posts for now
  static async getHomeFeed(options: FeedOptions): Promise<FeedResult> {
    try {
      const posts = await prisma.post.findMany({
        where: {
          isDeleted: false
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
          _count: {
            select: {
              likes: true,
              comments: true,
              bookmarks: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: options.limit || 20,
        skip: options.offset || 0
      })

      const transformedPosts: Post[] = posts.map(post => ({
        id: post.id,
        authorId: post.authorId,
        content: post.content,
        images: post.images || undefined,
        videos: post.videos || undefined,
        likes: post._count.likes,
        comments: post._count.comments,
        shares: post._count.bookmarks, // Using bookmarks as shares for now
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        spoke: post.spoke || undefined,
        location: post.location || undefined,
        feeling: post.feeling || undefined,
        tags: post.tags ? post.tags.split(',') : undefined
      }))

      return {
        posts: transformedPosts,
        hasMore: posts.length === (options.limit || 20),
        lastUpdated: Date.now()
      }
    } catch (error) {
      console.error('Error fetching home feed:', error)
      return {
        posts: [],
        hasMore: false,
        lastUpdated: Date.now()
      }
    }
  }

  // Invalidate feed cache for a user
  static async invalidateUserFeed(userId: string): Promise<void> {
    try {
      await CacheService.invalidatePattern(`feed:${userId}:*`)
    } catch (error) {
      console.error('Error invalidating user feed:', error)
    }
  }

  // Invalidate feeds for all followers of a user (when they post)
  static async invalidateFollowerFeeds(userId: string): Promise<void> {
    try {
      // Get all users who have this user as a friend (followers in friendship model)
      const friendships = await prisma.friendship.findMany({
        where: { 
          friendId: userId,
          status: 'accepted'
        },
        select: { userId: true }
      })

      // Invalidate feeds for all followers
      const invalidationPromises = friendships.map(f => 
        this.invalidateUserFeed(f.userId)
      )

      await Promise.all(invalidationPromises)
    } catch (error) {
      console.error('Error invalidating follower feeds:', error)
    }
  }

  // Preload feeds for active users
  static async preloadFeeds(userIds: string[]): Promise<void> {
    const promises = userIds.map(userId => 
      this.getHomeFeed({ userId, limit: 20 }).catch(error => 
        console.error(`Failed to preload feed for user ${userId}:`, error)
      )
    )

    await Promise.allSettled(promises)
  }
}

export default FeedService 