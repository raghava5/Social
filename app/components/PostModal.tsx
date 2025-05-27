'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  XMarkIcon,
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon as ChatOutline,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  MicrophoneIcon,
  DocumentIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartFilled } from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'
import ShareModal from './ShareModal'
import PostOptionsMenu from './PostOptionsMenu'
import EditPostModal from './EditPostModal'

interface Author {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  username?: string
  avatar?: string
  profileImageUrl?: string
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

interface PostModalProps {
  postId: string
  isOpen: boolean
  onClose: () => void
  currentUserId?: string
}

interface Post {
  id: string
  content: string
  images?: string
  videos?: string
  audios?: string
  documents?: string
  likes: any[]
  comments: Comment[]
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
  author: Author
}

export default function PostModal({ postId, isOpen, onClose, currentUserId }: PostModalProps) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  // Post interaction states
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [showComments, setShowComments] = useState(true) // Show by default in modal
  const [commentText, setCommentText] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && postId) {
      fetchPost()
    }
  }, [isOpen, postId])

  useEffect(() => {
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/posts/${postId}`)
      if (!response.ok) {
        throw new Error('Post not found')
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
      setLiked(postWithFixedName.isLikedByCurrentUser || false)
      setLikeCount(postWithFixedName.likes.length)
      setCommentCount(postWithFixedName.comments.length)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = useCallback(async () => {
    if (!post) return
    
    const newLiked = !liked
    const newCount = newLiked ? likeCount + 1 : likeCount - 1
    
    setLiked(newLiked)
    setLikeCount(newCount)
    
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      })
      const result = await response.json()
      
      if (result.success) {
        setLiked(result.liked)
        setLikeCount(result.likeCount)
      }
    } catch (error) {
      // Revert on error
      setLiked(!newLiked)
      setLikeCount(likeCount)
      console.error('Like failed:', error)
    }
  }, [post, liked, likeCount, postId, currentUserId])

  const handleComment = useCallback(async () => {
    if (!commentText.trim() || !post) return
    
    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: commentText,
          userId: currentUserId 
        }),
      })
      
      if (response.ok) {
        setCommentText('')
        fetchPost() // Refresh to get new comment
      }
    } catch (error) {
      console.error('Comment failed:', error)
    }
  }, [commentText, post, postId, currentUserId])

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error || 'Post not found'}</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const avatarUrl = post.author.avatar || post.author.profileImageUrl || '/images/avatars/default.svg'

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      {/* Modal content */}
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Post Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start space-x-3">
            <img 
              src={avatarUrl} 
              alt={post.author.name || 'User'}
              className="w-12 h-12 rounded-full object-cover"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {post.author.name || 'Anonymous User'}
                </h3>
                {post.feeling && (
                  <span className="text-sm text-gray-500">is feeling {post.feeling}</span>
                )}
              </div>
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span suppressHydrationWarning>
                  {mounted && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
                {post.isEdited && post.updatedAt && (
                  <>
                    <span>•</span>
                    <span suppressHydrationWarning>
                      Edited {mounted && formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
                    </span>
                  </>
                )}
                {post.location && (
                  <>
                    <span>•</span>
                    <span>📍 {post.location}</span>
                  </>
                )}
              </div>
            </div>
            
            <PostOptionsMenu
              postId={post.id}
              authorId={post.author.id}
              currentUserId={currentUserId}
              onEdit={() => setShowEditModal(true)}
              onDelete={async () => {
                if (window.confirm('Are you sure you want to delete this post?')) {
                  try {
                    const response = await fetch(`/api/posts/${postId}/delete`, {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: currentUserId }),
                    })
                    if (response.ok) {
                      onClose()
                      router.push('/home')
                    }
                  } catch (error) {
                    console.error('Delete failed:', error)
                  }
                }
              }}
              onSave={async () => {
                try {
                  const response = await fetch(`/api/posts/${postId}/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUserId }),
                  })
                  if (response.ok) {
                    setSaved(!saved)
                  }
                } catch (error) {
                  console.error('Save failed:', error)
                }
              }}
              onHide={() => console.log('Hide post:', post.id)}
              onReport={() => console.log('Report post:', post.id)}
              onUnfollow={() => console.log('Unfollow user:', post.author.id)}
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Post Content */}
          <div className="p-6">
            <p className="text-gray-800 whitespace-pre-wrap text-lg leading-relaxed mb-4">
              {post.content}
            </p>
            
            {/* Spoke Tag */}
            {post.spoke && (
              <div className="mb-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border border-green-200">
                  <span className="mr-2">🎯</span>
                  <span className="font-semibold">Spoke:</span>
                  <span className="ml-1">{post.spoke}</span>
                </div>
              </div>
            )}
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span key={index} className="text-blue-600 text-sm hover:underline cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Media Display */}
            {(post.images || post.videos || post.audios || post.documents) && (
              <div className="mb-6 space-y-4">
                {/* Images */}
                {post.images && post.images.split(',').filter(img => img.trim()).map((img, index) => (
                  <img 
                    key={`img-${index}`}
                    src={img.trim()} 
                    alt="Post image"
                    className="w-full object-cover rounded-lg max-h-96"
                    loading="lazy"
                  />
                ))}
                
                {/* Videos */}
                {post.videos && post.videos.split(',').filter(vid => vid.trim()).map((video, index) => (
                  <video 
                    key={`vid-${index}`}
                    src={video.trim()} 
                    className="w-full object-cover rounded-lg max-h-96"
                    controls
                    preload="metadata"
                  />
                ))}

                {/* Audio Files - Enhanced */}
                {post.audios && post.audios.split(',').filter(audio => audio.trim()).map((audio, index) => {
                  const fileName = audio.split('/').pop() || `Audio ${index + 1}`
                  const isMusic = fileName.toLowerCase().includes('music') || fileName.toLowerCase().includes('song') || post.type === 'music'
                  
                  return (
                    <div key={`audio-${index}`} className={`rounded-lg p-4 border-2 ${
                      isMusic 
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                              isMusic ? 'bg-purple-100' : 'bg-blue-100'
                            }`}>
                              {isMusic ? (
                                <span className="text-2xl">🎵</span>
                              ) : (
                                <MicrophoneIcon className={`h-6 w-6 ${isMusic ? 'text-purple-600' : 'text-blue-600'}`} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{fileName}</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                isMusic ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {isMusic ? '🎵 Music' : '🗣️ Speech'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <audio src={audio.trim()} controls className="w-full" />
                      </div>
                    </div>
                  )
                })}

                {/* Documents */}
                {post.documents && post.documents.split(',').filter(doc => doc.trim()).map((document, index) => {
                  const fileName = document.split('/').pop() || `Document ${index + 1}`
                  return (
                    <div key={`doc-${index}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <DocumentIcon className="h-8 w-8 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{fileName}</span>
                        </div>
                        <a
                          href={document.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                          Open
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex justify-between">
              <button 
                onClick={handleLike}
                className={`flex-1 flex items-center justify-center py-3 rounded-lg transition-colors ${
                  liked ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {liked ? (
                  <HeartFilled className="w-6 h-6 mr-2" />
                ) : (
                  <HeartOutline className="w-6 h-6 mr-2" />
                )}
                <span className="font-medium">{likeCount} {liked ? 'Liked' : 'Like'}</span>
              </button>
              
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex-1 flex items-center justify-center py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ChatOutline className="w-6 h-6 mr-2" />
                <span className="font-medium">{commentCount} Comments</span>
              </button>
              
              <button 
                onClick={() => setShowShareModal(true)}
                className="flex-1 flex items-center justify-center py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="w-6 h-6 mr-2" />
                <span className="font-medium">Share</span>
              </button>

              <button 
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/posts/${postId}/save`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: currentUserId }),
                    })
                    if (response.ok) {
                      setSaved(!saved)
                    }
                  } catch (error) {
                    console.error('Save failed:', error)
                  }
                }}
                className="flex-1 flex items-center justify-center py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <BookmarkIcon className={`w-6 h-6 mr-2 ${saved ? 'text-blue-500' : 'text-gray-500'}`} />
                <span className="font-medium">{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="px-6 pb-6 space-y-4">
              {/* Add Comment */}
              <div className="flex space-x-3">
                <img 
                  src={avatarUrl} 
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 flex space-x-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 p-3 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleComment()
                      }
                    }}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Display Comments */}
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <img 
                        src={comment.user?.profileImageUrl || comment.user?.avatar || '/images/avatars/default.svg'} 
                        alt="Commenter avatar"
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-4 py-3">
                          <div className="font-medium text-sm text-gray-900 mb-1">
                            {comment.user?.firstName && comment.user?.lastName 
                              ? `${comment.user.firstName} ${comment.user.lastName}`.trim()
                              : comment.user?.firstName || 'User'}
                          </div>
                          <p className="text-gray-800">{comment.content}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-1 ml-3">
                          <span className="text-xs text-gray-500" suppressHydrationWarning>
                            {mounted && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                          {comment.isEdited && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs text-gray-500">Edited</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          postId={post.id}
          postContent={post.content}
          postAuthor={post.author.name || 'Anonymous User'}
        />
      )}

      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={{
            id: post.id,
            content: post.content,
            images: post.images,
            videos: post.videos,
            feeling: post.feeling,
            location: post.location,
            tags: post.tags || []
          }}
          onSave={async (updatedPost: any) => {
            try {
              const response = await fetch(`/api/posts/${postId}/edit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  ...updatedPost,
                  userId: currentUserId 
                }),
              })
              if (response.ok) {
                setShowEditModal(false)
                fetchPost() // Refresh post data
              }
            } catch (error) {
              console.error('Edit failed:', error)
            }
          }}
        />
      )}
    </div>
  )
} 