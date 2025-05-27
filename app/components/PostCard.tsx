'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon as ChatOutline,
  ShareIcon,
  BookmarkIcon,
  MicrophoneIcon,
  DocumentIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartFilled } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import ShareModal from './ShareModal'
import PostOptionsMenu from './PostOptionsMenu'
import EditPostModal from './EditPostModal'
import MediaViewer from './MediaViewer'
import MusicPost from './MusicPost'
import PostModal from './PostModal'

interface Author {
  id: string
  name: string
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

interface PostProps {
  id: string
  author: Author
  content: string
  images?: string
  videos?: string
  audios?: string
  documents?: string
  likes: any[]
  comments: Comment[]
  shares: number
  createdAt: string | Date
  updatedAt?: string | Date
  isEdited?: boolean
  spoke?: string
  location?: string
  feeling?: string
  tags?: string[]
  type?: string
  isLikedByCurrentUser?: boolean
  isSaved?: boolean
  onLike?: (postId: string) => Promise<any>
  onComment?: (postId: string, comment: string) => Promise<any>
  onShare?: (postId: string) => Promise<void>
  onEdit?: (postId: string, updatedPost: any) => Promise<void>
  onDelete?: (postId: string) => Promise<void>
  onSave?: (postId: string) => Promise<void>
  onRefresh?: () => Promise<void> // ✅ ADD REFRESH CALLBACK
  currentUserId?: string
}

export default function PostCard({
  id,
  author,
  content,
  images,
  videos,
  audios,
  documents,
  likes = [],
  comments = [],
  shares = 0,
  createdAt,
  updatedAt,
  isEdited = false,
  spoke,
  location,
  feeling,
  tags,
  type = 'user-post',
  isLikedByCurrentUser = false,
  isSaved = false,
  onLike,
  onComment,
  onShare,
  onEdit,
  onDelete,
  onSave,
  onRefresh,
  currentUserId
}: PostProps) {
  const router = useRouter()
  
  // Optimized state management
  const [liked, setLiked] = useState(isLikedByCurrentUser)
  const [likeCount, setLikeCount] = useState(likes.length)
  const [commentCount, setCommentCount] = useState(comments.length)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [showMediaViewer, setShowMediaViewer] = useState(false)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  const [saved, setSaved] = useState(isSaved)
  const [mounted, setMounted] = useState(false)
  const [relativeTime, setRelativeTime] = useState('')
  const [editedRelativeTime, setEditedRelativeTime] = useState<string | null>(null)
  const [showPostModal, setShowPostModal] = useState(false)
  
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement }>({})
  const [currentVideoTime, setCurrentVideoTime] = useState(0)

  // Memoized values to prevent recalculation
  const avatarUrl = useMemo(() => 
    author.avatar || author.profileImageUrl || '/images/avatars/default.svg', 
    [author.avatar, author.profileImageUrl]
  )

  // Only update when props actually change
  useEffect(() => {
    setLiked(isLikedByCurrentUser)
  }, [isLikedByCurrentUser])

  useEffect(() => {
    setSaved(isSaved)
  }, [isSaved])

  useEffect(() => {
    setLikeCount((likes || []).length)
  }, [likes])

  useEffect(() => {
    setCommentCount((comments || []).length)
  }, [comments])

  // Mount detection for hydration safety
  useEffect(() => {
    setMounted(true)
    console.log(`✅ PostCard ${id} mounted safely`)
  }, [id])

