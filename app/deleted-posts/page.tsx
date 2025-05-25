'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import TopNav from '../components/TopNav'
import PostCard from '../components/PostCard'
import { usePostInteractions } from '@/hooks/usePostInteractions'
import { TrashIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'

interface DeletedPost {
  id: string
  content: string
  images?: string
  videos?: string
  createdAt: string
  deletedAt: string
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

export default function DeletedPosts() {
  const { user } = useAuth()
  const [deletedPosts, setDeletedPosts] = useState<DeletedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { likePost, commentOnPost, sharePost } = usePostInteractions()

  useEffect(() => {
    const fetchDeletedPosts = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch(`/api/users/${user.id}/deleted-posts`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch deleted posts')
        }
        
        const data = await response.json()
        setDeletedPosts(data.deletedPosts || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load deleted posts')
      } finally {
        setLoading(false)
      }
    }

    fetchDeletedPosts()
  }, [user])

  const handleRestore = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/restore`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (response.ok) {
        // Remove the post from deleted posts
        setDeletedPosts(prev => prev.filter(post => post.id !== postId))
      }
    } catch (error) {
      console.error('Error restoring post:', error)
    }
  }

  const handlePermanentDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}/permanent-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (response.ok) {
        // Remove the post from deleted posts
        setDeletedPosts(prev => prev.filter(post => post.id !== postId))
      }
    } catch (error) {
      console.error('Error permanently deleting post:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading deleted posts...</p>
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
            <TrashIcon className="w-8 h-8 text-red-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Deleted Posts</h1>
          </div>

          {deletedPosts.length === 0 ? (
            <div className="text-center py-12">
              <TrashIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No deleted posts</h3>
              <p className="text-gray-600 mb-6">
                Posts you delete will appear here for 30 days before being permanently removed.
              </p>
              <a
                href="/home"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {deletedPosts.map((deletedPost) => (
                <div key={deletedPost.id} className="relative">
                  {/* Deleted Post Header */}
                  <div className="bg-red-50 border border-red-200 rounded-t-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrashIcon className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-800 font-medium">
                        Deleted on {new Date(deletedPost.deletedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRestore(deletedPost.id)}
                        className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <ArrowUturnLeftIcon className="w-4 h-4 mr-1" />
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(deletedPost.id)}
                        className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 transition-colors flex items-center"
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        Delete Forever
                      </button>
                    </div>
                  </div>

                  {/* Post Card - Normal Display */}
                  <div className="border-l border-r border-b border-red-200 rounded-b-lg">
                    <PostCard
                      id={deletedPost.id}
                      author={deletedPost.author}
                      content={deletedPost.content}
                      images={deletedPost.images}
                      videos={deletedPost.videos}
                      likes={deletedPost.likes}
                      comments={deletedPost.comments}
                      shares={deletedPost.shares}
                      createdAt={deletedPost.createdAt}
                      spoke={deletedPost.spoke}
                      location={deletedPost.location}
                      feeling={deletedPost.feeling}
                      tags={deletedPost.tags}
                      onLike={() => Promise.resolve()}
                      onComment={() => Promise.resolve()}
                      onShare={() => Promise.resolve()}
                      currentUserId={user?.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 