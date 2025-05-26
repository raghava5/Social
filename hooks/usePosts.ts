import { useState, useEffect } from 'react'
import io from 'socket.io-client'

type PostType = 'help-request' | 'spend-time' | 'user-post' | 'campaign' | 'activity' | 'tool' | 'game';

interface Author {
  id: string
  name: string
  avatar?: string
}

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  isEdited?: boolean
  user: {
    id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
    avatar?: string
  }
}

interface Post {
  id: string
  type: PostType
  author: Author
  content: string
  images?: string
  videos?: string
  likes: number
  comments: number
  commentsList: Comment[]
  shares: number
  timestamp: string
  updatedAt?: string
  isEdited?: boolean
  spoke?: string
  location?: string
  feeling?: string
  tags?: string[]
  isLikedByCurrentUser?: boolean
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
  count: number
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<any>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: true,
    count: 0
  })

  useEffect(() => {
    let mounted = true

    // Initialize socket connection (if not already available globally)
    const initializeSocket = () => {
      try {
        // Check if socket already exists globally (from home page)
        if (typeof window !== 'undefined' && (window as any).socket) {
          console.log('📡 Using existing global socket')
          return (window as any).socket
        }

        const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
          reconnectionAttempts: 3,
          timeout: 10000,
        })

        socketInstance.on('connect_error', (err) => {
          console.warn('Socket connection error:', err)
        })

        if (mounted) {
          setSocket(socketInstance)
        }

        return socketInstance
      } catch (error) {
        console.warn('Failed to initialize socket:', error)
        return null
      }
    }

    // Load initial posts
    fetchPosts()

    // Initialize socket and set up listeners
    const socketInstance = initializeSocket()
    if (socketInstance) {
      socketInstance.on('new-post', handleNewPost)
      socketInstance.on('post-updated', handlePostUpdate)
      socketInstance.on('post-deleted', handlePostDelete)
      socketInstance.on('post-liked', handlePostLike)
      socketInstance.on('new-comment', handleNewComment)
    }

    return () => {
      mounted = false
      if (socketInstance) {
        socketInstance.off('new-post', handleNewPost)
        socketInstance.off('post-updated', handlePostUpdate)
        socketInstance.off('post-deleted', handlePostDelete)
        socketInstance.off('post-liked', handlePostLike)
        socketInstance.off('new-comment', handleNewComment)
        socketInstance.disconnect()
      }
    }
  }, [])

  const fetchPosts = async (page = 1, limit = 10, reset = false) => {
    try {
      if (reset || page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(`/api/posts?page=${page}&limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      const data = await response.json()
      
      // Convert API posts to Post type with error handling
      const formattedPosts = data.posts
        .map((post: any) => {
          try {
            return formatPost(post)
          } catch (formatError) {
            console.error('❌ Skipping malformed post:', formatError, post)
            return null
          }
        })
        .filter(Boolean) // Remove null posts
      
      console.log(`📊 Fetched ${formattedPosts.length} valid posts out of ${data.posts.length} total`)
      
      // Update posts: replace if page 1 or reset, append if loading more
      if (reset || page === 1) {
        setPosts(formattedPosts)
      } else {
        setPosts(prevPosts => [...prevPosts, ...formattedPosts])
      }
      
      // Update pagination
      setPagination(data.pagination)
      
      // Clear any previous errors
      setError(null)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Failed to load posts')
      if (page === 1) {
        setPosts([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMorePosts = async () => {
    if (loadingMore || !pagination.hasMore) return
    await fetchPosts(pagination.page + 1, pagination.limit, false)
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

  const formatPost = (post: any): Post => {
    try {
      // Validate media URLs to prevent blob URLs
      const images = post.images
      const videos = post.videos
      
      if (images && images.startsWith('blob:')) {
        console.error('❌ BLOB URL detected in formatPost images:', images)
        throw new Error('Invalid blob URL in post images')
      }
      
      if (videos && videos.startsWith('blob:')) {
        console.error('❌ BLOB URL detected in formatPost videos:', videos)
        throw new Error('Invalid blob URL in post videos')
      }
      
      return {
        id: post.id,
        type: post.type || 'user-post',
        author: {
          id: post.authorId,
          name: post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Anonymous User',
          avatar: post.author?.profileImageUrl || post.author?.avatar || '/images/avatars/default.svg',
        },
        content: post.content || '',
        images: images,
        videos: videos,
        likes: post.likes?.length || 0,
        comments: post.comments?.length || 0,
        commentsList: post.comments || [],
        shares: post.shares || 0,
        timestamp: post.createdAt || new Date(),
        updatedAt: post.updatedAt,
        isEdited: post.isEdited || false,
        spoke: post.spoke,
        location: post.location,
        feeling: post.feeling,
        tags: post.tags ? post.tags.split(',') : [],
        isLikedByCurrentUser: post.isLikedByCurrentUser || false,
      }
    } catch (error) {
      console.error('❌ Error formatting post:', error, post)
      throw error
    }
  }

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
      console.log('🚀 Starting Facebook-style post creation with media-first approach...')
      
      // 🚀 STEP 1: Upload media files FIRST and get permanent URLs
      const files = formData.getAll('files') as File[]
      let permanentVideoUrl = undefined
      let permanentImageUrl = undefined
      let hasMedia = false
      
      // Separate video and image files
      const videoFile = files.find(file => file.type.startsWith('video/'))
      const imageFile = files.find(file => file.type.startsWith('image/'))

      // Upload video first if present
      if (videoFile && videoFile.size > 0) {
        hasMedia = true
        setUploadingMedia(true)
        console.log('📤 Uploading video first...')
        
        const videoFormData = new FormData()
        videoFormData.append('file', videoFile)
        
        const videoUploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: videoFormData,
          credentials: 'include',
        })
        
        if (!videoUploadResponse.ok) {
          throw new Error('Failed to upload video')
        }
        
        const videoData = await videoUploadResponse.json()
        permanentVideoUrl = videoData.url
        console.log('✅ Video uploaded successfully:', permanentVideoUrl)
      }
      
      // Upload image if present
      if (imageFile && imageFile.size > 0) {
        hasMedia = true
        setUploadingMedia(true)
        console.log('📤 Uploading image first...')
        
        const imageFormData = new FormData()
        imageFormData.append('file', imageFile)
        
        const imageUploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
          credentials: 'include',
        })
        
        if (!imageUploadResponse.ok) {
          throw new Error('Failed to upload image')
        }
        
        const imageData = await imageUploadResponse.json()
        permanentImageUrl = imageData.url
        console.log('✅ Image uploaded successfully:', permanentImageUrl)
      }

      // 🚀 STEP 2: Create optimistic post with PERMANENT URLs (no blob URLs!)
      const optimisticPost: Post = {
        id: `temp-${Date.now()}`, // Temporary ID
        type: 'user-post',
        author: {
          id: 'current-user',
          name: 'You',
          avatar: '/images/avatars/default.svg'
        },
        content: formData.get('content')?.toString() || '',
        images: permanentImageUrl,
        videos: permanentVideoUrl,
        likes: 0,
        comments: 0,
        commentsList: [],
        shares: 0,
        timestamp: new Date().toISOString(),
        spoke: undefined, // Will be detected later
        isLikedByCurrentUser: false
      }

      // Add optimistic post immediately to the top of the feed (with permanent URLs)
      setPosts(prevPosts => {
        try {
          console.log('📱 OPTIMISTIC UI: Adding post with permanent media URLs')
          console.log('🔍 Media URLs:', { images: permanentImageUrl, videos: permanentVideoUrl })
          
          // Validate that media URLs are NOT blob URLs
          if (permanentImageUrl && permanentImageUrl.startsWith('blob:')) {
            console.error('❌ BLOB URL DETECTED in image:', permanentImageUrl)
            throw new Error('Invalid blob URL detected in optimistic post')
          }
          if (permanentVideoUrl && permanentVideoUrl.startsWith('blob:')) {
            console.error('❌ BLOB URL DETECTED in video:', permanentVideoUrl)
            throw new Error('Invalid blob URL detected in optimistic post')
          }
          
          return [optimisticPost, ...prevPosts]
        } catch (error) {
          console.error('❌ Failed to add optimistic post:', error)
          throw error
        }
      })
      console.log('✅ OPTIMISTIC UI: Post added successfully')
      
      // Reset upload state
      setUploadingMedia(false)

      // 🚀 STEP 3: Create new FormData with uploaded media URLs for backend
      const postFormData = new FormData()
      postFormData.append('content', formData.get('content')?.toString() || '')
      
      // Add other fields
      if (formData.get('feeling')) postFormData.append('feeling', formData.get('feeling') as string)
      if (formData.get('location')) postFormData.append('location', formData.get('location') as string)
      if (formData.get('spoke')) postFormData.append('spoke', formData.get('spoke') as string)
      if (formData.get('type')) postFormData.append('type', formData.get('type') as string)
      
      // Add media URLs as files (create dummy files with the URLs)
      if (permanentVideoUrl) {
        // Create a dummy file for the backend API
        const dummyVideoFile = new File([''], 'video.mp4', { type: 'video/mp4' })
        postFormData.append('files', dummyVideoFile)
        postFormData.append('uploadedVideoUrl', permanentVideoUrl)
      }
      
      if (permanentImageUrl) {
        // Create a dummy file for the backend API
        const dummyImageFile = new File([''], 'image.jpg', { type: 'image/jpeg' })
        postFormData.append('files', dummyImageFile)
        postFormData.append('uploadedImageUrl', permanentImageUrl)
      }

      // 🚀 STEP 4: Send to backend
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: postFormData,
        credentials: 'include',
      })

      if (!response.ok) {
        // Rollback optimistic update on failure
        setPosts(prevPosts => prevPosts.filter(p => p.id !== optimisticPost.id))
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }

      const newPost = await response.json()
      console.log('📦 Raw post data from server:', newPost)
      
      const formattedPost = formatPost(newPost)
      console.log('📝 Formatted post data:', formattedPost)
      
      // 🚀 STEP 5: Replace optimistic post with real post (URLs should be the same now)
      setPosts(prevPosts => {
        try {
          const updatedPosts = prevPosts.map(post => 
            post.id === optimisticPost.id ? formattedPost : post
          )
          console.log('✅ REAL POST: Replaced optimistic post with real data')
          console.log('🔍 Final media URLs:', { 
            images: formattedPost.images, 
            videos: formattedPost.videos 
          })
          return updatedPosts
        } catch (error) {
          console.error('❌ Failed to replace optimistic post:', error)
          // Return previous state on error
          return prevPosts
        }
      })
      
      // 🚀 STEP 4: Real-time broadcast to other users (WebSocket)
      if (typeof window !== 'undefined' && (window as any).socket) {
        try {
          (window as any).socket.emit('broadcast_new_post', {
            post: formattedPost,
            action: 'prepend'
          })
          console.log(`📡 WEBSOCKET: Broadcasted to other users: ${formattedPost.id}`)
        } catch (wsError) {
          console.warn('WebSocket broadcast failed:', wsError)
        }
      }
      
      // 🚀 STEP 5: Background spoke detection (async)
      setTimeout(async () => {
        try {
          const spokeResponse = await fetch('/api/ai/process-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              postId: newPost.id, 
              action: 'detect_spoke' 
            })
          })
          
          if (spokeResponse.ok) {
            const spokeData = await spokeResponse.json()
            // Update the post with detected spoke
            if (spokeData.spoke) {
              setPosts(prevPosts => 
                prevPosts.map(post => 
                  post.id === newPost.id 
                    ? { ...post, spoke: spokeData.spoke }
                    : post
                )
              )
              console.log(`🎯 SPOKE UPDATED: ${newPost.id} -> ${spokeData.spoke}`)
            }
          }
          
          console.log(`🎯 SPOKE DETECTION: Triggered for post: ${newPost.id}`)
        } catch (spokeError) {
          console.warn('Spoke detection failed:', spokeError)
        }
      }, 100) // Run asynchronously without blocking UI
      
      setError(null)
      return true

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post'
      setError(errorMessage)
      console.error('❌ POST CREATION FAILED:', error)
      
      // Reset upload state on error
      setUploadingMedia(false)
      
      // Remove any optimistic posts that might have been added
      setPosts(prevPosts => {
        const filteredPosts = prevPosts.filter(post => !post.id.startsWith('temp-'))
        console.log('🧹 Cleaned up optimistic posts after error')
        return filteredPosts
      })
      
      return false
    }
  }

  // 🚀 OPTIMISTIC LIKE: Instant UI update for likes
  const optimisticLike = (postId: string, userId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { 
              ...post, 
              likes: post.isLikedByCurrentUser ? post.likes - 1 : post.likes + 1,
              isLikedByCurrentUser: !post.isLikedByCurrentUser 
            }
          : post
      )
    )
    console.log(`❤️ OPTIMISTIC LIKE: Updated like for post ${postId}`)
  }

  // 🚀 OPTIMISTIC SAVE: Instant UI feedback for saves
  const optimisticSave = (postId: string) => {
    console.log(`💾 OPTIMISTIC SAVE: Post ${postId} saved (instant feedback)`)
    // You can add visual feedback here if needed
  }

  return {
    posts,
    loading,
    loadingMore,
    error,
    pagination,
    createPost,
    refreshPosts: fetchPosts,
    loadMorePosts,
    optimisticLike,
    optimisticSave,
    uploadingMedia,
  }
} 