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
  UserIcon,
  XMarkIcon,
  DocumentIcon,
  LanguageIcon
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

interface FullScreenModalProps {
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
  onClose: () => void
  currentUserId?: string
}

interface TranscriptSegment {
  start: number
  end: number
  text: string
}

interface Transcript {
  id: string
  postId: string
  status: 'processing' | 'completed' | 'failed'
  segments?: TranscriptSegment[]
  fullText?: string
  duration?: number
  language?: string
}

// Article content parser
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
            className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
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
                className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                dangerouslySetInnerHTML={{ __html: beforeContent }}
              />
            )
          }
        }
        
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
      
      if (lastIndex < fullContent.length) {
        const afterContent = fullContent.substring(lastIndex)
        if (afterContent.trim()) {
          components.push(
            <div 
              key="content-final"
              className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
              dangerouslySetInnerHTML={{ __html: afterContent }}
            />
          )
        }
      }
      
      setParsedContent(<div className="space-y-4">{components}</div>)
      
    } catch (error) {
      console.warn('Failed to parse article content:', error)
      setParsedContent(
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-500 italic">Error loading article content</p>
        </div>
      )
    }
  }, [mounted, content])

  if (!mounted) {
    return (
      <div 
        className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return parsedContent
}

export default function FullScreenModal({
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
  onSave,
  onClose,
  currentUserId
}: FullScreenModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  
  // State management
  const [liked, setLiked] = useState(isLikedByCurrentUser)
  const [likeCount, setLikeCount] = useState(likes.length)
  const [saved, setSaved] = useState(isSaved)
  const [commentText, setCommentText] = useState('')
  const [mounted, setMounted] = useState(false)
  const [relativeTime, setRelativeTime] = useState('')
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(true)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)

  // Get primary media - Priority: Video > Image > Audio > Document > Activities > Tools > Games
  const primaryImage = images ? images.split(',')[0]?.trim() : null
  const primaryVideo = videos ? videos.split(',')[0]?.trim() : null
  const primaryAudio = audios ? audios.split(',')[0]?.trim() : null
  const primaryDocument = documents ? documents.split(',')[0]?.trim() : null
  const primaryActivity = activities ? activities.split(',')[0]?.trim() : null
  const primaryTool = tools ? tools.split(',')[0]?.trim() : null
  const primaryGame = games ? games.split(',')[0]?.trim() : null
  
  const avatarUrl = author.avatar || author.profileImageUrl || '/images/avatars/default.svg'

  // Mount detection and time calculation
  useEffect(() => {
    setMounted(true)
    
    try {
      const timeString = typeof createdAt === 'string'
        ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
        : formatDistanceToNow(createdAt, { addSuffix: true })
      setRelativeTime(timeString)
    } catch (error) {
      console.warn('Time formatting error:', error)
      setRelativeTime('recently')
    }
  }, [createdAt])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden' // Prevent background scrolling

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

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

  const handleComment = async () => {
    if (!commentText.trim() || !onComment) return
    
    try {
      await onComment(id, commentText, false)
      setCommentText('')
    } catch (error) {
      console.error('Comment failed:', error)
    }
  }

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted
      setIsVideoMuted(!isVideoMuted)
    }
  }

  const handleAudioToggle = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsAudioPlaying(!isAudioPlaying)
    }
  }

  const handleTranscribe = async () => {
    if (isTranscribing || showTranscript) {
      // If already showing transcript, hide it
      setShowTranscript(false)
      return
    }
    
    const mediaUrl = primaryVideo || primaryAudio
    if (!mediaUrl) return

    setIsTranscribing(true)
    setShowTranscript(true)

    try {
      console.log(`🎧 Fetching transcript for: ${mediaUrl}`)
      
      // Check for existing pre-generated transcript
      const response = await fetch(`/api/transcribe?videoUrl=${encodeURIComponent(mediaUrl)}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.transcript) {
          setTranscript(data.transcript)
          setIsTranscribing(false)
          
          if (data.transcript.status === 'completed') {
            console.log('✅ Found existing transcript')
          } else if (data.transcript.status === 'processing') {
            console.log('⏳ Transcript is still processing, polling for completion...')
            
            // Poll for completion if still processing
            const pollInterval = setInterval(async () => {
              try {
                const pollResponse = await fetch(`/api/transcribe?videoUrl=${encodeURIComponent(mediaUrl)}`)
                if (pollResponse.ok) {
                  const pollData = await pollResponse.json()
                  if (pollData.transcript.status === 'completed') {
                    setTranscript(pollData.transcript)
                    setIsTranscribing(false)
                    clearInterval(pollInterval)
                    console.log('✅ Transcript completed via polling')
                  } else if (pollData.transcript.status === 'failed') {
                    setIsTranscribing(false)
                    clearInterval(pollInterval)
                    console.log('❌ Transcript generation failed')
                  }
                }
              } catch (error) {
                console.error('Polling error:', error)
                clearInterval(pollInterval)
                setIsTranscribing(false)
              }
            }, 3000)

            // Stop polling after 5 minutes
            setTimeout(() => {
              clearInterval(pollInterval)
              setIsTranscribing(false)
            }, 300000)
          }
          return
        }
      }

      console.log('🔄 No existing transcript found, generating new one...')
      
      // If no transcript found, try to generate one manually
      const generateResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId: id,
          videoUrl: mediaUrl,
          userId: currentUserId,
          manualRequest: true
        })
      })

      if (generateResponse.ok) {
        const generateData = await generateResponse.json()
        setTranscript(generateData.transcript)
        console.log('🎯 Started new transcription process')
        
        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            const pollResponse = await fetch(`/api/transcribe?videoUrl=${encodeURIComponent(mediaUrl)}`)
            if (pollResponse.ok) {
              const pollData = await pollResponse.json()
              if (pollData.transcript.status === 'completed') {
                setTranscript(pollData.transcript)
                setIsTranscribing(false)
                clearInterval(pollInterval)
                console.log('✅ Manual transcription completed')
              } else if (pollData.transcript.status === 'failed') {
                setIsTranscribing(false)
                clearInterval(pollInterval)
                console.log('❌ Manual transcription failed')
              }
            }
          } catch (error) {
            console.error('Polling error:', error)
            clearInterval(pollInterval)
            setIsTranscribing(false)
          }
        }, 3000)

        setTimeout(() => {
          clearInterval(pollInterval)
          setIsTranscribing(false)
        }, 300000)
      } else {
        const errorData = await generateResponse.json()
        console.error('Failed to start transcription:', errorData)
        setIsTranscribing(false)
        setTranscript(null)
      }
      
    } catch (error) {
      console.error('Transcription fetch failed:', error)
      setIsTranscribing(false)
      setTranscript(null)
    }
  }

  const handleDocumentClick = () => {
    if (primaryDocument) {
      window.open(primaryDocument, '_blank')
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-75"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Section - Media Area */}
        <div className="flex-1 bg-black flex items-center justify-center relative min-h-[50vh] md:min-h-0">
          {/* Close Button - Moved to Top Left */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Media Content */}
          {primaryVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                className="max-w-full max-h-full object-contain"
                src={primaryVideo}
                muted={isVideoMuted}
                autoPlay={true}
                loop={true}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onLoadedData={() => {
                  // Auto-play when video is loaded
                  if (videoRef.current) {
                    videoRef.current.play().catch(error => {
                      console.log('Auto-play prevented:', error)
                    })
                  }
                }}
                controls={false}
              />
              
              {/* Video Controls */}
              <div className="absolute bottom-4 left-4 flex space-x-3">
                <button
                  onClick={handleVideoToggle}
                  className="p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors"
                >
                  {isVideoPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                </button>
                <button
                  onClick={handleMuteToggle}
                  className="p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors"
                >
                  {isVideoMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
                </button>
              </div>
            </div>
          ) : primaryImage ? (
            <img 
              src={primaryImage}
              alt="Post content"
              className="max-w-full max-h-full object-contain"
            />
          ) : primaryAudio ? (
            <div className="text-center p-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <SpeakerWaveIcon className="w-16 h-16 text-white" />
              </div>
              <audio
                ref={audioRef}
                className="w-full max-w-md"
                src={primaryAudio}
                controls
                onPlay={() => setIsAudioPlaying(true)}
                onPause={() => setIsAudioPlaying(false)}
              />
            </div>
          ) : primaryDocument ? (
            <div className="w-full h-full flex flex-col">
              {(() => {
                const fileName = primaryDocument.split('/').pop() || 'Document'
                const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
                
                if (fileExtension === 'pdf') {
                  return (
                    <iframe
                      src={primaryDocument}
                      className="w-full h-full border-0"
                      title="PDF Document"
                    />
                  )
                } else if (['txt', 'md'].includes(fileExtension)) {
                  return (
                    <div className="w-full h-full overflow-auto p-8 bg-white">
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{fileName}</h3>
                        <iframe
                          src={primaryDocument}
                          className="w-full h-96 border border-gray-300 rounded"
                          title="Text Document"
                        />
                        <div className="mt-4 flex justify-center">
                          <a
                            href={primaryDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Open in New Tab
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                          <DocumentIcon className="w-16 h-16 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{fileName}</h3>
                        <p className="text-gray-300 mb-6">File type: {fileExtension.toUpperCase()}</p>
                        <div className="space-y-3">
                          <a
                            href={primaryDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Open Document
                          </a>
                          <a
                            href={primaryDocument}
                            download
                            className="block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                }
              })()}
            </div>
          ) : primaryActivity ? (
            <div className="text-center p-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center">
                <span className="text-5xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Activity</h3>
              <p className="text-gray-300">Interactive activity content</p>
            </div>
          ) : primaryTool ? (
            <div className="text-center p-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-600 to-red-700 rounded-full flex items-center justify-center">
                <span className="text-5xl">🛠️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Tool</h3>
              <p className="text-gray-300">Productivity tool content</p>
            </div>
          ) : primaryGame ? (
            <div className="text-center p-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full flex items-center justify-center">
                <span className="text-5xl">🎮</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Game</h3>
              <p className="text-gray-300">Interactive game content</p>
            </div>
          ) : (
            <div className="text-center p-8 text-white">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <UserIcon className="w-16 h-16" />
              </div>
              <p className="text-xl">Text Post</p>
            </div>
          )}
        </div>

        {/* Right Section - Info and Interactions */}
        <div className="w-full md:w-96 bg-white flex flex-col md:max-h-full">
          {/* Post Header */}
          <div className="p-3 md:p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3 mb-3">
              {isAnonymous ? (
                <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-5 md:w-6 h-5 md:h-6 text-gray-600" />
                </div>
              ) : (
                <Link href={`/profile/${author.id}`}>
                  <img 
                    src={avatarUrl}
                    alt={author.name}
                    className="w-10 md:w-12 h-10 md:h-12 rounded-full object-cover hover:opacity-80 transition-opacity"
                  />
                </Link>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  {isAnonymous ? (
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{author.name}</span>
                  ) : (
                    <Link href={`/profile/${author.id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-sm md:text-base">
                      {author.name}
                    </Link>
                  )}
                  {type === 'article' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      📝 Article
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-gray-500 text-xs md:text-sm">
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
              <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                {title}
              </h1>
            )}

            {/* Content */}
            <div className="mb-3">
              {type === 'article' ? (
                <ArticleContent content={content} />
              ) : (
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {content}
                </p>
              )}
            </div>

            {/* Spoke */}
            {spoke && (
              <div className="mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  🎯 {spoke}
                </span>
              </div>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span key={index} className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-3 md:p-4 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-colors text-sm ${
                    liked 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {liked ? (
                    <HeartSolidIcon className="w-4 md:w-5 h-4 md:h-5" />
                  ) : (
                    <HeartIcon className="w-4 md:w-5 h-4 md:h-5" />
                  )}
                  <span className="font-medium">{likeCount}</span>
                </button>
                
                <button 
                  onClick={() => onShare?.(id)}
                  className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors text-sm"
                >
                  <ShareIcon className="w-4 md:w-5 h-4 md:h-5" />
                  <span className="font-medium">Share</span>
                </button>

                <button 
                  onClick={handleSave}
                  className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-colors text-sm ${
                    saved 
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {saved ? (
                    <BookmarkSolidIcon className="w-4 md:w-5 h-4 md:h-5" />
                  ) : (
                    <BookmarkIcon className="w-4 md:w-5 h-4 md:h-5" />
                  )}
                  <span className="font-medium">Save</span>
                </button>
              </div>

              {/* Transcribe Button */}
              {(primaryVideo || primaryAudio) && (
                <button 
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                  className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-colors disabled:opacity-50 text-sm ${
                    showTranscript 
                      ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' 
                      : 'hover:bg-purple-50 text-purple-600'
                  }`}
                >
                  <LanguageIcon className="w-4 md:w-5 h-4 md:h-5" />
                  <span className="font-medium">
                    {isTranscribing ? 'Loading...' : showTranscript ? 'Hide' : 'Transcript'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Transcript Section - Hidden when transcript is shown */}
          {!showTranscript && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Comments ({comments.length})</h3>
              </div>
              
              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No comments yet</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="flex space-x-3">
                      <img 
                        src={comment.user?.profileImageUrl || comment.user?.avatar || '/images/avatars/default.svg'}
                        alt={`${comment.user?.firstName || 'User'}'s avatar`}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="font-medium text-gray-900 text-sm">
                          {comment.user?.firstName && comment.user?.lastName 
                            ? `${comment.user.firstName} ${comment.user.lastName}`.trim()
                            : comment.user?.firstName || 'User'}
                        </div>
                        <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <img 
                    src={avatarUrl}
                    alt="Your avatar"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && commentText.trim()) {
                          handleComment()
                        }
                      }}
                    />
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transcript Full View - When transcript is shown */}
          {showTranscript && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Transcript</h3>
                <button
                  onClick={() => setShowTranscript(false)}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {isTranscribing ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading transcript...</p>
                  </div>
                ) : transcript?.fullText ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {transcript.fullText}
                    </p>
                    {transcript.language && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-500">
                          Language: {transcript.language}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No transcript available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 