import { useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface Post {
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

interface FeedState {
  posts: Post[]
  loading: boolean
  hasMore: boolean
  lastUpdated: number
}

export function useRealTimeFeed(userId?: string) {
  const [feedState, setFeedState] = useState<FeedState>({
    posts: [],
    loading: true,
    hasMore: true,
    lastUpdated: Date.now()
  })
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  // Initialize WebSocket connection
  useEffect(() => {
    if (!userId) return

    const newSocket = io({
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket')
      setConnected(true)
      
      // Authenticate with the server
      newSocket.emit('authenticate', { 
        token: localStorage.getItem('authToken') || 'dummy-token' 
      })
    })

    newSocket.on('authenticated', (data) => {
      console.log('✅ WebSocket authenticated:', data)
    })

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket')
      setConnected(false)
    })

    // Listen for new posts
    newSocket.on('new_post', (data) => {
      console.log('📬 New post received:', data)
      handleNewPost(data.post, data.action)
    })

    // Listen for post updates
    newSocket.on('post_spoke_updated', (data) => {
      console.log('🎯 Post spoke updated:', data)
      handlePostSpokeUpdate(data.postId, data.spoke)
    })

    // Listen for real-time interactions
    newSocket.on('post_liked', (data) => {
      console.log('❤️ Post liked:', data)
      handlePostLike(data.postId, data.likeCount)
    })

    newSocket.on('post_commented', (data) => {
      console.log('💬 Post commented:', data)
      handlePostComment(data.postId, data.comment)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [userId])

  // Handle new post addition (Facebook-style prepend)
  const handleNewPost = useCallback((newPost: Post, action: string) => {
    setFeedState(prev => {
      if (action === 'prepend') {
        // Check if post already exists to avoid duplicates
        const exists = prev.posts.some(post => post.id === newPost.id)
        if (exists) return prev

        return {
          ...prev,
          posts: [newPost, ...prev.posts],
          lastUpdated: Date.now()
        }
      }
      return prev
    })
  }, [])

  // Handle post spoke updates
  const handlePostSpokeUpdate = useCallback((postId: string, spoke: string) => {
    setFeedState(prev => ({
      ...prev,
      posts: prev.posts.map(post => 
        post.id === postId ? { ...post, spoke } : post
      ),
      lastUpdated: Date.now()
    }))
  }, [])

  // Handle real-time like updates
  const handlePostLike = useCallback((postId: string, likeCount: number) => {
    setFeedState(prev => ({
      ...prev,
      posts: prev.posts.map(post => 
        post.id === postId ? { ...post, likes: likeCount } : post
      ),
      lastUpdated: Date.now()
    }))
  }, [])

  // Handle real-time comment updates
  const handlePostComment = useCallback((postId: string, comment: any) => {
    setFeedState(prev => ({
      ...prev,
      posts: prev.posts.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments + 1 }
          : post
      ),
      lastUpdated: Date.now()
    }))
  }, [])

  // Load initial feed
  const loadFeed = useCallback(async (refresh = false) => {
    if (!userId) return

    try {
      setFeedState(prev => ({ ...prev, loading: true }))

      const response = await fetch(`/api/feed?userId=${userId}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        
        setFeedState(prev => ({
          posts: refresh ? data.posts : [...prev.posts, ...data.posts],
          loading: false,
          hasMore: data.hasMore,
          lastUpdated: Date.now()
        }))
      }
    } catch (error) {
      console.error('Failed to load feed:', error)
      setFeedState(prev => ({ ...prev, loading: false }))
    }
  }, [userId])

  // Load more posts (pagination)
  const loadMore = useCallback(async () => {
    if (!feedState.hasMore || feedState.loading) return

    await loadFeed(false)
  }, [feedState.hasMore, feedState.loading, loadFeed])

  // Refresh feed
  const refresh = useCallback(async () => {
    await loadFeed(true)
  }, [loadFeed])

  // Add new post to feed (when user creates a post)
  const addPost = useCallback((newPost: Post) => {
    setFeedState(prev => ({
      ...prev,
      posts: [newPost, ...prev.posts],
      lastUpdated: Date.now()
    }))

    // Emit to WebSocket for real-time distribution
    if (socket && connected) {
      socket.emit('new_post_created', { post: newPost })
    }
  }, [socket, connected])

  // Remove post from feed
  const removePost = useCallback((postId: string) => {
    setFeedState(prev => ({
      ...prev,
      posts: prev.posts.filter(post => post.id !== postId),
      lastUpdated: Date.now()
    }))
  }, [])

  // Update specific post
  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    setFeedState(prev => ({
      ...prev,
      posts: prev.posts.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      ),
      lastUpdated: Date.now()
    }))
  }, [])

  return {
    posts: feedState.posts,
    loading: feedState.loading,
    hasMore: feedState.hasMore,
    connected,
    lastUpdated: feedState.lastUpdated,
    loadFeed,
    loadMore,
    refresh,
    addPost,
    removePost,
    updatePost
  }
} 