  // Time calculation - only once on mount to prevent hydration mismatch
  useEffect(() => {
    if (!mounted) return
    
    try {
      const timeString = typeof createdAt === 'string'
        ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
        : formatDistanceToNow(createdAt, { addSuffix: true })
      setRelativeTime(timeString)

      if (isEdited && updatedAt) {
        const editedTimeString = typeof updatedAt === 'string'
          ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true })
          : formatDistanceToNow(updatedAt, { addSuffix: true })
        setEditedRelativeTime(editedTimeString)
      } else {
        setEditedRelativeTime(null)
      }
    } catch (error) {
      console.warn('Time formatting error:', error)
      setRelativeTime('recently')
      setEditedRelativeTime(null)
    }
  }, [mounted, createdAt, updatedAt, isEdited])

  // REMOVED WebSocket listeners to prevent infinite loops
  // WebSocket handling should be at app level, not component level

  // Optimized handlers with useCallback
  const handleLike = useCallback(async () => {
    if (!onLike || !mounted) return
    
    const newLiked = !liked
    const newCount = newLiked ? likeCount + 1 : likeCount - 1
    
    setLiked(newLiked)
    setLikeCount(newCount)
    
    try {
      const response = await onLike(id)
      if (response?.success) {
        setLiked(response.liked)
        setLikeCount(response.likeCount)
      }
    } catch (error) {
      setLiked(!newLiked)
      setLikeCount(likeCount)
      console.error('Like failed:', error)
    }
  }, [onLike, mounted, liked, likeCount, id])

  const handlePostClick = useCallback((e: React.MouseEvent) => {
    if (!mounted) return
    
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
      return
    }
    
    console.log(`🔗 Opening post ${id} in modal`)
    setShowPostModal(true)
  }, [mounted, id])

  const toggleComments = useCallback(() => {
    setShowComments(prev => !prev)
  }, [])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 animate-pulse">
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-32 bg-gray-200"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start space-x-3">
          <Link href={`/profile/${author.id}`}>
            <img 
              src={avatarUrl} 
              alt={author.name || 'User'}
              className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
            />
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Link href={`/profile/${author.id}`} className="font-medium text-gray-900 hover:underline">
                {author.name || 'Anonymous User'}
              </Link>
              {feeling && (
                <span className="text-sm text-gray-500">is feeling {feeling}</span>
              )}
            </div>
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <span suppressHydrationWarning>{relativeTime}</span>
              {isEdited && editedRelativeTime && (
                <>
                  <span>•</span>
                  <span suppressHydrationWarning>Edited {editedRelativeTime}</span>
                </>
              )}
              {location && (
                <>
                  <span>•</span>
                  <span>📍 {location}</span>
                </>
              )}
            </div>
          </div>
          
          <PostOptionsMenu
            postId={id}
            authorId={author.id}
            currentUserId={currentUserId}
            onEdit={() => setShowEditModal(true)}
            onDelete={async () => {
              if (window.confirm('Are you sure you want to delete this post?')) {
                await onDelete?.(id)
              }
            }}
            onSave={async () => {
              await onSave?.(id)
              setSaved(!saved)
            }}
            onHide={() => console.log('Hide post:', id)}
            onReport={() => console.log('Report post:', id)}
            onUnfollow={() => console.log('Unfollow user:', author.id)}
          />
        </div>
      </div>

      {/* Post Content - Clickable */}
      <div 
        className="px-4 pb-3 cursor-pointer" 
        onClick={handlePostClick}
      >
        <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
        
        {spoke && (
          <div className="mt-3">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border border-green-200">
              <span className="mr-1.5">🎯</span>
              <span className="font-semibold">{spoke}</span>
            </div>
          </div>
        )}
        
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span key={index} className="text-blue-600 text-sm hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media Display */}
      {(images || videos || audios || documents) && (
        <div className="mb-3 space-y-3">
          {/* Images */}
          {images && images.split(',').filter(img => img.trim()).map((img, index) => (
            <img 
              key={`img-${index}`}
              src={img.trim()} 
              alt="Post image"
              className="w-full object-cover max-h-96 rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                console.warn(`Failed to load image: ${img.trim()}`)
              }}
              loading="lazy"
            />
          ))}
          
          {/* Videos */}
          {videos && videos.split(',').filter(vid => vid.trim()).map((video, index) => (
            <video 
              key={`vid-${index}`}
              src={video.trim()} 
              className="w-full object-cover max-h-96 rounded-lg"
              controls
              preload="metadata"
              onError={(e) => {
                const target = e.target as HTMLVideoElement
                target.style.display = 'none'
                console.warn(`Failed to load video: ${video.trim()}`)
              }}
            />
          ))}

          {/* Audio Files - Enhanced with Classification */}
          {audios && audios.split(',').filter(audio => audio.trim()).map((audio, index) => {
            const fileName = audio.split('/').pop() || `Audio ${index + 1}`
            const isMusic = fileName.toLowerCase().includes('music') || fileName.toLowerCase().includes('song') || type === 'music'
            const isSpeech = !isMusic || type === 'speech'
            
            return (
              <div key={`audio-${index}`} className={`rounded-lg p-4 border-2 ${
                isMusic 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              }`}>
                <div className="space-y-3">
                  {/* Audio Header */}
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
                        <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isMusic 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isMusic ? '🎵 Music' : '🗣️ Speech'}
                          </span>
                          {spoke && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              🎯 {spoke}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Audio Actions */}
                    <div className="flex space-x-2">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Audio Player */}
                  <audio 
                    src={audio.trim()} 
                    controls 
                    className="w-full h-8"
                    style={{ 
                      filter: isMusic ? 'hue-rotate(270deg) saturate(1.2)' : 'hue-rotate(200deg)',
                      borderRadius: '8px'
                    }}
                  />

                  {/* Transcription Placeholder */}
                  {isSpeech && (
                    <div className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">Transcription</h4>
                        <button className="text-xs text-blue-600 hover:underline">
                          Show full transcript
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 italic">
                        Click to generate AI transcription...
                      </p>
                    </div>
                  )}

                  {/* Music Info Placeholder */}
                  {isMusic && (
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🎼</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Music Analysis</p>
                          <p className="text-xs text-gray-600">Genre detection, mood analysis available</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Document Files */}
          {documents && documents.split(',').filter(doc => doc.trim()).map((document, index) => {
            const fileName = document.split('/').pop() || `Document ${index + 1}`
            const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
            
            const getDocumentIcon = (ext: string) => {
              if (['pdf'].includes(ext)) return '📄'
              if (['doc', 'docx'].includes(ext)) return '📝'
              if (['xls', 'xlsx'].includes(ext)) return '📊'
              if (['ppt', 'pptx'].includes(ext)) return '📋'
              if (['txt'].includes(ext)) return '📃'
              return '📄'
            }

            return (
              <div key={`doc-${index}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{getDocumentIcon(fileExtension)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                      <p className="text-xs text-gray-500 uppercase">{fileExtension} document</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <a
                      href={document.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                      Open
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-2 flex justify-between border-b border-gray-100">
        <button 
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center py-2 rounded-md transition-colors ${
            liked ? 'text-red-500 hover:bg-gray-50' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {liked ? (
            <HeartFilled className="w-5 h-5 mr-2" />
          ) : (
            <HeartOutline className="w-5 h-5 mr-2" />
          )}
          <span className="font-medium">{liked ? 'Liked' : 'Like'}</span>
        </button>
        
        <button 
          onClick={toggleComments}
          className="flex-1 flex items-center justify-center py-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChatOutline className="w-5 h-5 mr-2" />
          <span className="font-medium">Comment</span>
        </button>
        
        <button 
          onClick={() => setShowShareModal(true)}
          className="flex-1 flex items-center justify-center py-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ShareIcon className="w-5 h-5 mr-2" />
          <span className="font-medium">Share</span>
        </button>

        <button 
          onClick={async () => {
            await onSave?.(id)
            setSaved(!saved)
          }}
          className="flex-1 flex items-center justify-center py-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <BookmarkIcon className={`w-5 h-5 mr-2 ${saved ? 'text-blue-500' : 'text-gray-500'}`} />
          <span className="font-medium">{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Comments Section - Full Featured */}
      {showComments && (
        <div className="px-4 py-3 space-y-4">
          {/* Add Comment Input */}
          <div className="flex space-x-2">
            <img 
              src={avatarUrl} 
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 p-2 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={async (e) => {
                if (e.key === 'Enter' && commentText.trim()) {
                  try {
                    await onComment?.(id, commentText)
                    setCommentText('')
                  } catch (error) {
                    console.error('Comment failed:', error)
                  }
                }
              }}
            />
          </div>

          {/* Display Comments */}
          {comments && comments.length > 0 && (
            <div className="space-y-3">
              {(showAllComments ? comments : comments.slice(0, 3)).map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <img 
                    src={comment.user?.profileImageUrl || comment.user?.avatar || '/images/avatars/default.svg'} 
                    alt={`${comment.user?.firstName || 'User'}'s avatar`}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-gray-900">
                          {comment.user?.firstName && comment.user?.lastName 
                            ? `${comment.user.firstName} ${comment.user.lastName}`.trim()
                            : comment.user?.firstName || 'User'}
                        </div>
                        {/* Comment Actions */}
                        {comment.user?.id === currentUserId && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id)
                                setEditingCommentText(comment.content)
                              }}
                              className="text-xs text-gray-500 hover:text-blue-600"
                            >
                              Edit
                            </button>
                            <span className="text-gray-300">•</span>
                            <button
                              onClick={async () => {
                                if (window.confirm('Delete this comment?')) {
                                  try {
                                    const response = await fetch(`/api/posts/${id}/comment/delete`, {
                                      method: 'DELETE',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ commentId: comment.id, userId: currentUserId }),
                                    })
                                    if (response.ok) {
                                      // Refresh post data to remove comment
                                      await onRefresh?.()
                                    }
                                  } catch (error) {
                                    console.error('Delete comment failed:', error)
                                  }
                                }
                              }}
                              className="text-xs text-gray-500 hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Comment Content - Editable if editing */}
                      {editingCommentId === comment.id ? (
                        <div className="mt-1">
                          <input
                            type="text"
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="w-full p-1 bg-white border border-gray-300 rounded text-sm"
                            onKeyPress={async (e) => {
                              if (e.key === 'Enter' && editingCommentText.trim()) {
                                try {
                                  const response = await fetch(`/api/posts/${id}/comment/edit`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      commentId: comment.id,
                                      content: editingCommentText,
                                      userId: currentUserId 
                                    }),
                                  })
                                  if (response.ok) {
                                    setEditingCommentId(null)
                                    setEditingCommentText('')
                                    await onRefresh?.() // ✅ REFRESH POST DATA
                                  }
                                } catch (error) {
                                  console.error('Edit comment failed:', error)
                                }
                              }
                              if (e.key === 'Escape') {
                                setEditingCommentId(null)
                                setEditingCommentText('')
                              }
                            }}
                            onBlur={() => {
                              setEditingCommentId(null)
                              setEditingCommentText('')
                            }}
                            autoFocus
                          />
                          <p className="text-xs text-gray-500 mt-1">Press Enter to save, Escape to cancel</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
                      )}
                    </div>
                    
                    {/* Comment Meta */}
                    <div className="flex items-center space-x-2 mt-1 ml-1">
                      <span className="text-xs text-gray-500" suppressHydrationWarning>
                        {mounted && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {comment.isEdited && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            Edited {mounted && comment.updatedAt && formatDistanceToNow(new Date(comment.updatedAt), { addSuffix: true })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show More/Less Comments */}
              {comments.length > 3 && (
                <button
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="text-sm text-blue-600 hover:underline ml-10"
                >
                  {showAllComments ? 'Show less' : `View ${comments.length - 3} more comments`}
                </button>
              )}
            </div>
          )}
          
          {/* No Comments Message */}
          {(!comments || comments.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}

      {/* Modals - Only render when needed */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          postId={id}
          postContent={content}
          postAuthor={author.name}
        />
      )}

      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={{
            id,
            content,
            images,
            videos,
            feeling,
            location,
            tags: tags || []
          }}
          onSave={async (updatedPost: any) => {
            await onEdit?.(id, updatedPost)
            setShowEditModal(false)
          }}
        />
      )}

      {/* Post Modal */}
      {showPostModal && (
        <PostModal
          postId={id}
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
} 