import { CacheService, CacheKeys, CacheTTL } from './redis'
import { prisma } from './prisma'
import RateLimiter, { RateLimits } from './rate-limiter'

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
  // Generate personalized home feed
  static async getHomeFeed(options: FeedOptions): Promise<FeedResult> {
    const cacheKey = CacheKeys.FEED(options.userId, Math.floor((options.offset || 0) / 20))
    
    // Try cache first
    const cached = await CacheService.get<FeedResult>(cacheKey)
    if (cached && !this.isCacheStale(cached.lastUpdated)) {
      return cached
    }

    // Rate limit feed requests
    const rateLimitResult = await RateLimiter.checkLimit(
      options.userId,
      'get_feed',
      RateLimits.GET_FEED
    )
    
    if (!rateLimitResult.allowed) {
      throw new Error('Feed rate limit exceeded')
    }

    // Generate fresh feed
    const feed = await this.generateHomeFeed(options)
    
    // Cache the result
    await CacheService.set(cacheKey, feed, CacheTTL.FEED)
    
    return feed
  }

  private static async generateHomeFeed(options: FeedOptions): Promise<FeedResult> {
    const limit = Math.min(options.limit || 20, 50) // Max 50 posts per request
    const offset = options.offset || 0
    
    try {
      // Get user's following list (cached)
      const following = await this.getUserFollowing(options.userId)
      
      // Algorithm: Mix of following posts + trending + recommendations
      const [followingPosts, trendingPosts, recommendedPosts] = await Promise.all([
        this.getFollowingPosts(options.userId, following, limit * 0.7), // 70% following
        this.getTrendingPosts(limit * 0.2), // 20% trending
        this.getRecommendedPosts(options.userId, limit * 0.1), // 10% recommendations
      ])

      // Merge and sort by engagement score + recency
      const allPosts = [
        ...followingPosts.map(p => ({ ...p, priority: this.calculatePostPriority(p, 'following') })),
        ...trendingPosts.map(p => ({ ...p, priority: this.calculatePostPriority(p, 'trending') })),
        ...recommendedPosts.map(p => ({ ...p, priority: this.calculatePostPriority(p, 'recommended') })),
      ]

      // Remove duplicates and sort by priority
      const uniquePosts = this.deduplicatePosts(allPosts)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .slice(offset, offset + limit)

      // Add user-specific data (likes, etc.)
      const enrichedPosts = await this.enrichPostsWithUserData(uniquePosts, options.userId)

      return {
        posts: enrichedPosts,
        hasMore: uniquePosts.length === limit,
        nextCursor: uniquePosts.length > 0 ? uniquePosts[uniquePosts.length - 1].id : undefined,
        lastUpdated: Date.now()
      }
    } catch (error) {
      console.error('Feed generation error:', error)
      throw new Error('Failed to generate feed')
    }
  }

  private static async getUserFollowing(userId: string): Promise<string[]> {
    const cacheKey = `user:following:${userId}`
    
    let following = await CacheService.get<string[]>(cacheKey)
    if (!following) {
      // Query database for following list
      const followingData = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true }
      })
      
      following = followingData.map(f => f.followingId)
      await CacheService.set(cacheKey, following, CacheTTL.USER_PROFILE)
    }
    
    return following
  }

  private static async getFollowingPosts(
    userId: string, 
    following: string[], 
    limit: number
  ): Promise<Post[]> {
    if (following.length === 0) return []

    // Use database read replica for heavy queries
    const posts = await prisma.$queryRaw`
      SELECT 
        p.*,
        u.firstName || ' ' || u.lastName as authorName,
        u.profileImageUrl as authorAvatar,
        COUNT(DISTINCT l.id) as likes,
        COUNT(DISTINCT c.id) as comments,
        COUNT(DISTINCT s.id) as shares
      FROM "Post" p
      LEFT JOIN "User" u ON p."authorId" = u.id
      LEFT JOIN "Like" l ON p.id = l."postId"
      LEFT JOIN "Comment" c ON p.id = c."postId"
      LEFT JOIN "Share" s ON p.id = s."postId"
      WHERE 
        p."authorId" = ANY(${following}::text[])
        AND p."deletedAt" IS NULL
        AND p."createdAt" > NOW() - INTERVAL '7 days'
      GROUP BY p.id, u.firstName, u.lastName, u.profileImageUrl
      ORDER BY 
        p."createdAt" DESC,
        (COUNT(DISTINCT l.id) + COUNT(DISTINCT c.id) * 2 + COUNT(DISTINCT s.id) * 3) DESC
      LIMIT ${Math.floor(limit)}
    ` as any[]

    return posts.map(this.mapToPost)
  }

  private static async getTrendingPosts(limit: number): Promise<Post[]> {
    const cacheKey = CacheKeys.TRENDING()
    
    let trending = await CacheService.get<Post[]>(cacheKey)
    if (!trending) {
      // Calculate trending posts based on engagement velocity
      const posts = await prisma.$queryRaw`
        SELECT 
          p.*,
          u.firstName || ' ' || u.lastName as authorName,
          u.profileImageUrl as authorAvatar,
          COUNT(DISTINCT l.id) as likes,
          COUNT(DISTINCT c.id) as comments,
          COUNT(DISTINCT s.id) as shares,
          -- Engagement velocity score
          (
            COUNT(DISTINCT CASE WHEN l."createdAt" > NOW() - INTERVAL '1 hour' THEN l.id END) * 10 +
            COUNT(DISTINCT CASE WHEN c."createdAt" > NOW() - INTERVAL '1 hour' THEN c.id END) * 20 +
            COUNT(DISTINCT CASE WHEN s."createdAt" > NOW() - INTERVAL '1 hour' THEN s.id END) * 30
          ) / EXTRACT(EPOCH FROM (NOW() - p."createdAt")) as velocity_score
        FROM "Post" p
        LEFT JOIN "User" u ON p."authorId" = u.id
        LEFT JOIN "Like" l ON p.id = l."postId"
        LEFT JOIN "Comment" c ON p.id = c."postId"
        LEFT JOIN "Share" s ON p.id = s."postId"
        WHERE 
          p."deletedAt" IS NULL
          AND p."createdAt" > NOW() - INTERVAL '24 hours'
        GROUP BY p.id, u.firstName, u.lastName, u.profileImageUrl
        HAVING COUNT(DISTINCT l.id) + COUNT(DISTINCT c.id) + COUNT(DISTINCT s.id) > 0
        ORDER BY velocity_score DESC
        LIMIT ${Math.floor(limit * 5)} -- Get more for cache
      ` as any[]

      trending = posts.map(this.mapToPost)
      await CacheService.set(cacheKey, trending, CacheTTL.TRENDING)
    }
    
    return trending.slice(0, Math.floor(limit))
  }

  private static async getRecommendedPosts(userId: string, limit: number): Promise<Post[]> {
    // Simple content-based recommendations
    // In production, use ML models for better recommendations
    const userInterests = await this.getUserInterests(userId)
    
    const posts = await prisma.post.findMany({
      where: {
        AND: [
          { deletedAt: null },
          { authorId: { not: userId } },
          { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
          userInterests.length > 0 ? {
            OR: [
              { spoke: { in: userInterests } },
              { tags: { hasSome: userInterests } }
            ]
          } : {}
        ]
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
            shares: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: Math.floor(limit)
    })

    return posts.map(post => this.mapToPost({
      ...post,
      likes: post._count.likes,
      comments: post._count.comments,
      shares: post._count.shares,
      authorName: `${post.author.firstName} ${post.author.lastName}`,
      authorAvatar: post.author.profileImageUrl
    }))
  }

  private static async getUserInterests(userId: string): Promise<string[]> {
    const cacheKey = `user:interests:${userId}`
    
    let interests = await CacheService.get<string[]>(cacheKey)
    if (!interests) {
      // Analyze user's recent activity to determine interests
      const recentActivity = await prisma.$queryRaw`
        SELECT 
          p.spoke,
          unnest(p.tags) as tag,
          COUNT(*) as frequency
        FROM "Post" p
        LEFT JOIN "Like" l ON p.id = l."postId" AND l."userId" = ${userId}
        LEFT JOIN "Comment" c ON p.id = c."postId" AND c."userId" = ${userId}
        WHERE l.id IS NOT NULL OR c.id IS NOT NULL
        GROUP BY p.spoke, tag
        ORDER BY frequency DESC
        LIMIT 10
      ` as any[]

      interests = recentActivity.map(item => item.spoke || item.tag).filter(Boolean)
      await CacheService.set(cacheKey, interests, CacheTTL.USER_PROFILE)
    }
    
    return interests
  }

  private static calculatePostPriority(post: Post, source: 'following' | 'trending' | 'recommended'): number {
    const baseScore = {
      following: 100,
      trending: 80,
      recommended: 60
    }[source]

    const ageHours = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60)
    const agePenalty = Math.max(0, ageHours * 2) // Older posts get lower priority
    
    const engagementScore = (post.likes || 0) + (post.comments || 0) * 2 + (post.shares || 0) * 3
    const engagementBonus = Math.min(50, engagementScore * 0.5)

    return baseScore + engagementBonus - agePenalty
  }

  private static deduplicatePosts(posts: Post[]): Post[] {
    const seen = new Set<string>()
    return posts.filter(post => {
      if (seen.has(post.id)) return false
      seen.add(post.id)
      return true
    })
  }

  private static async enrichPostsWithUserData(posts: Post[], userId: string): Promise<Post[]> {
    if (posts.length === 0) return []

    const postIds = posts.map(p => p.id)
    
    // Batch query for user interactions
    const [likes, shares] = await Promise.all([
      prisma.like.findMany({
        where: {
          userId,
          postId: { in: postIds }
        },
        select: { postId: true }
      }),
      prisma.share.findMany({
        where: {
          userId,
          postId: { in: postIds }
        },
        select: { postId: true }
      })
    ])

    const likedPostIds = new Set(likes.map(l => l.postId))
    const sharedPostIds = new Set(shares.map(s => s.postId))

    return posts.map(post => ({
      ...post,
      isLikedByCurrentUser: likedPostIds.has(post.id),
      isSharedByCurrentUser: sharedPostIds.has(post.id)
    }))
  }

  private static mapToPost(dbPost: any): Post {
    return {
      id: dbPost.id,
      authorId: dbPost.authorId,
      content: dbPost.content,
      images: dbPost.images,
      videos: dbPost.videos,
      likes: parseInt(dbPost.likes) || 0,
      comments: parseInt(dbPost.comments) || 0,
      shares: parseInt(dbPost.shares) || 0,
      createdAt: new Date(dbPost.createdAt),
      updatedAt: new Date(dbPost.updatedAt),
      spoke: dbPost.spoke,
      location: dbPost.location,
      feeling: dbPost.feeling,
      tags: dbPost.tags
    }
  }

  private static isCacheStale(lastUpdated: number, maxAge: number = 60000): boolean {
    return Date.now() - lastUpdated > maxAge
  }

  // Invalidate feed cache for a user
  static async invalidateUserFeed(userId: string): Promise<void> {
    await CacheService.invalidatePattern(`feed:${userId}:*`)
  }

  // Invalidate feeds for all followers of a user (when they post)
  static async invalidateFollowerFeeds(userId: string): Promise<void> {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: { followerId: true }
    })

    const invalidationPromises = followers.map(f => 
      this.invalidateUserFeed(f.followerId)
    )

    await Promise.all(invalidationPromises)
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