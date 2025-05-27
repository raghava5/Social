'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import PostCard from '@/app/components/PostCard'
import { 
  ArrowLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  SpeakerWaveIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import ErrorBoundary from '@/app/components/ErrorBoundary'

interface Post {
  id: string
  content: string
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
  author: {
    id: string
    name: string
    firstName?: string
    lastName?: string
    username?: string
    avatar?: string
    profileImageUrl?: string
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTranscription, setShowTranscription] = useState(false)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const postId = params?.postId as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (postId && user) {
      fetchPost()
    }
  }, [postId, user, authLoading])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts/${postId}`)
      if (!response.ok) {
        throw new Error(`Post not found (${response.status})`)
      }
      
      const data = await response.json()
      
      // Fix author name mapping
      const postWithFixedName = {
        ...data,
        author: {
          ...data.author,
          name: data.author.firstName && data.author.lastName 
            ? `${data.author.firstName} ${data.author.lastName}`.trim()
            : data.author.firstName || data.author.lastName || 'Anonymous User'
        },
        comments: data.comments || [],
        likes: data.likes || []
      }
      
      setPost(postWithFixedName)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handlePostAction = async (action: string, ...args: any[]) => {
    if (!post) return

    try {
      switch (action) {
        case 'like':
          const likeResponse = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id }),
          })
          const likeResult = await likeResponse.json()
          if (likeResult.success) {
            setPost(prev => prev ? {
              ...prev,
              isLikedByCurrentUser: likeResult.liked,
              likes: Array(likeResult.likeCount || 0).fill({})
            } : null)
          }
          break

        case 'comment':
          const [comment] = args
          const commentResponse = await fetch(`/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: comment, userId: user?.id }),
          })
          if (commentResponse.ok) {
            fetchPost() // Refresh to get new comment
          }
          break

        case 'save':
          const saveResponse = await fetch(`/api/posts/${postId}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id }),
          })
          break

        case 'delete':
          if (window.confirm('Are you sure you want to delete this post?')) {
            const deleteResponse = await fetch(`/api/posts/${postId}/delete`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user?.id }),
            })
            if (deleteResponse.ok) {
              router.push('/home')
            }
          }
          break
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error)
    }
  }

  const generateTranscription = async () => {
    if (!post?.audios) return
    
    setTranscription('🔄 Generating transcription...')
    
    try {
      // Placeholder for transcription API
      setTimeout(() => {
        setTranscription(`This is a sample transcription of the audio content. 
        
In a real implementation, this would be generated using:
- OpenAI Whisper API
- Google Speech-to-Text
- Azure Cognitive Services
- Or other transcription services

The transcription would include:
- Speaker identification
- Timestamps
- Punctuation and formatting
- Multiple language support`)
      }, 2000)
    } catch (error) {
      setTranscription('❌ Failed to generate transcription')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The post you are looking for does not exist.'}</p>
          <button 
            onClick={() => router.push('/home')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          {sidebarOpen && (
            <div className="w-80 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Post Details</h2>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Post Meta Info */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Post Information</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>📅 Created: {new Date(post.createdAt).toLocaleDateString()}</div>
                      {post.isEdited && post.updatedAt && (
                        <div>✏️ Edited: {new Date(post.updatedAt).toLocaleDateString()}</div>
                      )}
                      <div>👍 Likes: {post.likes.length}</div>
                      <div>💬 Comments: {post.comments.length}</div>
                      <div>🔄 Shares: {post.shares}</div>
                      {post.location && <div>📍 Location: {post.location}</div>}
                      {post.feeling && <div>😊 Feeling: {post.feeling}</div>}
                    </div>
                  </div>

                  {/* Spoke Information */}
                  {post.spoke && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h3 className="font-medium text-green-900 mb-2">🎯 Spoke Analysis</h3>
                      <p className="text-sm text-green-800">{post.spoke}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="font-medium text-blue-900 mb-2">🏷️ Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Transcription Section */}
                {post.audios && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-purple-900 flex items-center">
                        <SpeakerWaveIcon className="h-4 w-4 mr-2" />
                        Audio Transcription
                      </h3>
                      <button
                        onClick={() => {
                          if (!transcription) generateTranscription()
                          setShowTranscription(!showTranscription)
                        }}
                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200"
                      >
                        {showTranscription ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    
                    {showTranscription && (
                      <div className="bg-white rounded p-3 text-sm text-gray-700 max-h-48 overflow-y-auto">
                        {transcription || (
                          <button 
                            onClick={generateTranscription}
                            className="text-purple-600 hover:underline"
                          >
                            Click to generate transcription
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share Post
                  </button>
                  <button className="w-full flex items-center justify-center py-2 px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                    <BookmarkIcon className="h-4 w-4 mr-2" />
                    Save Post
                  </button>
                  <button className="w-full flex items-center justify-center py-2 px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`flex-1 ${sidebarOpen ? 'ml-80' : ''}`}>
            <div className="max-w-2xl mx-auto px-4 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => router.back()}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back
                </button>
                
                {!sidebarOpen && (
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Show Details
                  </button>
                )}
              </div>

              {/* Post Content */}
              <PostCard
                {...post}
                currentUserId={user?.id}
                onLike={() => handlePostAction('like')}
                onComment={(postId, comment) => handlePostAction('comment', comment)}
                onShare={() => handlePostAction('share')}
                onEdit={(postId, updatedPost) => handlePostAction('edit', updatedPost)}
                onDelete={() => handlePostAction('delete')}
                onSave={() => handlePostAction('save')}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
} 