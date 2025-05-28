'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerXMarkIcon,
  SpeakerWaveIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
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

interface FullScreenPostProps {
  id: string
  author: Author
  content: string
  title?: string
  images?: string
  videos?: string
  audios?: string
  documents?: string
  likes: any[]
  comments: any[]
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
  onSave?: (postId: string) => Promise<void>
  currentUserId?: string
  index?: number
  isActive?: boolean
}

// Article content parser for full-screen display
const ArticleContent = ({ content }: { content: string }) => {
  const [mounted, setMounted] = useState(false)
  const [parsedContent, setParsedContent] = useState<JSX.Element | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !content) return

    try {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      
      const sliderNodes = tempDiv.querySelectorAll('[data-type="parallax-slider"]')
      
      if (sliderNodes.length === 0) {
        setParsedContent(
          <div 
            className="prose prose-lg max-w-none text-white prose-headings:text-white prose-p:text-gray-100 prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )
        return
      }

      const components: JSX.Element[] = []
      let lastIndex = 0
      const fullContent = tempDiv.innerHTML
      
      sliderNodes.forEach((node, index) => {
        const nodeHTML = node.outerHTML
        const nodeIndex = fullContent.indexOf(nodeHTML, lastIndex)
        
        if (nodeIndex > lastIndex) {
          const beforeContent = fullContent.substring(lastIndex, nodeIndex)
          if (beforeContent.trim()) {
            components.push(
              <div 
                key={`content-${index}`}
                className="prose prose-lg max-w-none text-white prose-headings:text-white prose-p:text-gray-100 prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: beforeContent }}
              />
            )
          }
        }
        
        try {
          const slidesData = JSON.parse(node.getAttribute('data-slides') || '[]')
          if (slidesData.length > 0) {
            components.push(
              <div key={`slider-${index}`} className="my-6">
                <ParallaxSliderViewer 
                  slides={slidesData}
                  height="400px"
                  autoplay={true}
                />
              </div>
            )
          }
        } catch (error) {
          console.warn('Failed to parse slider data:', error)
          components.push(
            <div key={`slider-error-${index}`} className="my-6 p-4 bg-black/20 rounded-lg text-center text-white">
              <span>📸 Parallax Slider (Unable to load)</span>
            </div>
          )
        }
        
        lastIndex = nodeIndex + nodeHTML.length
      })
      
      if (lastIndex < fullContent.length) {
        const afterContent = fullContent.substring(lastIndex)
        if (afterContent.trim()) {
          components.push(
            <div 
              key="content-final"
              className="prose prose-lg max-w-none text-white prose-headings:text-white prose-p:text-gray-100 prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: afterContent }}
            />
          )
        }
      }
      
      setParsedContent(<div className="space-y-4">{components}</div>)
      
    } catch (error) {
      console.warn('Failed to parse article content:', error)
      setParsedContent(
        <div className="prose prose-lg max-w-none text-white">
          <p className="text-gray-300 italic">Error loading article content</p>
        </div>
      )
    }
  }, [mounted, content])

  if (!mounted) {
    return (
      <div 
        className="prose prose-lg max-w-none text-white prose-headings:text-white prose-p:text-gray-100 prose-strong:text-white"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return parsedContent
}

export default function FullScreenPost({
  id,
  author,
  content,
  title,
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
  isAnonymous = false,
  onLike,
  onComment,
  onShare,
  onSave,
  currentUserId,
  index = 0,
  isActive = false
}: FullScreenPostProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // State management
  const [liked, setLiked] = useState(isLikedByCurrentUser)
  const [likeCount, setLikeCount] = useState(likes.length)
  const [saved, setSaved] = useState(isSaved)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [mounted, setMounted] = useState(false)
  const [relativeTime, setRelativeTime] = useState('')
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)

  // Get background image from various sources
  const getBackgroundImage = () => {
    if (images) {
      const imageList = images.split(',').filter(img => img.trim())
      if (imageList.length > 0) return imageList[0].trim()
    }
    if (videos) {
      // For videos, we could extract a thumbnail or use a default
      return '/images/video-bg-placeholder.jpg'
    }
    // Default gradient background
    return null
  }

  const backgroundImage = getBackgroundImage()
  const avatarUrl = author.avatar || author.profileImageUrl || '/images/avatars/default.svg'

  // Mount detection
  useEffect(() => {
    setMounted(true)
    
    // Animate content in when active
    if (isActive) {
      const timer = setTimeout(() => setContentVisible(true), 300)
      return () => clearTimeout(timer)
    } else {
      setContentVisible(false)
    }
  }, [isActive])

  // Time calculation
  useEffect(() => {
    if (!mounted) return
    
    try {
      const timeString = typeof createdAt === 'string'
        ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
        : formatDistanceToNow(createdAt, { addSuffix: true })
      setRelativeTime(timeString)
    } catch (error) {
      console.warn('Time formatting error:', error)
      setRelativeTime('recently')
    }
  }, [mounted, createdAt])

  // Parallax scroll effect
  useEffect(() => {
    if (!bgRef.current || !panelRef.current) return

    const updateParallax = () => {
      const rect = panelRef.current?.getBoundingClientRect()
      if (!rect || !bgRef.current) return

      // Calculate parallax ratio based on viewport position
      const ratio = (rect.top) / window.innerHeight
      const parallaxOffset = -25 + (ratio * 15) // Slower movement for background
      
      bgRef.current.style.transform = `translateY(${parallaxOffset}%)`
    }

    // Throttled scroll handler
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)
    updateParallax() // Initial call

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Video controls
  useEffect(() => {
    if (videoRef.current && isActive) {
      if (isVideoPlaying) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isVideoPlaying, isActive])

  // Auto-play video when in view
  useEffect(() => {
    if (videoRef.current && isActive) {
      setIsVideoPlaying(true)
    } else {
      setIsVideoPlaying(false)
    }
  }, [isActive])

  // Handlers
  const handleLike = useCallback(async () => {
    if (!onLike) return
    
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
  }, [onLike, liked, likeCount, id])

  const handleSave = useCallback(async () => {
    if (!onSave) return
    
    try {
      await onSave(id)
      setSaved(!saved)
    } catch (error) {
      console.error('Save failed:', error)
    }
  }, [onSave, saved, id])

  const handleVideoToggle = () => {
    setIsVideoPlaying(!isVideoPlaying)
  }

  const handleMuteToggle = () => {
    setIsVideoMuted(!isVideoMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted
    }
  }

  const handleComment = async () => {
    if (!commentText.trim() || !onComment) return
    
    try {
      await onComment(id, commentText, false)
      setCommentText('')
      setShowComments(false)
    } catch (error) {
      console.error('Comment failed:', error)
    }
  }

  if (!mounted) {
    return <div className="h-screen bg-gray-900" />
  }

  return (
    <div
      ref={panelRef}
      className="post-panel relative h-screen w-full overflow-hidden snap-start"
      style={{ scrollSnapAlign: 'start' }}
    >
      {/* Parallax Background */}
      {backgroundImage ? (
        <div
          ref={bgRef}
          className="parallax-bg absolute inset-0 w-full h-[120%] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            willChange: 'transform'
          }}
        />
      ) : (
        <div
          ref={bgRef}
          className="parallax-bg absolute inset-0 w-full h-[120%]"
          style={{
            background: `linear-gradient(135deg, 
              hsl(${index * 137.5 % 360}, 70%, 20%) 0%, 
              hsl(${(index * 137.5 + 60) % 360}, 60%, 30%) 100%)`,
            willChange: 'transform'
          }}
        />
      )}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

      {/* Video Content */}
      {videos && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={videos.split(',')[0]?.trim()}
          muted={isVideoMuted}
          loop
          playsInline
        />
      )}

      {/* Main Content */}
      <div className="post-content relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-20">
        <div className={`max-w-4xl transition-all duration-1000 ease-out ${
          contentVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
        }`}>
          
          {/* Author Header */}
          <div className="flex items-center space-x-4 mb-6">
            {isAnonymous ? (
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
            ) : (
              <Link href={`/profile/${author.id}`}>
                <img 
                  src={avatarUrl}
                  alt={author.name}
                  className="w-14 h-14 rounded-full border-2 border-white/20 object-cover hover:border-white/40 transition-colors"
                />
              </Link>
            )}
            <div>
              <div className="flex items-center space-x-3">
                {isAnonymous ? (
                  <span className="text-white font-semibold text-lg">{author.name}</span>
                ) : (
                  <Link href={`/profile/${author.id}`} className="text-white font-semibold text-lg hover:text-white/80">
                    {author.name}
                  </Link>
                )}
                {type === 'article' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    <span className="mr-1">📝</span>
                    Article
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-white/70 text-sm">
                <span suppressHydrationWarning>{relativeTime}</span>
                {location && (
                  <>
                    <span>•</span>
                    <span>📍 {location}</span>
                  </>
                )}
                {feeling && (
                  <>
                    <span>•</span>
                    <span>😊 {feeling}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Title (for articles) */}
          {type === 'article' && title && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {title}
            </h1>
          )}

          {/* Content */}
          <div className="mb-6">
            {type === 'article' ? (
              <ArticleContent content={content} />
            ) : (
              <p className="text-white text-xl md:text-2xl leading-relaxed font-light">
                {content}
              </p>
            )}
          </div>

          {/* Spoke */}
          {spoke && (
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-500/30 text-green-200 border border-green-400/30">
                <span className="mr-2">🎯</span>
                <span className="font-semibold">{spoke}</span>
              </div>
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag, index) => (
                <span key={index} className="text-blue-300 text-lg hover:text-blue-200 cursor-pointer transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Controls */}
      {videos && (
        <div className="absolute top-6 right-6 z-20 flex space-x-3">
          <button
            onClick={handleVideoToggle}
            className="p-3 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
          >
            {isVideoPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
          </button>
          <button
            onClick={handleMuteToggle}
            className="p-3 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
          >
            {isVideoMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* Action Bar - Fixed Bottom */}
      <div className="actions absolute bottom-6 right-6 z-20 flex flex-col space-y-4">
        <button 
          onClick={handleLike}
          className={`p-4 rounded-full backdrop-blur-sm transition-all duration-200 ${
            liked 
              ? 'bg-red-500/30 text-red-300 border border-red-400/30' 
              : 'bg-black/30 text-white hover:bg-black/50'
          }`}
        >
          {liked ? (
            <HeartSolidIcon className="w-7 h-7" />
          ) : (
            <HeartIcon className="w-7 h-7" />
          )}
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="p-4 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
        >
          <ChatBubbleOvalLeftIcon className="w-7 h-7" />
        </button>
        
        <button 
          onClick={() => onShare?.(id)}
          className="p-4 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
        >
          <ShareIcon className="w-7 h-7" />
        </button>

        <button 
          onClick={handleSave}
          className={`p-4 rounded-full backdrop-blur-sm transition-all duration-200 ${
            saved 
              ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30' 
              : 'bg-black/30 text-white hover:bg-black/50'
          }`}
        >
          {saved ? (
            <BookmarkSolidIcon className="w-7 h-7" />
          ) : (
            <BookmarkIcon className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* Like Count */}
      {likeCount > 0 && (
        <div className="absolute bottom-6 left-6 z-20">
          <div className="px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm text-white">
            <span className="font-semibold">{likeCount.toLocaleString()} likes</span>
          </div>
        </div>
      )}

      {/* Comments Panel */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-black/80 backdrop-blur-sm p-6 max-h-[60vh] overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Comments ({comments.length})</h3>
              <button 
                onClick={() => setShowComments(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {/* Add Comment */}
            <div className="flex space-x-3 mb-6">
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
                  placeholder="Add a comment..."
                  className="flex-1 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && commentText.trim()) {
                      handleComment()
                    }
                  }}
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  className="px-6 py-3 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.slice(0, 5).map((comment: any) => (
                <div key={comment.id} className="flex space-x-3">
                  <img 
                    src={comment.user?.profileImageUrl || comment.user?.avatar || '/images/avatars/default.svg'}
                    alt={`${comment.user?.firstName || 'User'}'s avatar`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="font-medium text-white text-sm">
                      {comment.user?.firstName && comment.user?.lastName 
                        ? `${comment.user.firstName} ${comment.user.lastName}`.trim()
                        : comment.user?.firstName || 'User'}
                    </div>
                    <p className="text-white/90 text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {comments.length > 5 && (
                <button className="text-white/70 hover:text-white text-sm">
                  View all {comments.length} comments
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 