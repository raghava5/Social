'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  BookmarkIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import PostCard from './PostCard'
import Link from 'next/link'
import ShareModal from './ShareModal'
import PostOptionsMenu from './PostOptionsMenu'

interface TranscriptSegment {
  start: number
  end: number
  text: string
}

interface Transcript {
  id: string
  postId: string
  videoUrl: string
  status: 'processing' | 'completed' | 'failed'
  segments: TranscriptSegment[]
  fullText: string
  duration: number
  language: string
}

interface MediaViewerProps {
  isOpen: boolean
  onClose: () => void
  media: string[]
  initialIndex?: number
  initialVideoTime?: number
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
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  currentUserId?: string
}

export default function MediaViewer({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
  initialVideoTime = 0,
  post,
  onLike,
  onComment,
  onShare,
  onEdit,
  onDelete,
  currentUserId
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [showComments, setShowComments] = useState(true)
  const [showTranscript, setShowTranscript] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showShareModal, setShowShareModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)
  
  // Transcript states
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const [transcriptError, setTranscriptError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSegments, setFilteredSegments] = useState<TranscriptSegment[]>([])
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1)
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)
  
  const transcriptRef = useRef<HTMLDivElement>(null)
  const activeSegmentRef = useRef<HTMLDivElement>(null)
  const videoTimeUpdateRef = useRef<(() => void) | null>(null)

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

  // Reset transcript when media changes
  useEffect(() => {
    setTranscript(null)
    setShowTranscript(false)
    setTranscriptError(null)
    setSearchQuery('')
    setActiveSegmentIndex(-1)
  }, [currentIndex])

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

  // Update filtered segments when search changes
  useEffect(() => {
    if (!transcript) return

    if (searchQuery.trim() === '') {
      setFilteredSegments(transcript.segments)
      setSearchResults([])
      setCurrentSearchIndex(-1)
    } else {
      const query = searchQuery.toLowerCase()
      const results: number[] = []
      
      transcript.segments.forEach((segment, index) => {
        if (segment.text.toLowerCase().includes(query)) {
          results.push(index)
        }
      })
      
      setSearchResults(results)
      setCurrentSearchIndex(results.length > 0 ? 0 : -1)
      setFilteredSegments(transcript.segments)
    }
  }, [searchQuery, transcript])

  // Update active segment based on current time
  useEffect(() => {
    if (!transcript || !transcript.segments) return

    const activeIndex = transcript.segments.findIndex((segment, index) => {
      const nextSegment = transcript.segments[index + 1]
      return currentVideoTime >= segment.start && (!nextSegment || currentVideoTime < nextSegment.start)
    })

    setActiveSegmentIndex(activeIndex)
  }, [currentVideoTime, transcript])

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && activeSegmentIndex !== -1) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [activeSegmentIndex])

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

  // Handle video seeking from transcript
  const handleVideoSeek = (time: number) => {
    if (videoRef) {
      videoRef.currentTime = time
      videoRef.play() // Ensure video continues playing after seek
    }
  }

  // Check if current media is a video
  const isCurrentMediaVideo = isVideo(media[currentIndex])

  // Toggle between comments and transcript
  const toggleComments = () => {
    setShowComments(true)
    setShowTranscript(false)
  }

  const toggleTranscript = () => {
    if (!showTranscript && !transcript) {
      fetchTranscript()
    }
    setShowTranscript(true)
    setShowComments(false)
  }

  // Handle edit action
  const handleEdit = () => {
    if (onEdit && post) {
      onEdit(post.id)
    }
  }

  // Handle delete action
  const handleDelete = async () => {
    if (onDelete && post) {
      if (window.confirm('Are you sure you want to delete this post?')) {
        onDelete(post.id)
      }
    }
  }

  // Fetch transcript for current video
  const fetchTranscript = async () => {
    if (!post || !isCurrentMediaVideo) return

    setLoadingTranscript(true)
    setTranscriptError(null)

    try {
      const currentVideoUrl = media[currentIndex]
      const response = await fetch(`/api/transcribe-free?postId=${post.id}&videoUrl=${encodeURIComponent(currentVideoUrl)}`)
      
      if (response.status === 404) {
        // Transcript doesn't exist, check if it's processing from upload
        setTranscriptError('🆓 Transcript is being generated. This happens automatically when you upload a video. Please wait...')
        
        // Still poll for it in case it was triggered elsewhere
        pollTranscriptionStatus(currentVideoUrl)
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch transcript')
      }

      const data = await response.json()
      
      // Check if this transcript is for the current video
      if (data.transcript.videoUrl === currentVideoUrl) {
        setTranscript(data.transcript)
        
        if (data.transcript.segments) {
          setFilteredSegments(data.transcript.segments)
        }
        
        // If still processing, poll for updates
        if (data.transcript.status === 'processing') {
          pollTranscriptionStatus(currentVideoUrl)
        }
      } else {
        // Transcript exists but for different video, might need to generate new one
        setTranscriptError('🔄 No transcript found for this video. It may still be processing...')
        pollTranscriptionStatus(currentVideoUrl)
      }
    } catch (error) {
      console.error('Error fetching transcript:', error)
      setTranscriptError('❌ Failed to load transcript')
    } finally {
      setLoadingTranscript(false)
    }
  }

  const generateTranscript = async () => {
    if (!post || !isCurrentMediaVideo) return

    setLoadingTranscript(true)
    setTranscriptError(null)

    try {
      const currentVideoUrl = media[currentIndex]

      const response = await fetch('/api/transcribe-free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          videoUrl: currentVideoUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start transcription')
      }

      const data = await response.json()
      setTranscript(data.transcript)
      
      // Show success message
      if (data.message) {
        setTranscriptError(data.message)
      }
      
      // Poll for completion
      pollTranscriptionStatus(currentVideoUrl)
    } catch (error) {
      console.error('Error generating transcript:', error)
      setTranscriptError('❌ Failed to generate transcript')
      setLoadingTranscript(false)
    }
  }

  const pollTranscriptionStatus = async (videoUrl: string) => {
    const pollInterval = setInterval(async () => {
      try {
        if (!post) return

        const response = await fetch(`/api/transcribe-free?postId=${post.id}&videoUrl=${encodeURIComponent(videoUrl)}`)
        if (response.ok) {
          const data = await response.json()
          
          // Only update if this is still the current video
          if (videoUrl === media[currentIndex]) {
            setTranscript(data.transcript)
            
            if (data.transcript.status === 'completed') {
              setFilteredSegments(data.transcript.segments)
              setLoadingTranscript(false)
              setTranscriptError(null) // Clear any previous messages
              clearInterval(pollInterval)
            } else if (data.transcript.status === 'failed') {
              setTranscriptError('❌ Transcription failed. Please try again.')
              setLoadingTranscript(false)
              clearInterval(pollInterval)
            } else if (data.transcript.status === 'processing') {
              setTranscriptError('🔄 Transcribing with FREE Whisper.cpp... Please wait.')
            }
          } else {
            // Video changed, stop polling
            clearInterval(pollInterval)
            setLoadingTranscript(false)
          }
        }
      } catch (error) {
        console.error('Error polling transcript status:', error)
      }
    }, 3000) // Poll every 3 seconds (less frequent than before)

    // Clear interval after 10 minutes (longer timeout for free processing)
    setTimeout(() => {
      clearInterval(pollInterval)
      setLoadingTranscript(false)
      if (transcript?.status === 'processing') {
        setTranscriptError('⏰ Transcription is taking longer than expected. Please check back later.')
      }
    }, 600000) // 10 minutes
  }

  const handleSegmentClick = (segment: TranscriptSegment) => {
    handleVideoSeek(segment.start)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const downloadTranscript = () => {
    if (!transcript) return

    const content = transcript.segments
      .map(segment => `[${formatTime(segment.start)}] ${segment.text}`)
      .join('\n\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${post?.id}-${currentIndex}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const navigateSearch = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return

    let newIndex = currentSearchIndex
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length
    } else {
      newIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1
    }

    setCurrentSearchIndex(newIndex)
    const segmentIndex = searchResults[newIndex]
    const segment = transcript?.segments[segmentIndex]
    if (segment) {
      handleVideoSeek(segment.start)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 text-white hover:text-gray-300 transition-colors"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>

      {/* Options button */}
      {post && (
        <div className="absolute top-4 right-4 z-20">
          <PostOptionsMenu
            postId={post.id}
            authorId={post.author.id}
            currentUserId={currentUserId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSave={() => {}}
            onHide={() => console.log('Hide post')}
            onReport={() => console.log('Report post')}
            onUnfollow={() => console.log('Unfollow user')}
          />
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
              key={`video-${currentIndex}-${media[currentIndex]}`} // Key prevents double playing
              src={media[currentIndex]}
              controls
              className="max-w-full max-h-full object-contain"
              ref={(el) => {
                // Clean up previous event listener
                if (videoTimeUpdateRef.current && videoRef) {
                  videoRef.removeEventListener('timeupdate', videoTimeUpdateRef.current)
                }
                
                setVideoRef(el)
                if (el) {
                  // Set initial video time
                  if (initialVideoTime > 0) {
                    el.currentTime = initialVideoTime
                  }
                  
                  // Create new event listener
                  videoTimeUpdateRef.current = () => {
                    setCurrentVideoTime(el.currentTime)
                  }
                  el.addEventListener('timeupdate', videoTimeUpdateRef.current)
                }
              }}
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
          <div className="px-4 py-2 flex justify-center space-x-4 border-b border-gray-100">
            <button 
              onClick={handleLike}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors group"
              title={liked ? 'Unlike' : 'Like'}
            >
              <HeartIcon className={`w-6 h-6 ${liked ? 'text-red-500' : 'text-gray-600 group-hover:text-red-500'}`} />
            </button>
            
            <button 
              onClick={toggleComments}
              className={`p-3 rounded-full transition-colors group ${
                showComments ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Comments"
            >
              <ChatBubbleOvalLeftIcon className={`w-6 h-6 ${showComments ? 'text-blue-600' : 'group-hover:text-blue-600'}`} />
            </button>
            
            <button 
              onClick={handleShare}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors group"
              title="Share"
            >
              <ShareIcon className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
            </button>

            <button 
              onClick={handleSave}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors group"
              title={saved ? 'Unsave' : 'Save'}
            >
              <BookmarkIcon className={`w-6 h-6 ${saved ? 'text-blue-500' : 'text-gray-600 group-hover:text-blue-500'}`} />
            </button>

            {/* Transcribe button - only for videos */}
            {isCurrentMediaVideo && (
              <button 
                onClick={toggleTranscript}
                className={`p-3 rounded-full transition-colors group ${
                  showTranscript ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Transcript"
              >
                <DocumentTextIcon className={`w-6 h-6 ${showTranscript ? 'text-purple-600' : 'group-hover:text-purple-600'}`} />
              </button>
            )}
          </div>

          {/* Content Area - Comments or Transcript */}
          <div className="flex-1 overflow-y-auto">
            {showComments && (
              <div className="p-4">
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

            {showTranscript && isCurrentMediaVideo && (
              <div className="p-4">
                {/* Transcript Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Video Transcript</h3>
                    {transcript && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transcript.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transcript.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transcript.status}
                      </span>
                    )}
                  </div>
                  {transcript && transcript.status === 'completed' && (
                    <button
                      onClick={downloadTranscript}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                      title="Download transcript"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Bar */}
                {transcript && transcript.status === 'completed' && (
                  <div className="mb-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search transcript..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-16 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      {searchResults.length > 0 && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-xs text-gray-500">
                          <span>{currentSearchIndex + 1}/{searchResults.length}</span>
                          <button
                            onClick={() => navigateSearch('prev')}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => navigateSearch('next')}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            ↓
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Transcript Content */}
                <div className="space-y-2" ref={transcriptRef}>
                  {loadingTranscript && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">
                          {transcript?.status === 'processing' ? 'Generating transcript...' : 'Loading transcript...'}
                        </p>
                      </div>
                    </div>
                  )}

                  {transcriptError && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">{transcriptError}</p>
                        {transcriptError.includes('not available') && (
                          <button
                            onClick={generateTranscript}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                          >
                            Generate Transcript
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {transcript && transcript.status === 'completed' && transcript.segments && (
                    <>
                      {filteredSegments.map((segment, index) => {
                        const originalIndex = transcript.segments.indexOf(segment)
                        const isActive = originalIndex === activeSegmentIndex
                        const isSearchResult = searchResults.includes(originalIndex)
                        const isCurrentSearchResult = searchResults[currentSearchIndex] === originalIndex
                        
                        return (
                          <div
                            key={originalIndex}
                            ref={isActive ? activeSegmentRef : undefined}
                            onClick={() => handleSegmentClick(segment)}
                            className={`p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                              isActive 
                                ? 'bg-blue-100 border-l-2 border-blue-500' 
                                : isCurrentSearchResult
                                ? 'bg-yellow-100 border-l-2 border-yellow-500'
                                : isSearchResult
                                ? 'bg-yellow-50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded flex-shrink-0">
                                {formatTime(segment.start)}
                              </span>
                              <p className={`text-xs flex-1 ${
                                isActive ? 'text-blue-900 font-medium' : 'text-gray-700'
                              }`}>
                                {searchQuery && isSearchResult ? (
                                  <span dangerouslySetInnerHTML={{
                                    __html: segment.text.replace(
                                      new RegExp(`(${searchQuery})`, 'gi'),
                                      '<mark class="bg-yellow-200">$1</mark>'
                                    )
                                  }} />
                                ) : (
                                  segment.text
                                )}
                              </p>
                              {isActive && (
                                <PlayIcon className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                      
                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Duration: {formatTime(transcript.duration)}</span>
                          <span>Language: {transcript.language.toUpperCase()}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {transcript && transcript.status === 'failed' && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <p className="text-sm text-red-600 mb-3">Transcription failed</p>
                        <button
                          onClick={generateTranscript}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Comment input - only show when in comments mode */}
          {showComments && (
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
          )}

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