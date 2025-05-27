import { useState, useEffect } from 'react'
import socketManager from '../lib/socket-manager'

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
  audios?: string
  documents?: string
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

    // Initialize optimized socket connection
    const initializeSocket = async () => {
      try {
        console.log('📡 Initializing optimized socket connection...')
        const { optimizedSocketManager } = await import('../lib/socket-manager-optimized')
        const socketInstance = await optimizedSocketManager.connect()
        
        if (mounted && socketInstance) {
          setSocket(socketInstance)
          // Store globally for other components
          ;(window as any).socket = socketInstance
        }

        return socketInstance
      } catch (error) {
        console.warn('Failed to initialize optimized socket:', error)
        return null
      }
    }

    // Load initial posts
    fetchPosts()

    // Initialize socket and set up listeners
    initializeSocket().then(socketInstance => {
      if (socketInstance && mounted) {
        // Use optimized socket manager's event methods
        const { optimizedSocketManager } = require('../lib/socket-manager-optimized')
        
        optimizedSocketManager.on('new-post', handleNewPost)
        optimizedSocketManager.on('post-updated', handlePostUpdate)
        optimizedSocketManager.on('post-deleted', handlePostDelete)
        optimizedSocketManager.on('post-liked', handlePostLike)
        optimizedSocketManager.on('new-comment', handleNewComment)
      }
    }).catch(error => {
      console.error('Failed to initialize optimized socket:', error)
    })

    return () => {
      mounted = false
      // Cleanup using optimized socket manager
      if (typeof window !== 'undefined') {
        const { optimizedSocketManager } = require('../lib/socket-manager-optimized')
        optimizedSocketManager.off('new-post', handleNewPost)
        optimizedSocketManager.off('post-updated', handlePostUpdate)
        optimizedSocketManager.off('post-deleted', handlePostDelete)
        optimizedSocketManager.off('post-liked', handlePostLike)
        optimizedSocketManager.off('new-comment', handleNewComment)
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
        audios: post.audios,
        documents: post.documents,
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
      let permanentAudioUrl = undefined
      let permanentDocumentUrl = undefined
      let hasMedia = false
      
      // Separate different file types
      const videoFile = files.find(file => file.type.startsWith('video/'))
      const imageFile = files.find(file => file.type.startsWith('image/'))
      const audioFile = files.find(file => file.type.startsWith('audio/'))
      const documentFile = files.find(file => 
        file.type.includes('pdf') || 
        file.type.includes('document') || 
        file.type.includes('text') ||
        file.type.includes('application/')
      )

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

      // Upload audio if present
      if (audioFile && audioFile.size > 0) {
        hasMedia = true
        setUploadingMedia(true)
        console.log('📤 Uploading audio first...')
        
        const audioFormData = new FormData()
        audioFormData.append('file', audioFile)
        
        const audioUploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: audioFormData,
          credentials: 'include',
        })
        
        if (!audioUploadResponse.ok) {
          throw new Error('Failed to upload audio')
        }
        
        const audioData = await audioUploadResponse.json()
        permanentAudioUrl = audioData.url
        console.log('✅ Audio uploaded successfully:', permanentAudioUrl)

        // 🎵 OPTIMIZED AUDIO CLASSIFICATION: Non-blocking classification
        try {
          console.log('🧠 Starting optimized audio classification...')
          const { optimizedAudioClassifier } = await import('../lib/audio-classifier-optimized')
          
          // Use optimized classifier (non-blocking with Web Workers)
          const classification = await optimizedAudioClassifier.classifyAudio(permanentAudioUrl, audioFile.name)
          
          console.log(`🎯 Audio classified as: ${classification.type} (${Math.round(classification.confidence * 100)}% in ${classification.processingTime}ms)`)
          
          // Store classification for later use
          ;(audioFile as any).classification = classification
          
        } catch (classificationError) {
          console.warn('⚠️ Optimized audio classification failed, using fallback:', classificationError)
          // Fallback classification
          ;(audioFile as any).classification = { type: 'audio', confidence: 0.5 }
        }
      }

      // Upload document if present
      if (documentFile && documentFile.size > 0) {
        hasMedia = true
        setUploadingMedia(true)
        console.log('📤 Uploading document first...')
        
        const documentFormData = new FormData()
        documentFormData.append('file', documentFile)
        
        const documentUploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: documentFormData,
          credentials: 'include',
        })
        
        if (!documentUploadResponse.ok) {
          throw new Error('Failed to upload document')
        }
        
        const documentData = await documentUploadResponse.json()
        permanentDocumentUrl = documentData.url
        console.log('✅ Document uploaded successfully:', permanentDocumentUrl)
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
        audios: permanentAudioUrl,
        documents: permanentDocumentUrl,
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
          console.log('🔍 Media URLs:', { 
            images: permanentImageUrl, 
            videos: permanentVideoUrl, 
            audios: permanentAudioUrl, 
            documents: permanentDocumentUrl 
          })
          
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

      if (permanentAudioUrl) {
        // Create a dummy file for the backend API
        const dummyAudioFile = new File([''], 'audio.mp3', { type: 'audio/mp3' })
        postFormData.append('files', dummyAudioFile)
        postFormData.append('uploadedAudioUrl', permanentAudioUrl)
        
        // Add audio classification if available
        if ((audioFile as any)?.classification) {
          const classification = (audioFile as any).classification
          postFormData.append('audioType', classification.type)
          postFormData.append('audioClassification', JSON.stringify(classification))
        }
      }

      if (permanentDocumentUrl) {
        // Create a dummy file for the backend API
        const dummyDocumentFile = new File([''], 'document.pdf', { type: 'application/pdf' })
        postFormData.append('files', dummyDocumentFile)
        postFormData.append('uploadedDocumentUrl', permanentDocumentUrl)
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
            videos: formattedPost.videos,
            audios: formattedPost.audios,
            documents: formattedPost.documents
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
      
      // 🚀 STEP 5: Listen for real-time spoke updates (WebSocket)
      // The backend will now handle spoke detection automatically
      // We just need to listen for the spoke_updated event
      if (typeof window !== 'undefined' && (window as any).socket) {
        const handleSpokeUpdate = (data: any) => {
          if (data.postId === newPost.id && data.spoke) {
            setPosts(prevPosts => 
              prevPosts.map(post => 
                post.id === newPost.id 
                  ? { ...post, spoke: data.spoke }
                  : post
              )
            )
            console.log(`🎯 REAL-TIME SPOKE UPDATE: ${newPost.id} -> ${data.spoke}`)
          }
        }

        // Listen for spoke updates
        ;(window as any).socket.on('post_spoke_updated', handleSpokeUpdate)
        
        // Cleanup listener after 30 seconds (spoke detection should complete by then)
        setTimeout(() => {
          if ((window as any).socket) {
            (window as any).socket.off('post_spoke_updated', handleSpokeUpdate)
          }
        }, 30000)
      }
      
      console.log(`✅ POST CREATION COMPLETED: ${newPost.id} (spoke detection handled by backend)`)
      
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