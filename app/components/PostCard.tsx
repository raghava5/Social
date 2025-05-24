'use client'

import { useState, useEffect } from 'react'
import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon as ChatOutline,
  ShareIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartFilled } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import ShareModal from './ShareModal'
import PostOptionsMenu from './PostOptionsMenu'
import EditPostModal from './EditPostModal'

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
  onLike?: (postId: string) => Promise<any>
  onComment?: (postId: string, comment: string) => Promise<any>
  onShare?: (postId: string) => Promise<void>
  onEdit?: (postId: string, updatedPost: any) => Promise<void>
  onDelete?: (postId: string) => Promise<void>
  onSave?: (postId: string) => Promise<void>
  currentUserId?: string
}

export default function PostCard({
  id,
  author,
  content,
  images,
  videos,
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
  onLike,
  onComment,
  onShare,
  onEdit,
  onDelete,
  onSave,
  currentUserId
}: PostProps) {
  // Facebook-style simple state management
  const [liked, setLiked] = useState(isLikedByCurrentUser)
  const [likeCount, setLikeCount] = useState(likes.length)
  const [commentCount, setCommentCount] = useState(comments.length)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Update when props change
  useEffect(() => {
    setLiked(isLikedByCurrentUser)
    setLikeCount(likes.length)
    setCommentCount(comments.length)
  }, [isLikedByCurrentUser, likes.length, comments.length])

  const timestamp = typeof createdAt === 'string' 
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : formatDistanceToNow(createdAt, { addSuffix: true })

  const editedTimestamp = isEdited && updatedAt 
    ? typeof updatedAt === 'string' 
      ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true })
      : formatDistanceToNow(updatedAt, { addSuffix: true })
    : null

  const avatarUrl = author.avatar || author.profileImageUrl || '/images/avatars/default.svg'

  // Facebook-style like handler - instant feedback
  const handleLike = async () => {
    if (!onLike) return
    
    // Instant visual feedback (Facebook way)
    const newLiked = !liked
    const newCount = newLiked ? likeCount + 1 : likeCount - 1
    
    setLiked(newLiked)
    setLikeCount(newCount)
    
    try {
      const response = await onLike(id)
      // Sync with server response if needed
      if (response?.success) {
        setLiked(response.liked)
        setLikeCount(response.likeCount)
      }
    } catch (error) {
      // Revert on error
      setLiked(!newLiked)
      setLikeCount(likeCount)
      console.error('Like failed:', error)
    }
  }

  // Facebook-style comment handler
  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !onComment) return
    
    const text = commentText
    setCommentText('') // Clear immediately
    
    try {
      const response = await onComment(id, text)
      if (response?.success) {
        setCommentCount(prev => prev + 1)
        setShowComments(true) // Show comments after posting
        // Add the new comment to the local state for immediate feedback
        const newComment = response.comment
        if (newComment) {
          comments.unshift(newComment) // Add to beginning of comments array
        }
      }
    } catch (error) {
      setCommentText(text) // Restore on error
      console.error('Comment failed:', error)
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  const startCommenting = () => {
    setIsCommenting(true)
    setShowComments(true)
  }

  // Post action handlers
  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await onDelete?.(id)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleSave = async () => {
    try {
      await onSave?.(id)
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  const handleEditSave = async (updatedPost: any) => {
    try {
      await onEdit?.(id, updatedPost)
      setShowEditModal(false)
    } catch (error) {
      console.error('Edit failed:', error)
    }
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
              className="w-10 h-10 rounded-full object-cover"
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
              <span>{timestamp}</span>
              {isEdited && editedTimestamp && (
                <>
                  <span>•</span>
                  <span>Edited {editedTimestamp}</span>
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
          
          {/* Post Options Menu */}
          <PostOptionsMenu
            postId={id}
            authorId={author.id}
            currentUserId={currentUserId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSave={handleSave}
            onHide={() => console.log('Hide post:', id)}
            onReport={() => console.log('Report post:', id)}
            onUnfollow={() => console.log('Unfollow user:', author.id)}
          />
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
        
        {/* Tags */}
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

      {/* Media */}
      {images && (
        <div className="mb-3">
          {images.split(',').filter(img => img.trim()).map((img, index) => (
            <img 
              key={index}
              src={img.trim()} 
              alt="Post image"
              className="w-full object-cover max-h-96"
            />
          ))}
        </div>
      )}

      {/* Post Stats */}
      {(likeCount > 0 || commentCount > 0 || shares > 0) && (
        <div className="px-4 py-2 flex justify-between text-sm text-gray-500 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            {likeCount > 0 && (
              <span className="flex items-center space-x-1 cursor-pointer hover:underline">
                <HeartFilled className="w-4 h-4 text-red-500" />
                <span>{likeCount}</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {commentCount > 0 && (
              <span className="cursor-pointer hover:underline" onClick={toggleComments}>
                {commentCount} comments
              </span>
            )}
            {shares > 0 && <span>{shares} shares</span>}
          </div>
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
          <span className="font-medium">Like</span>
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
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-3 space-y-3">
          {commentCount > 0 && (showAllComments ? comments : comments.slice(0, 3)).map((comment) => (
            <div key={comment.id} className="flex space-x-2 group">
              <img 
                src={comment.user.profileImageUrl || comment.user.avatar || '/images/avatars/default.svg'} 
                alt={`${comment.user.firstName} ${comment.user.lastName}`}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg px-3 py-2 relative">
                  <div className="font-medium text-sm text-gray-900">
                    {comment.user.firstName} {comment.user.lastName}
                  </div>
                  <div className="text-sm text-gray-800">{comment.content}</div>
                  
                  {/* Comment Options - Show on hover */}
                  {(comment.user.id === currentUserId || author.id === currentUserId) && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        {comment.user.id === currentUserId && (
                          <button
                            onClick={() => console.log('Edit comment:', comment.id)}
                            className="text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-white"
                          >
                            Edit
                          </button>
                        )}
                        {(comment.user.id === currentUserId || author.id === currentUserId) && (
                          <button
                            onClick={() => console.log('Delete comment:', comment.id)}
                            className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-white"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-3 flex items-center space-x-2">
                  <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                  {comment.isEdited && (
                    <>
                      <span>•</span>
                      <span>Edited</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {commentCount > 3 && !showAllComments && (
            <button 
              onClick={() => setShowAllComments(true)}
              className="text-sm text-gray-500 hover:text-gray-700 text-center py-2 w-full hover:underline"
            >
              View all {commentCount} comments
            </button>
          )}
          {showAllComments && commentCount > 3 && (
            <button 
              onClick={() => setShowAllComments(false)}
              className="text-sm text-gray-500 hover:text-gray-700 text-center py-2 w-full hover:underline"
            >
              Show fewer comments
            </button>
          )}
          
          {/* Always show comment input when comments section is open */}
          <div className="flex space-x-2 pt-2 border-t border-gray-100">
            <img 
              src={avatarUrl} 
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-2 rounded-full bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
              />
              {commentText.trim() && (
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => setCommentText('')}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCommentSubmit}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={id}
        postContent={content}
        postAuthor={author.name}
      />

      {/* Edit Post Modal */}
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
        onSave={handleEditSave}
      />

    </div>
  )
} 