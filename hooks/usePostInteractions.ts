import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

type PostInteractionHook = {
  likePost: (postId: string) => Promise<any>
  commentOnPost: (postId: string, content: string) => Promise<any>
  sharePost: (postId: string, shareType?: string) => Promise<void>
  likeLoading: boolean
  commentLoading: boolean
  shareLoading: boolean
  likeError: string | null
  commentError: string | null
  shareError: string | null
}

// Generate a simple user ID for this session (Facebook-like approach)
const getSessionUserId = () => {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('temp-user-id')
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('temp-user-id', userId)
    }
    return userId
  }
  return 'anonymous-user'
}

export function usePostInteractions(): PostInteractionHook {
  const { user } = useAuth()
  const [likeLoading, setLikeLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [likeError, setLikeError] = useState<string | null>(null)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)

  const getUserId = () => {
    return user?.id || getSessionUserId()
  }

  const likePost = async (postId: string) => {
    try {
      setLikeLoading(true)
      setLikeError(null)

      console.log('Sending like request for post:', postId)
      
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: getUserId()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        console.error('Like request failed:', response.status, errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to like post`)
      }

      const data = await response.json()
      console.log('Like response:', data)
      
      return data
    } catch (error) {
      console.error('Error liking post:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to like post'
      setLikeError(errorMessage)
      throw error
    } finally {
      setLikeLoading(false)
    }
  }

  const commentOnPost = async (postId: string, content: string) => {
    if (!content.trim()) {
      setCommentError('Comment cannot be empty')
      throw new Error('Comment cannot be empty')
    }

    try {
      setCommentLoading(true)
      setCommentError(null)
      
      console.log('Sending comment for post:', postId, content)

      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          userId: getUserId(),
          userEmail: user?.email,
          userFirstName: user?.user_metadata?.firstName || user?.email?.split('@')[0] || 'User',
          userLastName: user?.user_metadata?.lastName || '',
          userProfileImage: user?.user_metadata?.avatar_url || user?.user_metadata?.profileImageUrl
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Comment request failed:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to post comment')
      }

      const data = await response.json()
      console.log('Comment response:', data)
      
      return data
    } catch (error) {
      console.error('Error posting comment:', error)
      setCommentError(error instanceof Error ? error.message : 'Failed to post comment')
      throw error
    } finally {
      setCommentLoading(false)
    }
  }

  const sharePost = async (postId: string, shareType: string = 'general') => {
    try {
      setShareLoading(true)
      setShareError(null)
      
      console.log('Sharing post:', postId, shareType)

      const response = await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareType,
          userId: getUserId()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Share request failed:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to share post')
      }

      const data = await response.json()
      console.log('Share response:', data)
      
      return data
    } catch (error) {
      console.error('Error sharing post:', error)
      setShareError(error instanceof Error ? error.message : 'Failed to share post')
      throw error
    } finally {
      setShareLoading(false)
    }
  }

  return {
    likePost,
    commentOnPost,
    sharePost,
    likeLoading,
    commentLoading,
    shareLoading,
    likeError,
    commentError,
    shareError,
  }
} 