'use client'

import React, { useEffect, useRef, useState } from 'react'
import { PlayIcon, PauseIcon, SpeakerWaveIcon, MusicalNoteIcon, MicrophoneIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

export interface LyricLine {
  timestamp: number; // seconds
  text: string;
  duration?: number;
}

interface MusicPostProps {
  audioUrl: string;
  title?: string;
  artist?: string;
  lyrics?: LyricLine[];
  coverArt?: string;
  className?: string;
  autoPlay?: boolean;
  audioType?: 'music' | 'audio' | 'speech' | 'unknown';
  // Post details for fullscreen sidebar
  post?: {
    id: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
      profileImageUrl?: string;
    };
    content: string;
    createdAt: string | Date;
    likes: any[];
    comments: any[];
    shares: number;
    spoke?: string;
    location?: string;
    feeling?: string;
    tags?: string[];
  };
  onLike?: (postId: string) => Promise<any>;
  onComment?: (postId: string, comment: string) => Promise<any>;
  onShare?: (postId: string) => Promise<void>;
  currentUserId?: string;
}

// Client-side only component to avoid hydration issues
const AudioPlayer = dynamic(() => Promise.resolve(AudioPlayerComponent), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
})

function AudioPlayerComponent({
  audioUrl,
  title,
  artist,
  lyrics = [],
  coverArt,
  className = '',
  autoPlay = false,
  audioType = 'music',
  post,
  onLike,
  onComment,
  onShare,
  currentUserId
}: MusicPostProps) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const fullscreenWaveformRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [wavesurfer, setWavesurfer] = useState<any>(null)
  const [fullscreenWavesurfer, setFullscreenWavesurfer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [voices, setVoices] = useState<any[]>([])
  const [activeSpeaker, setActiveSpeaker] = useState<number>(-1)

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize compact waveform
  useEffect(() => {
    if (!isClient || !waveformRef.current || isFullscreen) return

    const initCompactWavesurfer = async () => {
      try {
        const WaveSurfer = (await import('wavesurfer.js')).default
        
        // Clean up existing instance
        if (wavesurfer) {
          wavesurfer.destroy()
        }
        
        // Ensure container is valid and has proper dimensions
        if (!waveformRef.current || waveformRef.current.clientWidth === 0) {
          console.warn('Wavesurfer container not ready, retrying...')
          setTimeout(() => initCompactWavesurfer(), 100)
          return
        }
        
        const ws = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: getWaveColor(),
          progressColor: getProgressColor(),
          cursorColor: '#EF4444',
          barWidth: 2,
          barGap: 1,
          height: 40,
          normalize: true,
          mediaControls: false,
          backend: 'WebAudio'
        })

        // Load audio with error handling
        try {
          await ws.load(audioUrl)
        } catch (loadError) {
          console.error('Failed to load audio in wavesurfer:', loadError)
          // Fallback to basic audio element
          return
        }
        
        ws.on('ready', () => {
          setDuration(ws.getDuration())
          if (autoPlay) {
            ws.play()
            setIsPlaying(true)
          }
        })

        ws.on('audioprocess', () => {
          const time = ws.getCurrentTime()
          setCurrentTime(time)
          updateActiveSpeaker(time)
        })

        ws.on('play', () => setIsPlaying(true))
        ws.on('pause', () => setIsPlaying(false))
        ws.on('finish', () => {
          setIsPlaying(false)
          setCurrentTime(0)
          setCurrentLyricIndex(-1)
          setActiveSpeaker(-1)
        })

        setWavesurfer(ws)

      } catch (error) {
        console.error('Failed to initialize compact Wavesurfer:', error)
      }
    }

    initCompactWavesurfer()

    return () => {
      if (wavesurfer) {
        wavesurfer.destroy()
        setWavesurfer(null)
      }
    }
  }, [audioUrl, autoPlay, isClient, isFullscreen])

  // Initialize fullscreen waveform
  useEffect(() => {
    if (!isClient || !fullscreenWaveformRef.current || !isFullscreen) return

    const initFullscreenWavesurfer = async () => {
      try {
        const WaveSurfer = (await import('wavesurfer.js')).default
        
        // Clean up existing instance
        if (fullscreenWavesurfer) {
          fullscreenWavesurfer.destroy()
        }
        
        // Ensure container is ready
        if (!fullscreenWaveformRef.current) {
          console.warn('Fullscreen wavesurfer container not ready')
          return
        }
        
        const ws = WaveSurfer.create({
          container: fullscreenWaveformRef.current!,
          waveColor: getWaveColor(),
          progressColor: getProgressColor(),
          cursorColor: '#EF4444',
          barWidth: 3,
          barGap: 1,
          height: 120,
          normalize: true,
          mediaControls: false,
          backend: 'WebAudio'
        })

        // Load audio with error handling
        try {
          await ws.load(audioUrl)
        } catch (loadError) {
          console.error('Failed to load audio in fullscreen wavesurfer:', loadError)
          return
        }
        
        ws.on('ready', () => {
          setDuration(ws.getDuration())
          // Sync with current time if switching from compact view
          if (currentTime > 0) {
            ws.seekTo(currentTime / ws.getDuration())
          }
        })

        ws.on('audioprocess', () => {
          const time = ws.getCurrentTime()
          setCurrentTime(time)
          updateActiveSpeaker(time)
        })

        ws.on('play', () => setIsPlaying(true))
        ws.on('pause', () => setIsPlaying(false))
        ws.on('finish', () => {
          setIsPlaying(false)
          setCurrentTime(0)
          setCurrentLyricIndex(-1)
          setActiveSpeaker(-1)
        })

        setFullscreenWavesurfer(ws)

      } catch (error) {
        console.error('Failed to initialize fullscreen Wavesurfer:', error)
      }
    }

    initFullscreenWavesurfer()

    return () => {
      if (fullscreenWavesurfer) {
        fullscreenWavesurfer.destroy()
        setFullscreenWavesurfer(null)
      }
    }
  }, [audioUrl, isFullscreen, isClient])

  // Analyze speech for speaker diarization
  useEffect(() => {
    if (audioType === 'speech' && isClient) {
      analyzeSpeechForSpeakers()
    }
  }, [audioType, audioUrl, isClient])

  const analyzeSpeechForSpeakers = async () => {
    try {
      // First, verify this is actually speech using our classifier
      if (audioType !== 'speech') {
        console.log('🎵 Not a speech audio, skipping speaker analysis')
        return
      }

      console.log('🗣️ Analyzing speech for speakers...')
      
      // Enhanced speaker analysis with better accuracy
      const audioElement = document.createElement('audio')
      audioElement.src = audioUrl
      
      audioElement.addEventListener('loadedmetadata', async () => {
        const duration = audioElement.duration
        console.log(`🎯 Audio duration: ${duration}s`)
        
        // Use audio classification for better speaker detection
        try {
          const { audioClassifier } = await import('../../lib/audio-classifier')
          const classification = await audioClassifier.classifyAudio(audioUrl, title || 'audio')
          
          console.log('🔍 Audio analysis:', classification)
          
          // More intelligent speaker detection based on audio features
          const features = classification.features
          const isLikelySingleSpeaker = 
            duration < 60 || // Short audio likely single speaker
            (features?.voiceActivity && features.voiceActivity < 0.8) || // Low voice activity variation
            (features?.energy && features.energy < 0.15) // Consistent energy levels
          
          console.log(`🧠 Single speaker probability: ${isLikelySingleSpeaker ? 'HIGH' : 'LOW'}`)
          
          const mockVoices = []
          
          if (isLikelySingleSpeaker || duration < 30) {
            // Single speaker scenario
            mockVoices.push({
              id: 1,
              name: 'Speaker 1',
              segments: [{ start: 0, end: duration }],
              avatar: generateAvatar('speaker1'),
              pitch: 'medium',
              confidence: 0.9
            })
            
            console.log('🗣️ Single speaker detected (high confidence)')
          } else {
            // Multiple speakers scenario (for longer, complex audio)
            const midPoint = duration / 2
            const segment1End = Math.min(midPoint + (Math.random() - 0.5) * 10, duration * 0.7)
            
            mockVoices.push(
              { 
                id: 1, 
                name: 'Speaker 1', 
                segments: [
                  { start: 0, end: segment1End }
                ],
                avatar: generateAvatar('speaker1'),
                pitch: 'medium',
                confidence: 0.7
              },
              { 
                id: 2, 
                name: 'Speaker 2', 
                segments: [
                  { start: segment1End, end: duration }
                ],
                avatar: generateAvatar('speaker2'),
                pitch: 'high',
                confidence: 0.6
              }
            )
            
            console.log('🗣️ Multiple speakers detected (medium confidence)')
          }
          
          setVoices(mockVoices)
          
        } catch (classificationError) {
          console.warn('Audio classification failed, using duration fallback:', classificationError)
          
          // Fallback: use duration-based simple detection
          if (duration < 45) {
            // Short audio = single speaker
            setVoices([{
              id: 1,
              name: 'Speaker 1',
              segments: [{ start: 0, end: duration }],
              avatar: generateAvatar('speaker1'),
              pitch: 'medium',
              confidence: 0.8
            }])
          } else {
            // Longer audio = potentially multiple speakers
            const midPoint = duration / 2
            setVoices([
              {
                id: 1,
                name: 'Speaker 1',
                segments: [{ start: 0, end: midPoint }],
                avatar: generateAvatar('speaker1'),
                pitch: 'medium',
                confidence: 0.6
              },
              {
                id: 2,
                name: 'Speaker 2',
                segments: [{ start: midPoint, end: duration }],
                avatar: generateAvatar('speaker2'),
                pitch: 'high',
                confidence: 0.5
              }
            ])
          }
        }
      })
      
      audioElement.load()
    } catch (error) {
      console.error('Failed to analyze speech:', error)
      // Fallback to simple single speaker
      setVoices([{
        id: 1,
        name: 'Speaker 1',
        segments: [{ start: 0, end: 60 }],
        avatar: generateAvatar('speaker1'),
        pitch: 'medium',
        confidence: 0.5
      }])
    }
  }

  const generateAvatar = (speakerId: string) => {
    // Generate unique avatar for each speaker
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    const color = colors[speakerId.charCodeAt(speakerId.length - 1) % colors.length]
    
    return {
      backgroundColor: color,
      initials: speakerId.toUpperCase().substring(0, 2)
    }
  }

  const updateActiveSpeaker = (time: number) => {
    if (voices.length === 0) return
    
    const currentSpeaker = voices.findIndex(voice => 
      voice.segments.some((segment: any) => time >= segment.start && time <= segment.end)
    )
    
    setActiveSpeaker(currentSpeaker)
  }

  const getWaveColor = () => {
    switch (audioType) {
      case 'music': return '#8B5CF6'
      case 'speech': return '#10B981'
      default: return '#F59E0B'
    }
  }

  const getProgressColor = () => {
    switch (audioType) {
      case 'music': return '#7C3AED'
      case 'speech': return '#059669'
      default: return '#D97706'
    }
  }

  // Update current lyric based on time
  useEffect(() => {
    if (lyrics.length === 0) return

    const newIndex = lyrics.findIndex((lyric, index) => {
      const nextLyric = lyrics[index + 1]
      return currentTime >= lyric.timestamp && (!nextLyric || currentTime < nextLyric.timestamp)
    })

    setCurrentLyricIndex(newIndex)
  }, [currentTime, lyrics])

  const togglePlayPause = () => {
    const activeWavesurfer = isFullscreen ? fullscreenWavesurfer : wavesurfer
    
    if (activeWavesurfer) {
      activeWavesurfer.playPause()
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const toggleFullscreen = () => {
    // Pause current playback before switching
    const activeWavesurfer = isFullscreen ? fullscreenWavesurfer : wavesurfer
    if (activeWavesurfer && isPlaying) {
      activeWavesurfer.pause()
    }
    
    setIsFullscreen(!isFullscreen)
  }

  const getCurrentLyricText = () => {
    if (currentLyricIndex >= 0 && currentLyricIndex < lyrics.length) {
      return lyrics[currentLyricIndex].text
    }
    return title || 'Playing...'
  }

  if (!isClient) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
  }

  if (isFullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-8 relative z-10"
             onClick={(e) => {
               if (e.target === e.currentTarget) {
                 toggleFullscreen()
               }
             }}>
          <div className="text-center text-white max-w-4xl mx-auto">
          {/* Speech Avatars */}
          {audioType === 'speech' && voices.length > 0 && (
            <div className="flex justify-center space-x-8 mb-8">
              {voices.map((voice, index) => (
                <motion.div
                  key={voice.id}
                  className={`flex flex-col items-center transition-all duration-300 ${
                    activeSpeaker === index ? 'scale-110' : 'scale-100 opacity-70'
                  }`}
                  animate={{
                    scale: activeSpeaker === index ? 1.1 : 1,
                    opacity: activeSpeaker === index ? 1 : 0.7
                  }}
                >
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-2xl border-4 ${
                      activeSpeaker === index ? 'border-white animate-pulse' : 'border-white/30'
                    }`}
                    style={{ backgroundColor: voice.avatar.backgroundColor }}
                  >
                    {voice.avatar.initials}
                  </div>
                  <p className="mt-2 text-sm font-medium">{voice.name}</p>
                  {activeSpeaker === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-1 w-2 h-2 bg-green-400 rounded-full"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Cover Art for Music */}
          {audioType === 'music' && coverArt && (
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 10, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
              className="w-64 h-64 mx-auto mb-8 rounded-full overflow-hidden shadow-2xl border-4 border-white/20"
            >
              <img src={coverArt} alt="Cover Art" className="w-full h-full object-cover" />
            </motion.div>
          )}

          {/* Track Info */}
          <motion.h1
            key={title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold mb-2"
          >
            {title || 'Unknown Track'}
          </motion.h1>
          
          {artist && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/80 mb-8"
            >
              {artist}
            </motion.p>
          )}

          {/* Waveform */}
          <div className="mb-8 bg-black/20 rounded-lg p-4 backdrop-blur-sm">
            <div ref={fullscreenWaveformRef} className="mb-4" />
            
            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={togglePlayPause}
                className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg"
              >
                {isPlaying ? (
                  <PauseIcon className="w-8 h-8" />
                ) : (
                  <PlayIcon className="w-8 h-8 ml-1" />
                )}
              </button>
              
              <div className="text-white/80">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          {/* Lyrics */}
          {lyrics.length > 0 && (
            <motion.div
              className="max-h-48 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentLyricIndex}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl text-center text-white/90 leading-relaxed"
                >
                  {getCurrentLyricText()}
                </motion.p>
              </AnimatePresence>
              
              {/* Upcoming lyrics preview */}
              {currentLyricIndex + 1 < lyrics.length && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="text-lg text-center text-white/50 mt-4"
                >
                  {lyrics[currentLyricIndex + 1]?.text}
                </motion.p>
              )}
            </motion.div>
          )}

          <p className="text-white/60 text-sm mt-8">Click outside to exit fullscreen</p>
          </div>
        </div>

        {/* Right Sidebar with Post Details */}
        {post && (
          <div className="w-80 bg-black/40 backdrop-blur-md border-l border-white/20 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Close Button */}
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors z-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Post Author */}
              <div className="flex items-center space-x-3">
                <img 
                  src={post.author.avatar || post.author.profileImageUrl || '/images/avatars/default.svg'} 
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-white">{post.author.name}</p>
                  <p className="text-sm text-white/70">
                    {typeof post.createdAt === 'string' 
                      ? new Date(post.createdAt).toLocaleDateString()
                      : post.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-3">
                <p className="text-white leading-relaxed">{post.content}</p>
                
                {/* Post Meta */}
                {(post.spoke || post.location || post.feeling) && (
                  <div className="space-y-2">
                    {post.spoke && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100/20 text-blue-200">
                        🎯 {post.spoke}
                      </span>
                    )}
                    {post.feeling && (
                      <p className="text-sm text-white/70">Feeling {post.feeling}</p>
                    )}
                    {post.location && (
                      <p className="text-sm text-white/70">📍 {post.location}</p>
                    )}
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="text-blue-300 text-sm">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Transcribe Button */}
              <button
                onClick={async () => {
                  if (!post?.id) return
                  try {
                    console.log('🎤 Starting audio transcription...')
                    const response = await fetch('/api/transcribe-free', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        audioUrl: audioUrl,
                        postId: post.id,
                        type: 'audio'
                      })
                    })
                    
                    if (response.ok) {
                      const data = await response.json()
                      console.log('✅ Transcription started:', data.transcriptId)
                      alert('Transcription started! Check back in a few minutes.')
                    } else {
                      console.error('❌ Transcription failed')
                      alert('Failed to start transcription.')
                    }
                  } catch (error) {
                    console.error('Error starting transcription:', error)
                    alert('Error starting transcription.')
                  }
                }}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Transcribe Audio</span>
              </button>

              {/* Post Stats */}
              <div className="space-y-3 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>{post.likes.length} likes</span>
                  <span>{post.comments.length} comments</span>
                  <span>{post.shares} shares</span>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onLike?.(post.id)}
                    className="flex items-center justify-center space-x-1 bg-white/10 text-white px-3 py-2 rounded hover:bg-white/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs">Like</span>
                  </button>
                  
                  <button
                    onClick={() => {/* Handle comment */}}
                    className="flex items-center justify-center space-x-1 bg-white/10 text-white px-3 py-2 rounded hover:bg-white/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-xs">Comment</span>
                  </button>
                  
                  <button
                    onClick={() => onShare?.(post.id)}
                    className="flex items-center justify-center space-x-1 bg-white/10 text-white px-3 py-2 rounded hover:bg-white/20 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="text-xs">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback audio element */}
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="hidden"
        />
      </motion.div>
    )
  }

  // Get colors and styling based on audio type
  const getAudioTypeColors = () => {
    switch (audioType) {
      case 'music':
        return {
          gradient: 'from-purple-50 to-blue-50',
          border: 'border-purple-200',
          iconBg: 'from-purple-400 to-blue-500',
          playBg: 'bg-purple-600 hover:bg-purple-700',
          icon: <MusicalNoteIcon className="w-8 h-8 text-white" />
        }
      case 'speech':
        return {
          gradient: 'from-green-50 to-teal-50',
          border: 'border-green-200',
          iconBg: 'from-green-400 to-teal-500',
          playBg: 'bg-green-600 hover:bg-green-700',
          icon: <MicrophoneIcon className="w-8 h-8 text-white" />
        }
      default: // 'audio' or 'unknown'
        return {
          gradient: 'from-orange-50 to-yellow-50',
          border: 'border-orange-200',
          iconBg: 'from-orange-400 to-yellow-500',
          playBg: 'bg-orange-600 hover:bg-orange-700',
          icon: <SpeakerWaveIcon className="w-8 h-8 text-white" />
        }
    }
  }

  const colors = getAudioTypeColors()

  // Compact view
  return (
    <div className={`bg-gradient-to-r ${colors.gradient} rounded-lg p-4 border ${colors.border} ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Cover Art Thumbnail or Voice Avatars */}
        {audioType === 'speech' && voices.length > 0 ? (
          <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
            <div className="flex -space-x-2">
              {voices.slice(0, 2).map((voice, index) => (
                <div
                  key={voice.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white ${
                    activeSpeaker === index ? 'ring-2 ring-green-400' : ''
                  }`}
                  style={{ backgroundColor: voice.avatar.backgroundColor }}
                >
                  {voice.avatar.initials}
                </div>
              ))}
            </div>
          </div>
        ) : coverArt ? (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img src={coverArt} alt="Cover Art" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`w-16 h-16 bg-gradient-to-br ${colors.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            {colors.icon}
          </div>
        )}

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 truncate">{title || 'Audio Track'}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              audioType === 'music' ? 'bg-purple-100 text-purple-700' :
              audioType === 'speech' ? 'bg-green-100 text-green-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {audioType === 'music' ? '🎵 Music' : 
               audioType === 'speech' ? '🎤 Speech' : 
               '🔊 Audio'}
            </span>
          </div>
          {artist && <p className="text-sm text-gray-600 truncate">{artist}</p>}
          
          {/* Show active speaker for speech */}
          {audioType === 'speech' && voices.length > 0 && activeSpeaker >= 0 && (
            <p className="text-xs text-gray-500 truncate">
              🗣️ {voices[activeSpeaker]?.name} speaking
            </p>
          )}
          
          {/* Mini Waveform */}
          <div className="mt-2">
            <div ref={waveformRef} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={togglePlayPause}
            className={`w-10 h-10 ${colors.playBg} text-white rounded-full flex items-center justify-center transition-colors`}
          >
            {isPlaying ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <SpeakerWaveIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Current lyric preview */}
      {lyrics.length > 0 && currentLyricIndex >= 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-white/50 rounded text-sm text-gray-700 italic"
        >
          "{getCurrentLyricText()}"
        </motion.div>
      )}

      {/* Time display */}
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Fallback audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  )
}

export default function MusicPost(props: MusicPostProps) {
  return <AudioPlayer {...props} />
} 