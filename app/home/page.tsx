'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import PostCard from '../components/PostCard'
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
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Get spoke filter from URL parameters
  const spokeFilter = searchParams?.get('spoke')

  // Mount detection
  useEffect(() => {
    setMounted(true)
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
      const response = await fetch(`/api/posts?page=1&limit=10&userId=${user.id}${spokeParam}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      if (data.posts && Array.isArray(data.posts)) {
        // Fix author name mapping: API returns firstName/lastName, PostCard expects name
        const postsWithFixedNames = data.posts.map((post: any) => ({
          ...post,
          author: {
            ...post.author,
            name: post.author.firstName && post.author.lastName 
              ? `${post.author.firstName} ${post.author.lastName}`.trim()
              : post.author.firstName || post.author.lastName || 'Anonymous User'
          },
          // Ensure comments and likes are always arrays
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

  // Optimized handlers
  const handleLike = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      })
      const result = await response.json()
      
      // Update local state immediately for better UX
      if (result.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLikedByCurrentUser: result.liked,
                likes: Array(result.likeCount || 0).fill({}) // Simple array for count
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
      
      // Update local state to show new comment count
      if (result.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                comments: [...(post.comments || []), result.comment] // Add new comment
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
        
        // Update local state with edited post
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
        // Optimistically remove post from UI
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
        // Update local state to show saved status
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isSaved: result.saved // Toggle saved status
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
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
                
                // Apply the same name mapping for new posts
                const postWithFixedName = {
                  ...newPost,
                  author: {
                    ...newPost.author,
                    name: newPost.author?.firstName && newPost.author?.lastName 
                      ? `${newPost.author.firstName} ${newPost.author.lastName}`.trim()
                      : newPost.author?.firstName || newPost.author?.lastName || 'Anonymous User'
                  },
                  // Ensure comments and likes are always arrays
                  comments: newPost.comments || [],
                  likes: newPost.likes || []
                }
                setPosts(prev => [postWithFixedName, ...prev])
              } else {
                // Handle API errors
                const errorData = await response.json()
                console.error('❌ API Error:', errorData)
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
              }
            } catch (error) {
              console.error('❌ Failed to create post:', error)
              // Re-throw the error so CreatePost component can handle it
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 