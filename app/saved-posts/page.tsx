'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import TopNav from '../components/TopNav'
import PostCard from '../components/PostCard'
import { usePostInteractions } from '@/hooks/usePostInteractions'
import { BookmarkIcon } from '@heroicons/react/24/outline'

interface SavedPost {
  id: string
  postId: string
  userId: string
  createdAt: string
  post: {
    id: string
    content: string
    images?: string
    videos?: string
    createdAt: string
    updatedAt?: string
    isEdited?: boolean
    author: {
      id: string
      name: string
      profileImageUrl?: string
    }
    likes: any[]
    comments: any[]
    shares: number
    spoke?: string
    location?: string
    feeling?: string
    tags?: string[]
  }
}

export default function SavedPosts() {
  const { user } = useAuth()
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { likePost, commentOnPost, sharePost } = usePostInteractions()

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch(`/api/users/${user.id}/saved-posts`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch saved posts')
        }
        
        const data = await response.json()
        setSavedPosts(data.savedPosts || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load saved posts')
      } finally {
        setLoading(false)
      }
    }

    fetchSavedPosts()
  }, [user])

  const handleLike = async (postId: string) => {
    try {
      const response = await likePost(postId)
      return response
    } catch (error) {
      console.error('Error liking post:', error)
      throw error
    }
  }

  const handleComment = async (postId: string, content: string) => {
    try {
      const response = await commentOnPost(postId, content)
      return response
    } catch (error) {
      console.error('Error commenting on post:', error)
      throw error
    }
  }

  const handleUnsave = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (response.ok) {
        // Remove the post from saved posts
        setSavedPosts(prev => prev.filter(saved => saved.postId !== postId))
      }
    } catch (error) {
      console.error('Error unsaving post:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading saved posts...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-8">
            <BookmarkIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Saved Posts</h1>
          </div>

          {savedPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No saved posts yet</h3>
              <p className="text-gray-600 mb-6">
                Posts you save will appear here. Start exploring and save posts you want to read later!
              </p>
              <a
                href="/home"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Posts
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {savedPosts.map((savedPost) => (
                <PostCard
                  key={savedPost.post.id}
                  id={savedPost.post.id}
                  author={savedPost.post.author}
                  content={savedPost.post.content}
                  images={savedPost.post.images}
                  videos={savedPost.post.videos}
                  likes={savedPost.post.likes}
                  comments={savedPost.post.comments}
                  shares={savedPost.post.shares}
                  createdAt={savedPost.post.createdAt}
                  updatedAt={savedPost.post.updatedAt}
                  isEdited={savedPost.post.isEdited}
                  spoke={savedPost.post.spoke}
                  location={savedPost.post.location}
                  feeling={savedPost.post.feeling}
                  tags={savedPost.post.tags}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={sharePost}
                  onSave={handleUnsave}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 