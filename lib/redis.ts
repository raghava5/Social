import Redis from 'ioredis'

// Redis cluster configuration for high availability
const redis = new Redis.Cluster([
  {
    host: process.env.REDIS_HOST_1 || 'localhost',
    port: parseInt(process.env.REDIS_PORT_1 || '6379'),
  },
  {
    host: process.env.REDIS_HOST_2 || 'localhost', 
    port: parseInt(process.env.REDIS_PORT_2 || '6380'),
  },
  {
    host: process.env.REDIS_HOST_3 || 'localhost',
    port: parseInt(process.env.REDIS_PORT_3 || '6381'),
  }
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD,
    connectTimeout: 10000,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  },
  enableOfflineQueue: false,
})

// Redis pub/sub for real-time features
export const publisher = new Redis.Cluster([
  {
    host: process.env.REDIS_HOST_1 || 'localhost',
    port: parseInt(process.env.REDIS_PORT_1 || '6379'),
  }
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD,
  }
})

export const subscriber = new Redis.Cluster([
  {
    host: process.env.REDIS_HOST_1 || 'localhost',
    port: parseInt(process.env.REDIS_PORT_1 || '6379'),
  }
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD,
  }
})

// Cache keys with proper namespacing
export const CacheKeys = {
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  POST: (postId: string) => `post:${postId}`,
  FEED: (userId: string, page: number) => `feed:${userId}:${page}`,
  LIKES: (postId: string) => `likes:${postId}`,
  COMMENTS: (postId: string) => `comments:${postId}`,
  TRENDING: () => `trending:posts`,
  USER_SESSION: (userId: string) => `session:${userId}`,
  RATE_LIMIT: (userId: string, action: string) => `rate_limit:${userId}:${action}`,
}

// Cache TTL constants (in seconds)
export const CacheTTL = {
  USER_PROFILE: 300, // 5 minutes
  POST: 600, // 10 minutes  
  FEED: 60, // 1 minute
  TRENDING: 300, // 5 minutes
  SESSION: 86400, // 24 hours
  RATE_LIMIT: 3600, // 1 hour
}

// High-performance cache operations
export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  static async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await redis.setex(key, ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache pattern invalidation error:', error)
    }
  }

  // Distributed lock for critical sections
  static async acquireLock(key: string, ttl: number = 10): Promise<string | null> {
    const lockKey = `lock:${key}`
    const lockValue = `${Date.now()}-${Math.random()}`
    
    try {
      const result = await redis.set(lockKey, lockValue, 'EX', ttl, 'NX')
      return result === 'OK' ? lockValue : null
    } catch (error) {
      console.error('Lock acquisition error:', error)
      return null
    }
  }

  static async releaseLock(key: string, lockValue: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `
    
    try {
      const result = await redis.eval(script, 1, `lock:${key}`, lockValue)
      return result === 1
    } catch (error) {
      console.error('Lock release error:', error)
      return false
    }
  }
}

export default redis 