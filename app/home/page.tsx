'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import PostCard from '../components/PostCard'
import FullScreenPost from '../components/FullScreenPost'
import NavigationDots from '../components/NavigationDots'
import ViewModeToggle from '../components/ViewModeToggle'
import CreatePost from '../components/CreatePost'
import { useRouter, useSearchParams } from 'next/navigation'

interface Author {
  id: string
  name: string
  username?: string
  avatar?: string
  profileImageUrl?: string
}

interface Post {
  id: string
  content: string
  title?: string
  images?: string
  videos?: string
  audios?: string
  documents?: string
  likes: any[]
  comments: any[]
  shares: number
  createdAt: string
  updatedAt?: string
  isEdited?: boolean
  spoke?: string
  location?: string
  feeling?: string
  tags?: string[]
  type?: string
  isLikedByCurrentUser?: boolean
  isSaved?: boolean
  author: Author
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'traditional' | 'fullscreen'>('traditional')
  const [currentPostIndex, setCurrentPostIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  
  // Get spoke filter from URL parameters
  const spokeFilter = searchParams?.get('spoke')

  // Mount detection and view mode initialization
  useEffect(() => {
    setMounted(true)
    
    // Initialize view mode from localStorage
    const savedViewMode = localStorage.getItem('viewMode') as 'traditional' | 'fullscreen' | null
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('⚠️ No user found, redirecting to login')
      router.push('/login')
    }
  }, [authLoading, user, router])

