// 🚀 POSTS CACHE - Simple In-Memory Caching for Posts API
// Reduces database load from 5-8 seconds to sub-100ms for cached data

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface PostsCacheKey {
  page: number
  limit: number
  spoke?: string
  type?: string
  userId?: string
}

class PostsCache {
  private cache = new Map<string, CacheEntry>()
  private defaultTTL = 30 * 1000 // 30 seconds default TTL
  private maxCacheSize = 50 // Maximum number of cached entries

  // Generate cache key from parameters
  private getCacheKey(params: PostsCacheKey): string {
    const { page, limit, spoke, type, userId } = params
    return `posts:${page}:${limit}:${spoke || 'all'}:${type || 'all'}:${userId || 'public'}`
  }

  // Get cached posts
  get(params: PostsCacheKey): any | null {
    const key = this.getCacheKey(params)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if cache entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key)
      return null
    }

    console.log(`📦 Cache HIT: ${key}`)
    return entry.data
  }

  // Set cached posts
  set(params: PostsCacheKey, data: any, ttl?: number): void {
    const key = this.getCacheKey(params)
    
    // Implement cache size limit
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })

    console.log(`📦 Cache SET: ${key} (TTL: ${(ttl || this.defaultTTL) / 1000}s)`)
  }

  // Invalidate cache entries (when new posts are created)
  invalidate(params?: Partial<PostsCacheKey>): void {
    if (!params) {
      // Clear all cache
      this.cache.clear()
      console.log('📦 Cache CLEARED: All entries')
      return
    }

    // Invalidate specific entries
    const keysToDelete: string[] = []
    
    for (const [key, _] of this.cache.entries()) {
      const shouldDelete = this.shouldInvalidateKey(key, params)
      if (shouldDelete) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key)
      console.log(`📦 Cache INVALIDATED: ${key}`)
    })
  }

  private shouldInvalidateKey(key: string, params: Partial<PostsCacheKey>): boolean {
    const keyParts = key.split(':')
    // posts:page:limit:spoke:type:userId
    
    if (params.spoke && keyParts[3] === params.spoke) return true
    if (params.type && keyParts[4] === params.type) return true
    if (params.userId && keyParts[5] === params.userId) return true
    
    // Invalidate "all" entries when specific filters are updated
    if (keyParts[3] === 'all' || keyParts[4] === 'all') return true
    
    return false
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[]; hitRate?: number } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key)
    })

    if (expiredKeys.length > 0) {
      console.log(`📦 Cache CLEANUP: Removed ${expiredKeys.length} expired entries`)
    }
  }
}

// Singleton instance
export const postsCache = new PostsCache()

// Cleanup expired entries every 2 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    postsCache.cleanup()
  }, 2 * 60 * 1000)
}

export default postsCache

// Helper function for posts API
export function getCachedPosts(params: PostsCacheKey) {
  return postsCache.get(params)
}

export function setCachedPosts(params: PostsCacheKey, data: any, ttl?: number) {
  return postsCache.set(params, data, ttl)
}

export function invalidatePostsCache(params?: Partial<PostsCacheKey>) {
  return postsCache.invalidate(params)
} 