import { CacheService, CacheKeys } from './redis'
import { websocketManager } from './websocket-manager'
import FeedService from './feed-service'

export interface PostCreationData {
  userId: string
  content: string
  images?: string[]
  videos?: string[]
  feeling?: string
  location?: string
  tags?: string[]
  spoke?: string
}

export interface CreatedPost {
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
  author: {
    id: string
    name: string
    avatar?: string
    profileImageUrl?: string
  }
}

export class PostService {
  /**
   * Create a new post with real-time feed updates
   */
  static async createPost(postData: PostCreationData): Promise<CreatedPost> {
    try {
      // Create mock post for now - will be replaced with actual database call
      const mockPost: CreatedPost = {
        id: `post_${Date.now()}`,
        authorId: postData.userId,
        content: postData.content,
        images: postData.images?.join(','),
        videos: postData.videos?.join(','),
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        spoke: postData.spoke,
        location: postData.location,
        feeling: postData.feeling,
        tags: postData.tags,
        author: {
          id: postData.userId,
          name: 'User Name', // This will be populated from database
          profileImageUrl: '/images/avatars/default.svg'
        }
      }

      // Real-time updates (Facebook-style)
      await this.handleRealTimeUpdates(mockPost)

      // Process spoke tag generation asynchronously
      this.processAutoSpokeTagging(mockPost).catch(error => 
        console.error('Auto spoke tagging failed:', error)
      )

      return mockPost

    } catch (error) {
      console.error('Post creation failed:', error)
      throw new Error('Failed to create post')
    }
  }

  /**
   * Handle real-time updates for new posts
   */
  private static async handleRealTimeUpdates(post: CreatedPost): Promise<void> {
    try {
      // 1. Invalidate author's followers' feed cache
      await FeedService.invalidateFollowerFeeds(post.authorId)

      // 2. Broadcast new post to followers in real-time
      // For now, broadcast to all connected users (will be optimized later)
      await websocketManager.broadcast('new_post', {
        post,
        action: 'prepend' // Add to top of feed
      })

      // 3. Update cached feeds
      await this.prependPostToCache(post.authorId, post)

      console.log(`📡 Real-time updates sent for post ${post.id}`)

    } catch (error) {
      console.error('Real-time updates failed:', error)
    }
  }

  /**
   * Prepend new post to cached feed
   */
  private static async prependPostToCache(userId: string, post: CreatedPost): Promise<void> {
    try {
      const cacheKey = CacheKeys.FEED(userId, 0) // First page
      const cachedFeed = await CacheService.get<any>(cacheKey)
      
      if (cachedFeed && cachedFeed.posts) {
        // Add post to beginning of feed
        cachedFeed.posts.unshift(post)
        
        // Keep only the latest 20 posts in first page
        if (cachedFeed.posts.length > 20) {
          cachedFeed.posts = cachedFeed.posts.slice(0, 20)
        }
        
        // Update timestamp
        cachedFeed.lastUpdated = Date.now()
        
        // Save back to cache
        await CacheService.set(cacheKey, cachedFeed, 60) // 1 minute TTL
      }
    } catch (error) {
      console.error('Failed to update cached feed:', error)
    }
  }

  /**
   * Process automatic spoke tagging for posts
   */
  private static async processAutoSpokeTagging(post: CreatedPost): Promise<void> {
    try {
      // Skip if post already has a spoke tag
      if (post.spoke) return

      let detectedSpoke: string | null = null

      // Step 1: Analyze text content first
      detectedSpoke = await this.analyzeTextForSpoke(post.content)

      if (!detectedSpoke) {
        // Step 2: Analyze media content
        if (post.videos) {
          detectedSpoke = await this.analyzeVideoForSpoke(post.id, post.videos)
        } else if (post.images) {
          detectedSpoke = await this.analyzeImageForSpoke(post.images)
        }
      }

      // Update post with detected spoke
      if (detectedSpoke) {
        await this.updatePostSpoke(post.id, detectedSpoke)
        
        // Broadcast spoke update to real-time clients
        await websocketManager.emitToUser(post.authorId, 'post_spoke_updated', {
          postId: post.id,
          spoke: detectedSpoke
        })

        console.log(`🎯 Auto-detected spoke "${detectedSpoke}" for post ${post.id}`)
      }

    } catch (error) {
      console.error('Auto spoke tagging failed:', error)
    }
  }

