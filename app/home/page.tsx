'use client'

import { useState, useEffect } from 'react'
import CreatePost from '../components/CreatePost'
import EmptyFeed from '../components/EmptyFeed'
import ErrorBoundary from '../components/ErrorBoundary'
import SkeletonFeed from '../components/SkeletonFeed'
import { usePosts } from '../../hooks/usePosts'
import { usePostInteractions } from '@/hooks/usePostInteractions'
import TopNav from '../components/TopNav'
import PostCard from '../components/PostCard'
import { useAuth } from '@/context/AuthContext'
import { Post, PostType, Spoke, Prompt, LiveEvent, TrendingItem, Recommendation } from '@/types/post'
import Link from 'next/link'
import { BookmarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { io, Socket } from 'socket.io-client'

// Configuration
const spokes: Spoke[] = [
  { id: 1, name: 'Spiritual', progress: 75, color: 'bg-purple-500' },
  { id: 2, name: 'Mental', progress: 60, color: 'bg-blue-500' },
  { id: 3, name: 'Physical', progress: 85, color: 'bg-green-500' },
  { id: 4, name: 'Personal', progress: 45, color: 'bg-pink-500' },
  { id: 5, name: 'Professional', progress: 70, color: 'bg-yellow-500' },
  { id: 6, name: 'Financial', progress: 55, color: 'bg-red-500' },
  { id: 7, name: 'Social', progress: 80, color: 'bg-indigo-500' },
  { id: 8, name: 'Mindfulness', progress: 65, color: 'bg-teal-500' },
  { id: 9, name: 'Leadership', progress: 50, color: 'bg-orange-500' },
]

const prompts: Prompt[] = [
  { id: 1, text: 'What are you grateful for today?', spoke: 'Spiritual' },
  { id: 2, text: 'Take 5 minutes to practice mindfulness', spoke: 'Mental' },
  { id: 3, text: 'Go for a 15-minute walk', spoke: 'Physical' },
]

const liveEvents: LiveEvent[] = [
  { id: 1, title: 'Morning Meditation', time: '8:00 AM', participants: 45 },
  { id: 2, title: 'Financial Planning Workshop', time: '2:00 PM', participants: 23 },
]

const trendingItems: TrendingItem[] = [
  { id: 1, title: 'Mindful Living Challenge', type: 'challenge', participants: 120 },
  { id: 2, title: 'Financial Freedom Group', type: 'group', members: 89 },
  { id: 3, title: 'Daily Wisdom Quotes', type: 'content', likes: 256 },
]

const recommendations: Recommendation[] = [
  { id: 1, title: 'The Power of Now', type: 'book', author: 'Eckhart Tolle' },
  { id: 2, title: 'Meditation for Beginners', type: 'course', duration: '30 mins' },
  { id: 3, title: 'Mindful Living Workshop', type: 'course', duration: '2 hours' },
]

export default function Home() {
  const { 
    posts: allPosts, 
    loading, 
    loadingMore, 
    error, 
    pagination, 
    createPost, 
    refreshPosts, 
    loadMorePosts, 
    optimisticLike, 
    optimisticSave, 
    uploadingMedia 
  } = usePosts()
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [activeSpoke, setActiveSpoke] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  const POSTS_PER_BATCH = 3 // Load 3 posts at a time

  // 🚀 REAL-TIME: Initialize WebSocket connection
  useEffect(() => {
    if (!user?.id) return

    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 10000,
    })

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket')
      setConnected(true)
      
      // Authenticate with the server
      newSocket.emit('authenticate', { 
        userId: user.id,
        token: localStorage.getItem('authToken') || 'dummy-token' 
      })
    })

    newSocket.on('connect_error', (error) => {
      console.warn('🔥 WebSocket connection error:', error)
      setConnected(false)
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts')
      setConnected(true)
    })

    newSocket.on('authenticated', () => {
      console.log('✅ WebSocket authenticated')
    })

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket')
      setConnected(false)
    })

    // 🚀 REAL-TIME: Listen for new posts from other users (Facebook-style)
    newSocket.on('new_post', (data) => {
      console.log('📬 New post received from others:', data)
      // Real-time posts will be handled by usePosts hook
    })

    // 🚀 REAL-TIME: Listen for broadcasts from other users
    newSocket.on('broadcast_new_post', (data) => {
      console.log('📡 Broadcast received from other user:', data)
      // Real-time posts will be handled by usePosts hook
    })

    // Store socket globally for PostCard to use
    ;(window as any).socket = newSocket
    setSocket(newSocket)

    return () => {
      newSocket.close()
      ;(window as any).socket = null
    }
  }, [user?.id])

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false)
  }

  // Filter posts by spoke
  const handleSpokeFilter = (spokeName: string) => {
    if (activeSpoke === spokeName) {
      setActiveSpoke(null) // Clear filter
    } else {
      setActiveSpoke(spokeName) // Apply filter
    }
    // Refresh posts with filter
    refreshPosts(1, 10, true)
  }

  const loadNextBatch = () => {
    if (loadingMore || !pagination.hasMore) return
    loadMorePosts()
  }

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 // Load when 1000px from bottom
      ) {
        loadNextBatch()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [allPosts, loadingMore, pagination.hasMore])

  const { likePost, commentOnPost, sharePost } = usePostInteractions()

  // 🚀 FACEBOOK-STYLE LIKE: Instant UI + Background API
  const handleLike = async (postId: string) => {
    try {
      // STEP 1: Instant UI update (optimistic)
      if (optimisticLike) {
        optimisticLike(postId, user?.id || 'temp-user-id')
      }
      
      // STEP 2: Background API call
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'temp-user-id' })
      })
      
      if (!response.ok) {
        // Rollback optimistic update on failure
        if (optimisticLike) {
          optimisticLike(postId, user?.id || 'temp-user-id') // Revert
        }
        throw new Error('Failed to like post')
      }
      
      const data = await response.json()
      console.log('✅ Like confirmed by server:', data)
      return data
    } catch (error) {
      console.error('❌ Like failed:', error)
      throw error
    }
  }

  // Simplified comment handler
  const handleComment = async (postId: string, content: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          userId: user?.id || 'temp-user-id',
          userEmail: user?.email,
          userFirstName: (user as any)?.firstName || 'User',
          userLastName: (user as any)?.lastName || '',
          userProfileImage: (user as any)?.profileImageUrl
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to comment on post')
      }
      
      const data = await response.json()
      console.log('Comment response:', data)
      return data
    } catch (error) {
      console.error('Error commenting on post:', error)
      throw error
    }
  }

  // Edit post handler
  const handleEditPost = async (postId: string, updatedPost: any) => {
    try {
      const response = await fetch(`/api/posts/${postId}/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedPost,
          userId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to edit post')
      }

      const data = await response.json()
      
      // Update local state immediately for better UX
      const updatedPostData: Post = {
        id: data.post.id,
        type: 'user-post' as PostType,
        author: {
          id: data.post.author.id,
          name: data.post.author.name,
          avatar: data.post.author.profileImageUrl || '/images/avatars/default.svg'
        },
        content: data.post.content,
        images: data.post.images,
        videos: data.post.videos,
        likes: data.post.likeCount || 0,
        comments: data.post.commentCount || 0,
        commentsList: data.post.comments || [],
        shares: 0,
        timestamp: data.post.createdAt,
        updatedAt: data.post.updatedAt,
        isEdited: data.post.isEdited,
        spoke: data.post.spoke,
        location: data.post.location,
        feeling: data.post.feeling,
        tags: data.post.tags || [],
        isLikedByCurrentUser: data.post.likes?.some((like: any) => like.userId === user?.id) || false
      }

      // Post updates will be handled by usePosts hook
      
      return data
    } catch (error) {
      console.error('Error editing post:', error)
      throw error
    }
  }

  // Delete post handler
  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      // Post deletion will be handled by usePosts hook
      
      // Do not refresh posts from server - just keep local state
      
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  // 🚀 FACEBOOK-STYLE SAVE: Instant UI + Background API
  const handleSavePost = async (postId: string) => {
    try {
      // STEP 1: Instant UI feedback (optimistic)
      if (optimisticSave) {
        optimisticSave(postId)
      }
      
      // STEP 2: Background API call
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save post')
      }

      const data = await response.json()
      console.log('✅ Save confirmed by server:', data)
      
      return data
    } catch (error) {
      console.error('❌ Save failed:', error)
      throw error
    }
  }

  const renderPostCard = (post: Post) => {
    return (
      <ErrorBoundary key={post.id}>
        <PostCard 
          id={post.id}
          author={post.author}
          content={post.content}
          images={post.images}
          videos={post.videos}
          likes={[]}
          comments={post.commentsList}
          shares={post.shares || 0}
          createdAt={post.timestamp || new Date()}
          updatedAt={post.updatedAt}
          isEdited={post.isEdited || false}
          spoke={post.spoke}
          location={post.location}
          feeling={post.feeling}
          type={post.type}
          isLikedByCurrentUser={post.isLikedByCurrentUser}
          onLike={handleLike}
          onComment={handleComment}
          onShare={sharePost}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onSave={handleSavePost}
          currentUserId={user?.id}
        />
      </ErrorBoundary>
    )
  }

  const handlePostSubmit = async (formData: FormData) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to create a post')
      }

      const content = formData.get('content')?.toString()
      if (!content) {
        throw new Error('Post content is required')
      }

      console.log('🚀 Starting Facebook-style post creation...')

      // 🚀 FACEBOOK-STYLE: usePosts hook handles:
      // 1. ⚡ Optimistic UI (instant post appearance)
      // 2. 📡 Backend creation
      // 3. 🎯 Real-time broadcast to other users
      // 4. 🔍 Background spoke detection
      const success = await createPost(formData)
      
      if (!success) {
        throw new Error('Failed to create post')
      }
      
      console.log('🎊 Facebook-style post creation completed!')
      
      // Post creation handled by usePosts hook
        
    } catch (error: any) {
      console.error('❌ Post creation error:', error)
      // Show user-friendly error message
      alert(error.message || 'Failed to create post. Please try again.')
      throw error
    }
  }

  if (loading && allPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <main className="flex-1 lg:ml-64 container mx-auto px-4 py-8">
          <CreatePost onSubmit={handlePostSubmit} />
          <SkeletonFeed count={5} />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <main className="flex-1 lg:ml-64 container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <h3 className="text-red-800 font-medium mb-2">Failed to load posts</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => refreshPosts(1, 10, true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      {showOnboarding ? (
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome {user?.email || 'there'}!</h2>
          <p className="text-gray-600 mb-4">Let's get you started with your journey.</p>
          <button
            onClick={handleCompleteOnboarding}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="flex">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-64 fixed left-0 top-16 h-full bg-white border-r border-gray-200 p-4">
            <div className="space-y-4">
              {/* Seven Spokes Section - Now on Top */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Nine Spokes</h3>
                  {/* Clear Filter Button - Now next to header */}
                  {activeSpoke && (
                    <button
                      onClick={() => handleSpokeFilter('')}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {spokes.map((spoke) => (
                    <div 
                      key={spoke.id} 
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        activeSpoke === spoke.name 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSpokeFilter(spoke.name)}
                    >
                      <span className={`text-sm ${
                        activeSpoke === spoke.name ? 'text-blue-800 font-medium' : 'text-gray-600'
                      }`}>
                        {spoke.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${spoke.color}`}
                            style={{ width: `${spoke.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{spoke.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Access Section - Now at Bottom */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Quick Access</h4>
                <div className="space-y-2">
                  <Link
                    href="/saved-posts"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <BookmarkIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Saved Posts</span>
                  </Link>
                  
                  <Link
                    href="/deleted-posts"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                    <span className="text-gray-700">Deleted Posts</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 lg:ml-64 container mx-auto px-4 py-8">
            {/* Status Indicators */}
            <div className="mb-4 flex items-center justify-center space-x-4">
              {/* Upload Progress Indicator */}
              {uploadingMedia && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-700 text-sm font-medium">Uploading media...</span>
                </div>
              )}
              
              {/* WebSocket Status Indicator */}
              {connected && !uploadingMedia && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 text-sm font-medium">Real-time updates active</span>
                </div>
              )}
            </div>
            
            <CreatePost onSubmit={handlePostSubmit} />
            
            {/* Filter Indicator */}
            {activeSpoke && (
              <div className="mt-6 mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-800 font-medium">Filtering by:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    🎯 {activeSpoke}
                  </span>
                </div>
                <button
                  onClick={() => handleSpokeFilter('')}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Clear Filter
                </button>
              </div>
            )}
            
            {loading ? (
              <SkeletonFeed count={5} />
            ) : allPosts.length === 0 ? (
              <EmptyFeed />
            ) : (
              <ErrorBoundary>
                <div className="space-y-6 mt-6">
                  {allPosts.map(renderPostCard)}
                  
                  {/* Load More Button / Loading indicator */}
                  {pagination.hasMore ? (
                    <div className="flex justify-center py-8">
                      {loadingMore ? (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span>Loading more posts...</span>
                        </div>
                      ) : (
                        <button
                          onClick={loadMorePosts}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          Load More Posts
                        </button>
                      )}
                    </div>
                  ) : (
                    /* End of posts indicator */
                    allPosts.length > 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>You've reached the end! 🎉</p>
                        <p className="text-sm mt-1">Check back later for more posts</p>
                      </div>
                    )
                  )}
                </div>
              </ErrorBoundary>
            )}
          </main>
        </div>
      )}
    </div>
  )
} 