  // Fetch posts function - reusable
  const fetchPosts = useCallback(async () => {
    if (!user) return

    try {
      console.log('📡 Fetching posts...')
      setLoading(true)
      const spokeParam = spokeFilter ? `&spoke=${spokeFilter}` : ''
      const response = await fetch(`/api/posts?page=1&limit=20&userId=${user.id}${spokeParam}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      if (data.posts && Array.isArray(data.posts)) {
        const postsWithFixedNames = data.posts.map((post: any) => ({
          ...post,
          author: {
            ...post.author,
            name: post.author.firstName && post.author.lastName 
              ? `${post.author.firstName} ${post.author.lastName}`.trim()
              : post.author.firstName || post.author.lastName || 'Anonymous User'
          },
          comments: post.comments || [],
          likes: post.likes || []
        }))
        setPosts(postsWithFixedNames)
        console.log(`✅ Loaded ${postsWithFixedNames.length} posts`)
      } else if (data.error) {
        throw new Error(data.message || data.error)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('❌ Error fetching posts:', error)
      setError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user, spokeFilter])

  // Fetch posts - when mounted, user changes, or spoke filter changes
  useEffect(() => {
    if (!mounted || !user) return
    fetchPosts()
  }, [mounted, user, spokeFilter, fetchPosts])

  // Full-screen scroll detection
  useEffect(() => {
    if (viewMode !== 'fullscreen' || !containerRef.current) return

    let scrollTimeout: NodeJS.Timeout
    
    const handleScroll = () => {
      if (isScrolling) return
      
      setIsScrolling(true)
      clearTimeout(scrollTimeout)
      
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
        
        // Calculate current post based on scroll position
        const container = containerRef.current
        if (!container) return
        
        const scrollTop = container.scrollTop
        const windowHeight = window.innerHeight
        const newIndex = Math.round(scrollTop / windowHeight)
        
        if (newIndex !== currentPostIndex && newIndex >= 0 && newIndex < posts.length) {
          setCurrentPostIndex(newIndex)
        }
      }, 100)
    }

    const container = containerRef.current
    container.addEventListener('scroll', handleScroll)
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [viewMode, currentPostIndex, posts.length, isScrolling])

  // Keyboard navigation for full-screen mode
  useEffect(() => {
    if (viewMode !== 'fullscreen') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateToPost(Math.max(0, currentPostIndex - 1))
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        navigateToPost(Math.min(posts.length - 1, currentPostIndex + 1))
      } else if (e.key === 'Escape') {
        setViewMode('traditional')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, currentPostIndex, posts.length])

  // Touch/gesture handling for mobile
  useEffect(() => {
    if (viewMode !== 'fullscreen' || !containerRef.current) return

    let startY = 0
    let startTime = 0

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
      startTime = Date.now()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY
      const endTime = Date.now()
      const deltaY = startY - endY
      const deltaTime = endTime - startTime

      // Quick swipe detection
      if (Math.abs(deltaY) > 50 && deltaTime < 300) {
        e.preventDefault()
        if (deltaY > 0) {
          // Swipe up - next post
          navigateToPost(Math.min(posts.length - 1, currentPostIndex + 1))
        } else {
          // Swipe down - previous post
          navigateToPost(Math.max(0, currentPostIndex - 1))
        }
      }
    }

    const container = containerRef.current
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [viewMode, currentPostIndex, posts.length])

  // Navigation function
  const navigateToPost = useCallback((index: number) => {
    if (!containerRef.current || index < 0 || index >= posts.length) return
    
    const container = containerRef.current
    const targetScrollTop = index * window.innerHeight
    
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })
    
    setCurrentPostIndex(index)
  }, [posts.length])

  // Handle view mode change
  const handleViewModeChange = (mode: 'traditional' | 'fullscreen') => {
    setViewMode(mode)
    
    // Store view mode in localStorage for layout to detect
    localStorage.setItem('viewMode', mode)
    
    // Dispatch custom event to notify layout
    window.dispatchEvent(new CustomEvent('viewModeChange', { detail: mode }))
    
    if (mode === 'fullscreen' && posts.length > 0) {
      // Scroll to current post when switching to fullscreen
      setTimeout(() => {
        if (containerRef.current) {
          const targetPosition = currentPostIndex * window.innerHeight
          containerRef.current.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }

  // Optimized handlers
  const handleLike = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      })
      const result = await response.json()
      
      if (result.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLikedByCurrentUser: result.liked,
                likes: Array(result.likeCount || 0).fill({})
              }
            : post
        ))
      }
      
      return result
    } catch (error) {
      console.error('Like failed:', error)
      throw error
    }
  }, [user?.id])

  const handleComment = useCallback(async (postId: string, comment: string, isAnonymous?: boolean) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: comment,
          userId: user?.id,
          isAnonymous: isAnonymous || false
        }),
      })
      const result = await response.json()
      
      if (result.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments: [...(post.comments || []), result.comment]
              }
            : post
        ))
      }
      
      return result
    } catch (error) {
      console.error('Comment failed:', error)
      throw error
    }
  }, [user?.id])

  const handleShare = useCallback(async (postId: string) => {
    console.log('Share post:', postId)
  }, [])

  const handleEdit = useCallback(async (postId: string, updatedPost: any) => {
    try {
      const response = await fetch(`/api/posts/${postId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...updatedPost,
          userId: user?.id 
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post,
                ...result.post,
                isEdited: true,
                updatedAt: new Date().toISOString(),
                author: {
                  ...post.author,
                  name: result.post.author?.firstName && result.post.author?.lastName 
                    ? `${result.post.author.firstName} ${result.post.author.lastName}`.trim()
                    : post.author.name
                }
              }
            : post
        ))
        
        console.log(`✅ Post ${postId} edited successfully`)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to edit post')
      }
    } catch (error) {
      console.error('❌ Edit failed:', error)
      alert('Failed to edit post. Please try again.')
    }
  }, [user?.id])

  const handleDelete = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      })
      
      if (response.ok) {
        setPosts(prev => prev.filter(post => post.id !== postId))
        console.log(`✅ Post ${postId} deleted successfully`)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete post')
      }
    } catch (error) {
      console.error('❌ Delete failed:', error)
      alert('Failed to delete post. Please try again.')
    }
  }, [user?.id])

  const handleSave = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      })
      const result = await response.json()
      
      if (result.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isSaved: result.saved
              }
            : post
        ))
        console.log(`✅ Post ${postId} ${result.saved ? 'saved' : 'unsaved'} successfully`)
      } else {
        throw new Error(result.message || 'Failed to save post')
      }
      
      return result
    } catch (error) {
      console.error('❌ Save failed:', error)
      alert('Failed to save post. Please try again.')
      throw error
    }
  }, [user?.id])

  // Handler for opening document posts in fullscreen mode
  const handleOpenDocumentFullScreen = useCallback((post: Post) => {
    // Switch to fullscreen mode and navigate to the document post
    setViewMode('fullscreen')
    const postIndex = posts.findIndex(p => p.id === post.id)
    if (postIndex >= 0) {
      setCurrentPostIndex(postIndex)
      setTimeout(() => {
        containerRef.current?.scrollTo({ top: postIndex * window.innerHeight, behavior: 'smooth' })
      }, 100)
    }
  }, [posts])

  // Don't render until mounted and user is available
  if (!mounted || authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Full-screen mode
  if (viewMode === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-[100] bg-black">
        {/* View Mode Toggle with increased z-index */}
        <ViewModeToggle 
          viewMode={viewMode} 
          onViewModeChange={handleViewModeChange} 
        />

        {/* Navigation Dots */}
        {posts.length > 0 && (
          <NavigationDots 
            totalPosts={posts.length}
            currentIndex={currentPostIndex}
            onNavigate={navigateToPost}
          />
        )}

        {/* Full-screen Feed Container */}
        <div 
          ref={containerRef}
          className="feed-container h-screen w-screen overflow-y-scroll"
          style={{ 
            scrollSnapType: 'y mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {loading ? (
            <div className="h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              <div className="text-white text-xl">Loading posts...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">No posts yet</h2>
                <p className="text-gray-300">Switch to traditional view to create your first post!</p>
              </div>
            </div>
          ) : (
            posts.map((post, index) => (
              <FullScreenPost
                key={post.id}
                {...post}
                index={index}
                isActive={index === currentPostIndex}
                isAnonymous={(post as any).isAnonymous || false}
                currentUserId={user.id}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onSave={handleSave}
              />
            ))
          )}
        </div>
      </div>
    )
  }

  // Traditional mode (existing implementation)
  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      {/* View Mode Toggle for Traditional View with increased z-index */}
      <div className="fixed top-6 left-6 z-[60]">
        <ViewModeToggle 
          viewMode={viewMode} 
          onViewModeChange={handleViewModeChange} 
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-16">
        {/* Spoke Filter Header */}
        {spokeFilter && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800">
              {spokeFilter} Posts
            </h2>
            <p className="text-sm text-blue-600">
              Showing posts tagged with "{spokeFilter}" spoke
            </p>
          </div>
        )}
        
        {/* Create Post */}
        <div className="mb-6">
          <CreatePost onSubmit={async (formData) => {
            try {
              console.log('🚀 Home page: Submitting post to API...')
              const response = await fetch('/api/posts', {
                method: 'POST',
                body: formData,
              })
              
              console.log('📡 API Response status:', response.status)
              
              if (response.ok) {
                const newPost = await response.json()
                console.log('✅ Post created successfully:', newPost.id)
                
                const postWithFixedName = {
                  ...newPost,
                  author: {
                    ...newPost.author,
                    name: newPost.author?.firstName && newPost.author?.lastName 
                      ? `${newPost.author.firstName} ${newPost.author.lastName}`.trim()
                      : newPost.author?.firstName || newPost.author?.lastName || 'Anonymous User'
                  },
                  comments: newPost.comments || [],
                  likes: newPost.likes || []
                }
                setPosts(prev => [postWithFixedName, ...prev])
              } else {
                const errorData = await response.json()
                console.error('❌ API Error:', errorData)
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
              }
            } catch (error) {
              console.error('❌ Failed to create post:', error)
              throw error
            }
          }} />
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No posts yet. Create your first post!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                {...post}
                isAnonymous={(post as any).isAnonymous || false}
                currentUserId={user.id}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSave={handleSave}
                onRefresh={fetchPosts}
                onFullScreen={() => handleOpenDocumentFullScreen(post)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 