  /**
   * Analyze text content for spoke keywords
   */
  private static async analyzeTextForSpoke(content: string): Promise<string | null> {
    const spokeKeywords = {
      'Spiritual': ['spiritual', 'meditation', 'prayer', 'faith', 'soul', 'mindfulness', 'zen', 'enlightenment', 'divine', 'sacred'],
      'Mental': ['mental', 'psychology', 'anxiety', 'depression', 'therapy', 'counseling', 'mind', 'thoughts', 'emotions', 'stress'],
      'Physical': ['fitness', 'workout', 'exercise', 'gym', 'health', 'running', 'yoga', 'sports', 'physical', 'body'],
      'Personal': ['personal', 'self', 'growth', 'development', 'goals', 'habits', 'reflection', 'journal', 'diary', 'me'],
      'Professional': ['work', 'career', 'job', 'professional', 'business', 'office', 'meeting', 'project', 'team', 'leadership'],
      'Financial': ['money', 'financial', 'investment', 'savings', 'budget', 'income', 'expenses', 'wealth', 'economy', 'finance'],
      'Social': ['friends', 'family', 'social', 'relationships', 'community', 'networking', 'people', 'connection', 'love', 'friendship'],
      'Societal': ['society', 'politics', 'news', 'social issues', 'community service', 'volunteering', 'activism', 'charity', 'justice', 'equality'],
      'Fun & Recreation': ['fun', 'entertainment', 'games', 'movies', 'music', 'travel', 'adventure', 'hobby', 'recreation', 'leisure']
    }

    const contentLower = content.toLowerCase()
    let bestMatch: { spoke: string; score: number } = { spoke: '', score: 0 }

    for (const [spoke, keywords] of Object.entries(spokeKeywords)) {
      let score = 0
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
        const matches = contentLower.match(regex)
        if (matches) {
          score += matches.length
        }
      }
      
      if (score > bestMatch.score) {
        bestMatch = { spoke, score }
      }
    }

    // Return spoke if confidence is high enough
    return bestMatch.score >= 2 ? bestMatch.spoke : null
  }

  /**
   * Analyze video transcript for spoke
   */
  private static async analyzeVideoForSpoke(postId: string, videoPaths: string): Promise<string | null> {
    try {
      // Get transcript from API
      const response = await fetch(`/api/transcribe?postId=${postId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.transcript) {
          // Analyze transcript text for spoke
          const spokeFromTranscript = await this.analyzeTextForSpoke(data.transcript)
          
          if (spokeFromTranscript) {
            return spokeFromTranscript
          }

          // If keyword analysis fails, use AI analysis
          return await this.analyzeTextWithAI(data.transcript)
        }
      }

      return null
    } catch (error) {
      console.error('Video spoke analysis failed:', error)
      return null
    }
  }

  /**
   * Analyze image for spoke using CLIP
   */
  private static async analyzeImageForSpoke(imagePaths: string): Promise<string | null> {
    try {
      // This will be implemented with CLIP in the next section
      const response = await fetch('/api/ai/analyze-image-spoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath: imagePaths.split(',')[0] })
      })

      if (response.ok) {
        const result = await response.json()
        return result.spoke || null
      }

      return null
    } catch (error) {
      console.error('Image spoke analysis failed:', error)
      return null
    }
  }

  /**
   * Analyze text with AI for spoke detection
   */
  private static async analyzeTextWithAI(text: string): Promise<string | null> {
    try {
      const response = await fetch('/api/ai/detect-spoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (response.ok) {
        const result = await response.json()
        return result.spoke || null
      }

      return null
    } catch (error) {
      console.error('AI spoke analysis failed:', error)
      return null
    }
  }

  /**
   * Update post with detected spoke
   */
  private static async updatePostSpoke(postId: string, spoke: string): Promise<void> {
    try {
      // Update via API endpoint
      await fetch(`/api/posts/${postId}/update-spoke`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spoke })
      })

      // Invalidate post cache
      await CacheService.del(CacheKeys.POST(postId))
    } catch (error) {
      console.error('Failed to update post spoke:', error)
    }
  }
}

export default PostService 