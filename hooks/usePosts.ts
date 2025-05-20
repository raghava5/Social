import { useState, useEffect } from 'react'
import io from 'socket.io-client'

type PostType = 'help-request' | 'spend-time' | 'user-post' | 'campaign' | 'activity' | 'tool' | 'game';

interface Author {
  id: string
  name: string
  avatar?: string
}

interface Post {
  id: string
  type: PostType
  author: Author
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  timestamp: string
  spoke?: string
  location?: string
  feeling?: string
  tags?: string[]
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

    // Load initial posts
    fetchPosts()

    // Listen for new posts
    socket.on('new-post', handleNewPost)

    // Listen for post updates
    socket.on('post-updated', handlePostUpdate)
    socket.on('post-deleted', handlePostDelete)
    socket.on('post-liked', handlePostLike)
    socket.on('new-comment', handleNewComment)

    return () => {
      socket.off('new-post', handleNewPost)
      socket.off('post-updated', handlePostUpdate)
      socket.off('post-deleted', handlePostDelete)
      socket.off('post-liked', handlePostLike)
      socket.off('new-comment', handleNewComment)
      socket.disconnect()
    }
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts')
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      const data = await response.json()
      
      // Convert API posts to Post type
      const formattedPosts = data.posts.map(formatPost)
      setPosts(formattedPosts)
      
      // Clear any previous errors
      setError(null)
    } catch (error) {
      console.error('Error fetching posts:', error)
      // Set error to null for empty posts to show empty state
      setError(null)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleNewPost = (post: any) => {
    const formattedPost = formatPost(post)
    setPosts(prevPosts => [formattedPost, ...prevPosts])
  }

  const handlePostUpdate = (updatedPost: any) => {
    const formattedPost = formatPost(updatedPost)
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === formattedPost.id ? formattedPost : post
      )
    )
  }

  const handlePostDelete = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
  }

  const handlePostLike = (data: { postId: string; userId: string }) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === data.postId
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    )
  }

  const handleNewComment = (data: { postId: string; comment: any }) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === data.postId
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    )
  }

  const formatPost = (post: any): Post => ({
    id: post.id,
    type: post.type || 'user-post',
    author: {
      id: post.authorId,
      name: post.author.name,
      avatar: post.author.image || '/avatars/default.jpg',
    },
    content: post.content,
    image: post.images?.[0],
    likes: post.likes?.length || 0,
    comments: post.comments?.length || 0,
    shares: post.shares || 0,
    timestamp: formatTimestamp(post.createdAt || new Date()),
    spoke: post.spoke,
    location: post.location,
    feeling: post.feeling,
    tags: post.tags || [],
  })

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const createPost = async (formData: FormData) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      const newPost = await response.json()
      
      // Immediately add the new post to the local state
      const formattedPost = formatPost(newPost)
      setPosts(prevPosts => [formattedPost, ...prevPosts])
      
      // If WebSocket fails, at least we updated the local state
      try {
        // Attempt WebSocket emit, but don't fail if it's not available
        if ((global as any).io) {
          (global as any).io.emit('new-post', newPost)
        }
      } catch (wsError) {
        console.warn('WebSocket emit failed:', wsError)
      }
      
      return true
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create post')
      console.error('Error creating post:', error)
      return false
    }
  }

  return {
    posts,
    loading,
    error,
    createPost,
    refreshPosts: fetchPosts,
  }
} 