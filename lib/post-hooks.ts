/**
 * Post Creation Hooks
 * Automatically triggers real-time updates and spoke detection when posts are created
 */

export class PostHooks {
  /**
   * Hook that should be called after any post is created
   * This will trigger real-time updates and spoke detection
   */
  static async afterPostCreated(postId: string) {
    try {
      console.log(`🎣 Post hook triggered for: ${postId}`)

      // Trigger real-time broadcast and spoke detection
      const response = await fetch('http://localhost:3000/api/ai/process-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId, 
          action: 'new_post' 
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Post hook completed for ${postId}:`, result)
      } else {
        console.error(`❌ Post hook failed for ${postId}:`, response.status)
      }

    } catch (error) {
      console.error(`❌ Post hook error for ${postId}:`, error)
    }
  }

  /**
   * Hook for when a user likes a post
   */
  static async afterPostLiked(postId: string, userId: string, liked: boolean, likeCount: number) {
    try {
      // Broadcast via WebSocket
      if (global.io) {
        global.io.emit('post_liked', {
          postId,
          userId,
          liked,
          likeCount
        })
        console.log(`📡 Broadcasted like update: ${postId} -> ${likeCount} likes`)
      }
    } catch (error) {
      console.error('Like hook error:', error)
    }
  }

  /**
   * Hook for when a user comments on a post
   */
  static async afterPostCommented(postId: string, comment: any, commentCount: number) {
    try {
      // Broadcast via WebSocket
      if (global.io) {
        global.io.emit('post_commented', {
          postId,
          comment,
          commentCount
        })
        console.log(`📡 Broadcasted comment update: ${postId} -> ${commentCount} comments`)
      }
    } catch (error) {
      console.error('Comment hook error:', error)
    }
  }

  /**
   * Manually trigger spoke detection for existing posts
   */
  static async detectSpokeForPost(postId: string) {
    try {
      console.log(`🎯 Manually triggering spoke detection for: ${postId}`)

      const response = await fetch('http://localhost:3000/api/ai/process-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId, 
          action: 'detect_spoke' 
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Spoke detection completed for ${postId}:`, result)
        return result
      } else {
        console.error(`❌ Spoke detection failed for ${postId}:`, response.status)
        return null
      }

    } catch (error) {
      console.error(`❌ Spoke detection error for ${postId}:`, error)
      return null
    }
  }
}

export default PostHooks 