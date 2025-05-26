import redis, { CacheKeys } from './redis'

export interface RateLimitConfig {
  window: number // Time window in seconds
  max: number // Max requests per window
  skipOnError?: boolean // Skip rate limiting if Redis is down
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

// Rate limit configurations for different operations
export const RateLimits = {
  // Critical operations
  LIKE_POST: { window: 60, max: 100 }, // 100 likes per minute
  COMMENT_POST: { window: 60, max: 30 }, // 30 comments per minute
  CREATE_POST: { window: 300, max: 10 }, // 10 posts per 5 minutes
  SHARE_POST: { window: 60, max: 50 }, // 50 shares per minute
  
  // API endpoints
  GET_FEED: { window: 60, max: 120 }, // 120 feed requests per minute
  SEARCH: { window: 60, max: 60 }, // 60 searches per minute
  PROFILE_VIEW: { window: 60, max: 300 }, // 300 profile views per minute
  
  // Authentication
  LOGIN_ATTEMPT: { window: 900, max: 5 }, // 5 login attempts per 15 minutes
  SIGNUP: { window: 3600, max: 3 }, // 3 signups per hour from same IP
  
  // Media operations
  UPLOAD_MEDIA: { window: 3600, max: 50 }, // 50 uploads per hour
  TRANSCRIBE_VIDEO: { window: 3600, max: 20 }, // 20 transcriptions per hour
  
  // Global rate limits
  GLOBAL_API: { window: 60, max: 1000 }, // 1000 API calls per minute per user
}

export class RateLimiter {
  static async checkLimit(
    userId: string, 
    action: string, 
    config: RateLimitConfig,
    increment: number = 1
  ): Promise<RateLimitResult> {
    const key = CacheKeys.RATE_LIMIT(userId, action)
    const now = Math.floor(Date.now() / 1000)
    const window = now - (now % config.window)
    const windowKey = `${key}:${window}`

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = redis.pipeline()
      
      // Increment counter
      pipeline.incr(windowKey)
      
      // Set expiration (only if key is new)
      pipeline.expire(windowKey, config.window)
      
      // Get current count
      pipeline.get(windowKey)
      
      const results = await pipeline.exec()
      
      if (!results || results.some(result => result[0] !== null)) {
        throw new Error('Redis pipeline execution failed')
      }

      const currentCount = parseInt(results[2][1] as string) || 0
      const allowed = currentCount <= config.max
      const remaining = Math.max(0, config.max - currentCount)
      const resetTime = window + config.window

      return {
        allowed,
        remaining,
        resetTime,
        totalHits: currentCount
      }
    } catch (error) {
      console.error('Rate limiter error:', error)
      
      // Fail open if Redis is down and skipOnError is true
      if (config.skipOnError) {
        return {
          allowed: true,
          remaining: config.max,
          resetTime: now + config.window,
          totalHits: 0
        }
      }
      
      // Fail closed by default
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + config.window,
        totalHits: config.max + 1
      }
    }
  }

  // Check multiple rate limits in parallel
  static async checkMultipleLimits(
    userId: string,
    checks: Array<{ action: string; config: RateLimitConfig; increment?: number }>
  ): Promise<{ [action: string]: RateLimitResult }> {
    const promises = checks.map(check => 
      this.checkLimit(userId, check.action, check.config, check.increment)
        .then(result => ({ action: check.action, result }))
    )

    const results = await Promise.all(promises)
    
    return results.reduce((acc, { action, result }) => {
      acc[action] = result
      return acc
    }, {} as { [action: string]: RateLimitResult })
  }

  // Sliding window rate limiter for more precise control
  static async checkSlidingWindow(
    userId: string,
    action: string,
    windowSize: number, // Window size in seconds
    maxRequests: number,
    increment: number = 1
  ): Promise<RateLimitResult> {
    const key = CacheKeys.RATE_LIMIT(userId, `sliding:${action}`)
    const now = Date.now()
    const windowStart = now - (windowSize * 1000)

    try {
      const pipeline = redis.pipeline()
      
      // Remove old entries
      pipeline.zremrangebyscore(key, 0, windowStart)
      
      // Count current entries
      pipeline.zcard(key)
      
      // Add current request
      for (let i = 0; i < increment; i++) {
        pipeline.zadd(key, now + i, `${now + i}:${Math.random()}`)
      }
      
      // Set expiration
      pipeline.expire(key, windowSize)
      
      const results = await pipeline.exec()
      
      if (!results || results.some(result => result[0] !== null)) {
        throw new Error('Sliding window pipeline execution failed')
      }

      const currentCount = parseInt(results[1][1] as string) || 0
      const newCount = currentCount + increment
      const allowed = newCount <= maxRequests
      const remaining = Math.max(0, maxRequests - newCount)

      return {
        allowed,
        remaining,
        resetTime: Math.floor((now + (windowSize * 1000)) / 1000),
        totalHits: newCount
      }
    } catch (error) {
      console.error('Sliding window rate limiter error:', error)
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.floor((now + (windowSize * 1000)) / 1000),
        totalHits: maxRequests + 1
      }
    }
  }

  // Distributed rate limiter across multiple Redis instances
  static async checkDistributedLimit(
    userId: string,
    action: string,
    config: RateLimitConfig,
    shardCount: number = 3
  ): Promise<RateLimitResult> {
    const shard = this.getUserShard(userId, shardCount)
    const shardedKey = `${CacheKeys.RATE_LIMIT(userId, action)}:shard:${shard}`
    
    // Adjust limit per shard
    const adjustedMax = Math.ceil(config.max / shardCount)
    const adjustedConfig = { ...config, max: adjustedMax }

    return this.checkLimit(userId, `sharded:${action}`, adjustedConfig)
  }

  private static getUserShard(userId: string, shardCount: number): number {
    // Consistent hashing for user distribution
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash) % shardCount
  }

  // Rate limit middleware for API routes
  static middleware(action: string, config: RateLimitConfig) {
    return async (req: any, res: any, next: any) => {
      const userId = req.user?.id || req.ip // Fallback to IP for anonymous users
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const result = await this.checkLimit(userId, action, config)

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', config.max)
      res.setHeader('X-RateLimit-Remaining', result.remaining)
      res.setHeader('X-RateLimit-Reset', result.resetTime)

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: result.resetTime - Math.floor(Date.now() / 1000)
        })
      }

      next()
    }
  }
}

export default RateLimiter 