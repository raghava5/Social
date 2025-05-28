'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  MicrophoneIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import ShareModal from './ShareModal'
import PostOptionsMenu from './PostOptionsMenu'
import EditPostModal from './EditPostModal'
import MediaViewer from './MediaViewer'
import MusicPost from './MusicPost'
import PostModal from './PostModal'
import dynamic from 'next/dynamic'

// Dynamically import ParallaxSliderViewer to avoid SSR issues
const ParallaxSliderViewer = dynamic(() => import('./ParallaxSliderViewer'), { ssr: false })

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
  title?: string
  images?: string
  videos?: string
  audios?: string
  documents?: string
  activities?: string
  tools?: string
  games?: string
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
  isAnonymous?: boolean
  onLike?: (postId: string) => Promise<any>
  onComment?: (postId: string, comment: string, isAnonymous?: boolean) => Promise<any>
  onShare?: (postId: string) => Promise<void>
  onEdit?: (postId: string, updatedPost: any) => Promise<void>
  onDelete?: (postId: string) => Promise<void>
  onSave?: (postId: string) => Promise<void>
  onRefresh?: () => Promise<void>
  onFullScreen?: () => void
  currentUserId?: string
}

// Client-side article content renderer
const ArticleContent = ({ content }: { content: string }) => {
  const [mounted, setMounted] = useState(false)
  const [parsedContent, setParsedContent] = useState<JSX.Element | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !content) return

    try {
      // Create a temporary div to parse HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      
      // Find parallax slider nodes
      const sliderNodes = tempDiv.querySelectorAll('[data-type="parallax-slider"]')
      
      // If no slider nodes, return simple HTML content
      if (sliderNodes.length === 0) {
        setParsedContent(
          <div 
            className="prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )
        return
      }

      // Process content with sliders
      const components: JSX.Element[] = []
      let lastIndex = 0
      const fullContent = tempDiv.innerHTML
      
      sliderNodes.forEach((node, index) => {
        const nodeHTML = node.outerHTML
        const nodeIndex = fullContent.indexOf(nodeHTML, lastIndex)
        
        // Add content before the slider
        if (nodeIndex > lastIndex) {
          const beforeContent = fullContent.substring(lastIndex, nodeIndex)
          if (beforeContent.trim()) {
            components.push(
              <div 
                key={`content-${index}`}
                className="prose prose-sm max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: beforeContent }}
              />
            )
          }
        }
        
        // Add the slider component
        try {
          const slidesData = JSON.parse(node.getAttribute('data-slides') || '[]')
          if (slidesData.length > 0) {
            components.push(
              <div key={`slider-${index}`} className="my-4">
                <ParallaxSliderViewer 
                  slides={slidesData}
                  height="300px"
                  autoplay={false}
                />
              </div>
            )
          }
        } catch (error) {
          console.warn('Failed to parse slider data:', error)
          components.push(
            <div key={`slider-error-${index}`} className="my-4 p-4 bg-gray-100 rounded-lg text-center text-gray-600">
              <span>📸 Parallax Slider (Unable to load)</span>
            </div>
          )
        }
        
        lastIndex = nodeIndex + nodeHTML.length
      })
      
      // Add remaining content after the last slider
      if (lastIndex < fullContent.length) {
        const afterContent = fullContent.substring(lastIndex)
        if (afterContent.trim()) {
          components.push(
            <div 
              key="content-final"
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: afterContent }}
            />
          )
        }
      }
      
      setParsedContent(<div className="space-y-2">{components}</div>)
      
    } catch (error) {
      console.warn('Failed to parse article content:', error)
      setParsedContent(
        <div className="prose prose-sm max-w-none text-gray-800">
          <p className="text-gray-600 italic">Error loading article content</p>
        </div>
      )
    }
  }, [mounted, content])

  if (!mounted) {
    // Server-side: return basic HTML
    return (
      <div 
        className="prose prose-sm max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return parsedContent
}

// Function to parse and render article content (simplified now)
const parseArticleContent = (htmlContent: string) => {
  if (!htmlContent) return null
  return <ArticleContent content={htmlContent} />
}

export default function PostCard({
  id,
  author,
  content,
  title,
  images,
  videos,
  audios,
  documents,
  activities,
  tools,
  games,
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
  isAnonymous = false,
  onLike,
  onComment,
  onShare,
  onEdit,
  onDelete,
  onSave,
  onRefresh,
  onFullScreen,
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
  const [isAnonymousComment, setIsAnonymousComment] = useState(false)
  
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement }>({})
  const [currentVideoTime, setCurrentVideoTime] = useState(0)

  // Loading states
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const [isSaveToggling, setIsSaveToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

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
    <div className={`rounded-lg shadow-sm border mb-4 transition-colors ${
      isDeleting 
        ? 'bg-red-50 border-red-200' 
        : (isCommentSubmitting || isSaveToggling) 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-white border-gray-200'
    }`}>
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start space-x-3">
          {isAnonymous ? (
            <img 
              src={avatarUrl} 
              alt={author.name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <Link href={`/profile/${author.id}`}>
              <img 
                src={avatarUrl} 
                alt={author.name || 'User'}
                className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
              />
            </Link>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {isAnonymous ? (
                <span className="font-medium text-gray-900">
                  {author.name || 'Anonymous User'}
                </span>
              ) : (
                <Link href={`/profile/${author.id}`} className="font-medium text-gray-900 hover:underline">
                  {author.name || 'Anonymous User'}
                </Link>
              )}
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
                setIsDeleting(true)
                try {
                  await onDelete?.(id)
                } catch (error) {
                  console.error('Delete failed:', error)
                } finally {
                  setIsDeleting(false)
                }
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
        {/* Article Title and Type Indicator */}
        {type === 'article' && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200">
                <span className="mr-1">📝</span>
                Article
              </span>
            </div>
            {title && (
              <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                {title}
              </h2>
            )}
          </div>
        )}

        {/* Content */}
        {type === 'article' ? (
          parseArticleContent(content)
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
        )}
        
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
      {(images || videos || audios || documents || activities || tools || games) && (
        <div className="mb-3 space-y-3">
          {/* Images */}
          {images && images.split(',').filter(img => img.trim()).map((img, index) => (
            <img 
              key={`img-${index}`}
              src={img.trim()} 
              alt="Post image"
              className="w-full object-cover max-h-96 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onFullScreen?.()}
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
            <div key={`vid-${index}`} className="relative">
              <video 
                src={video.trim()} 
                className="w-full object-cover max-h-96 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                controls={false}
                preload="metadata"
                onClick={() => onFullScreen?.()}
                onError={(e) => {
                  const target = e.target as HTMLVideoElement
                  target.style.display = 'none'
                  console.warn(`Failed to load video: ${video.trim()}`)
                }}
              />
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black bg-opacity-50 rounded-full p-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {/* Audio Files - Enhanced with Classification */}
          {audios && audios.split(',').filter(audio => audio.trim()).map((audio, index) => {
            const fileName = audio.split('/').pop() || `Audio ${index + 1}`
            const isMusic = fileName.toLowerCase().includes('music') || fileName.toLowerCase().includes('song') || type === 'music'
            const isSpeech = !isMusic || type === 'speech'
            
            return (
              <div key={`audio-${index}`} className={`rounded-lg p-4 border-2 cursor-pointer hover:shadow-md transition-shadow ${
                isMusic 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              }`} onClick={() => onFullScreen?.()}>
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

          {/* Activities */}
          {activities && activities.split(',').filter(activity => activity.trim()).map((activity, index) => (
            <div key={`activity-${index}`} className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onFullScreen?.()}>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Activity</p>
                  <p className="text-xs text-green-600">Interactive content available</p>
                </div>
                <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  Click to engage
                </div>
              </div>
            </div>
          ))}

          {/* Tools */}
          {tools && tools.split(',').filter(tool => tool.trim()).map((tool, index) => (
            <div key={`tool-${index}`} className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onFullScreen?.()}>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🛠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Tool</p>
                  <p className="text-xs text-orange-600">Productivity tool available</p>
                </div>
                <div className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                  Click to use
                </div>
              </div>
            </div>
          ))}

          {/* Games */}
          {games && games.split(',').filter(game => game.trim()).map((game, index) => (
            <div key={`game-${index}`} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onFullScreen?.()}>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎮</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Game</p>
                  <p className="text-xs text-purple-600">Interactive game available</p>
                </div>
                <div className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                  Click to play
                </div>
              </div>
            </div>
          ))}
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
            <HeartSolidIcon className="w-5 h-5 mr-2" />
          ) : (
            <HeartIcon className="w-5 h-5 mr-2" />
          )}
          <span className="font-medium">{liked ? 'Liked' : 'Like'}</span>
        </button>
        
        <button 
          onClick={toggleComments}
          className="flex-1 flex items-center justify-center py-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChatBubbleOvalLeftIcon className="w-5 h-5 mr-2" />
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
            setIsSaveToggling(true)
            try {
              await onSave?.(id)
              setSaved(!saved)
            } catch (error) {
              console.error('Save failed:', error)
            } finally {
              setIsSaveToggling(false)
            }
          }}
          disabled={isSaveToggling}
          className={`flex-1 flex items-center justify-center py-2 rounded-md transition-colors ${
            isSaveToggling 
              ? 'bg-yellow-100 border border-yellow-200 text-yellow-800' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {isSaveToggling ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
          ) : saved ? (
            <BookmarkSolidIcon className="w-5 h-5 mr-2 text-blue-500" />
          ) : (
            <BookmarkIcon className="w-5 h-5 mr-2 text-gray-500" />
          )}
          <span className="font-medium">
            {isSaveToggling ? 'Saving...' : (saved ? 'Saved' : 'Save')}
          </span>
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
                if (e.key === 'Enter' && commentText.trim() && !isCommentSubmitting) {
                  setIsCommentSubmitting(true)
                  try {
                    await onComment?.(id, commentText, isAnonymousComment)
                    setCommentText('')
                  } catch (error) {
                    console.error('Comment failed:', error)
                  } finally {
                    setIsCommentSubmitting(false)
                  }
                }
              }}
              disabled={isCommentSubmitting}
            />
            {/* Show anonymous toggle only for anonymous posts */}
            {isAnonymous && (
              <button
                onClick={() => setIsAnonymousComment(!isAnonymousComment)}
                className={`p-2 rounded-full text-sm transition-colors ${
                  isAnonymousComment 
                    ? 'bg-gray-200 text-gray-700' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title={isAnonymousComment ? 'Comment anonymously' : 'Comment publicly'}
                disabled={isCommentSubmitting}
              >
                {isAnonymousComment ? '🔒' : '👤'}
              </button>
            )}
            {/* Loading indicator for comments */}
            {isCommentSubmitting && (
              <div className="p-2 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
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
                                  setDeletingCommentId(comment.id)
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
                                  } finally {
                                    setDeletingCommentId(null)
                                  }
                                }
                              }}
                              className={`text-xs transition-colors ${
                                deletingCommentId === comment.id 
                                  ? 'text-red-500 cursor-not-allowed' 
                                  : 'text-gray-500 hover:text-red-600'
                              }`}
                              disabled={deletingCommentId === comment.id}
                            >
                              {deletingCommentId === comment.id ? 'Deleting...' : 'Delete'}
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