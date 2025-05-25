'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import PostCard from './PostCard'
import Link from 'next/link'
import ShareModal from './ShareModal'
import PostOptionsMenu from './PostOptionsMenu'

interface MediaViewerProps {
  isOpen: boolean
  onClose: () => void
  media: string[]
  initialIndex?: number
  post?: {
    id: string
    author: {
      id: string
      name: string
      profileImageUrl?: string
    }
    content: string
    createdAt: string | Date
    likes: any[]
    comments: any[]
    shares: number
    spoke?: string
    location?: string
    feeling?: string
    tags?: string[]
  }
  onLike?: (postId: string) => Promise<any>
  onComment?: (postId: string, content: string) => Promise<any>
  onShare?: (postId: string) => Promise<void>
  currentUserId?: string
}

export default function MediaViewer({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
  post,
  onLike,
  onComment,
  onShare,
  currentUserId
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [showComments, setShowComments] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (post) {
      setLiked(post.likes.some((like: any) => like.userId === currentUserId))
      setLikeCount(post.likes.length)
      setSaved(false)
    }
  }, [post, currentUserId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsMenu) {
        setShowOptionsMenu(false)
      }
    }

    if (showOptionsMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showOptionsMenu])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
  }

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov|avi)$/i)
  }

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId)
    setEditingCommentText(currentContent)
  }

  const handleSaveCommentEdit = async (commentId: string) => {
    if (!editingCommentText.trim() || !post) return

    try {
      const response = await fetch(`/api/posts/${post.id}/comment/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          content: editingCommentText.trim(),
          userId: currentUserId
        })
      })

      if (response.ok) {
        // Update the comment in the local state
        const commentIndex = post.comments.findIndex(c => c.id === commentId)
        if (commentIndex !== -1) {
          post.comments[commentIndex] = {
            ...post.comments[commentIndex],
            content: editingCommentText.trim(),
            isEdited: true,
            updatedAt: new Date().toISOString()
          }
        }
        setEditingCommentId(null)
        setEditingCommentText('')
      }
    } catch (error) {
      console.error('Error editing comment:', error)
    }
  }

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null)
    setEditingCommentText('')
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?') || !post) return

    try {
      const response = await fetch(`/api/posts/${post.id}/comment/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId,
          userId: currentUserId
        })
      })

      if (response.ok) {
        // Remove the comment from local state
        const updatedComments = post.comments.filter(c => c.id !== commentId)
        post.comments.length = 0
        post.comments.push(...updatedComments)
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  // Handle like action
  const handleLike = async () => {
    if (!onLike || !post) return
    
    try {
      const response = await onLike(post.id)
      console.log('MediaViewer like response:', response)
      
      // Use response data instead of toggling
      if (response?.success) {
        setLiked(response.liked)
        setLikeCount(response.likeCount)
      }
    } catch (error) {
      console.error('Like failed:', error)
    }
  }

  // Handle share action
  const handleShare = async () => {
    if (!post) return
    setShowShareModal(true)
  }

  // Handle save action
  const handleSave = async () => {
    if (!post) return
    
    try {
      const response = await fetch(`/api/posts/${post.id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSaved(!saved)
        console.log('Post saved:', data)
      }
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  // Toggle comments section
  const toggleComments = () => {
    setShowComments(!showComments)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex">
      {/* Close button - moved to leftmost top position of media section */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 text-white hover:text-gray-300 transition-colors"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>

      {/* Options button - moved to where close button was */}
      {post && (
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:text-gray-300 transition-colors"
          >
            <EllipsisHorizontalIcon className="w-6 h-6" />
          </button>
          
          {showOptionsMenu && (
            <PostOptionsMenu
              postId={post.id}
              authorId={post.author.id}
              currentUserId={currentUserId}
              onEdit={() => {}}
              onDelete={() => {}}
              onSave={() => {}}
              onHide={() => console.log('Hide post')}
              onReport={() => console.log('Report post')}
              onUnfollow={() => console.log('Unfollow user')}
            />
          )}
        </div>
      )}

      {/* Navigation arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Media display area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl max-h-full">
          {isVideo(media[currentIndex]) ? (
            <video
              src={media[currentIndex]}
              controls
              className="max-w-full max-h-full object-contain"
              autoPlay
            />
          ) : (
            <img
              src={media[currentIndex]}
              alt={`Media ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      </div>

      {/* Post details sidebar */}
      {post && (
        <div className="w-96 bg-white flex flex-col">
          {/* Post header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Link href={`/profile/${post.author.id}`}>
                <img
                  src={post.author.profileImageUrl || '/images/avatars/default.svg'}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer"
                />
              </Link>
              <div>
                <Link href={`/profile/${post.author.id}`}>
                  <h3 className="font-medium text-gray-900 hover:underline cursor-pointer">{post.author.name}</h3>
                </Link>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(
                    typeof post.createdAt === 'string' 
                      ? new Date(post.createdAt) 
                      : post.createdAt,
                    { addSuffix: true }
                  )}
                </p>
              </div>
            </div>
            {post.content && (
              <div className="mt-3">
                <p className="text-gray-800">{post.content}</p>
              </div>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {post.tags.map((tag, index) => (
                  <span key={index} className="text-blue-600 text-sm hover:underline cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post stats */}
          <div className="px-4 py-2 border-b border-gray-200 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>{likeCount} likes</span>
              <span>{post.comments.length} comments</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-2 flex justify-between border-b border-gray-100">
            <button 
              onClick={handleLike}
              className="flex-1 flex items-center justify-center py-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <HeartIcon className={`w-5 h-5 mr-2 ${liked ? 'text-red-500' : 'text-gray-500'}`} />
              <span className="font-medium">{liked ? 'Unlike' : 'Like'}</span>
            </button>
            
            <button 
              onClick={toggleComments}
              className="flex-1 flex items-center justify-center py-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChatBubbleOvalLeftIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">Comment</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex-1 flex items-center justify-center py-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ShareIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">Share</span>
            </button>

            <button 
              onClick={handleSave}
              className="flex-1 flex items-center justify-center py-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <BookmarkIcon className={`w-5 h-5 mr-2 ${saved ? 'text-blue-500' : 'text-gray-500'}`} />
              <span className="font-medium">{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {post.comments.map((comment: any) => (
                  <div key={comment.id} className="flex space-x-2">
                    <Link href={`/profile/${comment.user.id}`}>
                      <img
                        src={comment.user.profileImageUrl || '/images/avatars/default.svg'}
                        alt={`${comment.user.firstName} ${comment.user.lastName}`}
                        className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    </Link>
                    <div className="flex-1">
                      {editingCommentId === comment.id ? (
                        // Edit mode
                        <div className="space-y-2">
                          <textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveCommentEdit(comment.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelCommentEdit}
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <>
                          <div className="bg-gray-100 rounded-lg px-3 py-2 relative group">
                            <Link href={`/profile/${comment.user.id}`}>
                              <div className="font-medium text-sm text-gray-900 hover:underline cursor-pointer">
                                {comment.user.firstName} {comment.user.lastName}
                              </div>
                            </Link>
                            <div className="text-sm text-gray-800">{comment.content}</div>
                            
                            {/* Edit/Delete buttons for comment owner */}
                            {comment.user.id === currentUserId && (
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleEditComment(comment.id, comment.content)}
                                    className="p-1 text-xs text-gray-500 hover:text-blue-600"
                                    title="Edit comment"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="p-1 text-xs text-gray-500 hover:text-red-600"
                                    title="Delete comment"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 ml-3">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            {comment.isEdited && (
                              <>
                                <span className="mx-1">•</span>
                                <span>Edited</span>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comment input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <img
                src={post.author.profileImageUrl || '/images/avatars/default.svg'}
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 p-2 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && onComment) {
                    const target = e.target as HTMLInputElement
                    if (target.value.trim()) {
                      // Add optimistic comment
                      const newComment = {
                        id: `temp-${Date.now()}`,
                        content: target.value.trim(),
                        createdAt: new Date().toISOString(),
                        isEdited: false,
                        user: {
                          id: currentUserId || 'temp-user',
                          firstName: 'You',
                          lastName: '',
                          profileImageUrl: post.author.profileImageUrl || '/images/avatars/default.svg'
                        }
                      }
                      
                      // Add to comments array immediately
                      post.comments.unshift(newComment)
                      
                      // Call the API
                      onComment(post.id, target.value.trim()).then((response) => {
                        if (response?.success) {
                          // Remove temp comment and add real one
                          const tempIndex = post.comments.findIndex(c => c.id === newComment.id)
                          if (tempIndex !== -1) {
                            post.comments.splice(tempIndex, 1)
                            if (response.comment) {
                              post.comments.unshift(response.comment)
                            }
                          }
                        }
                      }).catch(() => {
                        // Remove temp comment on error
                        const tempIndex = post.comments.findIndex(c => c.id === newComment.id)
                        if (tempIndex !== -1) {
                          post.comments.splice(tempIndex, 1)
                        }
                      })
                      
                      target.value = ''
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Media counter */}
          {media.length > 1 && (
            <div className="p-2 text-center text-sm text-gray-500 border-t border-gray-200">
              {currentIndex + 1} of {media.length}
            </div>
          )}
        </div>
      )}
      
      {/* Share Modal */}
      {post && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          postId={post.id}
          postContent={post.content}
          postAuthor={post.author.name}
        />
      )}
    </div>
  )
} 