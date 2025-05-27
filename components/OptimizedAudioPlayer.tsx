'use client'

import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { PlayIcon, PauseIcon, SpeakerWaveIcon, MicrophoneIcon } from '@heroicons/react/24/outline'

interface OptimizedAudioPlayerProps {
  audioUrl: string
  title?: string
  artist?: string
  className?: string
  autoPlay?: boolean
  audioType?: 'music' | 'speech' | 'audio'
  showWaveform?: boolean
  compact?: boolean
}

const OptimizedAudioPlayer = memo(function OptimizedAudioPlayer({
  audioUrl,
  title,
  artist,
  className = '',
  autoPlay = false,
  audioType = 'audio',
  showWaveform = false,
  compact = true
}: OptimizedAudioPlayerProps) {
  // State management
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [waveformReady, setWaveformReady] = useState(false)

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<any>(null)
  const isInitializingRef = useRef(false)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.destroy()
      } catch (e) {
        console.warn('Error destroying wavesurfer:', e)
      }
      wavesurferRef.current = null
    }
    setWaveformReady(false)
    isInitializingRef.current = false
  }, [])

  // Initialize WaveSurfer (lazy loaded)
  const initializeWaveform = useCallback(async () => {
    if (!showWaveform || !waveformRef.current || isInitializingRef.current || wavesurferRef.current) {
      return
    }

    isInitializingRef.current = true
    setLoading(true)

    try {
      // Dynamic import for better code splitting
      const WaveSurfer = (await import('wavesurfer.js')).default

      // Ensure container is ready
      if (!waveformRef.current || waveformRef.current.clientWidth === 0) {
        // Wait for container to be ready
        await new Promise(resolve => setTimeout(resolve, 100))
        if (!waveformRef.current) {
          throw new Error('Waveform container not available')
        }
      }

      // Clean up any existing instance
      cleanup()

      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: audioType === 'music' ? '#3B82F6' : audioType === 'speech' ? '#10B981' : '#6B7280',
        progressColor: audioType === 'music' ? '#1D4ED8' : audioType === 'speech' ? '#059669' : '#374151',
        cursorColor: '#EF4444',
        barWidth: compact ? 2 : 3,
        barGap: 1,
        height: compact ? 40 : 60,
        normalize: true,
        mediaControls: false,
        backend: 'WebAudio'
      })

      // Set up event listeners
      ws.on('ready', () => {
        setDuration(ws.getDuration())
        setWaveformReady(true)
        setLoading(false)
        isInitializingRef.current = false

        if (autoPlay && !isPlaying) {
          ws.play()
          setIsPlaying(true)
        }
      })

      ws.on('audioprocess', () => {
        const time = ws.getCurrentTime()
        setCurrentTime(time)
      })

      ws.on('play', () => setIsPlaying(true))
      ws.on('pause', () => setIsPlaying(false))
      ws.on('finish', () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })

      ws.on('error', (error: any) => {
        console.error('WaveSurfer error:', error)
        setError('Failed to load audio waveform')
        setLoading(false)
        isInitializingRef.current = false
      })

      // Load audio with timeout
      const loadTimeout = setTimeout(() => {
        setError('Audio loading timeout')
        setLoading(false)
        isInitializingRef.current = false
      }, 15000)

      try {
        await ws.load(audioUrl)
        clearTimeout(loadTimeout)
      } catch (loadError) {
        clearTimeout(loadTimeout)
        throw loadError
      }

      wavesurferRef.current = ws

    } catch (initError) {
      console.error('Failed to initialize WaveSurfer:', initError)
      setError('Failed to initialize audio player')
      setLoading(false)
      isInitializingRef.current = false
    }
  }, [audioUrl, showWaveform, compact, audioType, autoPlay, isPlaying, cleanup])

  // Basic audio player controls (fallback)
  const togglePlayback = useCallback(() => {
    if (wavesurferRef.current && waveformReady) {
      // Use WaveSurfer
      if (isPlaying) {
        wavesurferRef.current.pause()
      } else {
        wavesurferRef.current.play()
      }
    } else if (audioRef.current) {
      // Use HTML5 audio
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }, [isPlaying, waveformReady])

  // Handle basic audio events (fallback)
  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }, [])

  const handleAudioLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }, [])

  const handleAudioPlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handleAudioPause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  // Seek functionality
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return

    const rect = progressBarRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const seekTime = percent * duration

    if (wavesurferRef.current && waveformReady) {
      wavesurferRef.current.seekTo(percent)
    } else if (audioRef.current) {
      audioRef.current.currentTime = seekTime
    }
  }, [duration, waveformReady])

  // Initialize waveform when component becomes visible
  useEffect(() => {
    if (showWaveform) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            initializeWaveform()
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )

      if (waveformRef.current) {
        observer.observe(waveformRef.current)
      }

      return () => observer.disconnect()
    }
  }, [showWaveform, initializeWaveform])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get audio type icon
  const getAudioIcon = () => {
    switch (audioType) {
      case 'music':
        return <SpeakerWaveIcon className="h-5 w-5" />
      case 'speech':
        return <MicrophoneIcon className="h-5 w-5" />
      default:
        return <SpeakerWaveIcon className="h-5 w-5" />
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Audio metadata */}
      {(title || artist) && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 text-gray-400">
              {getAudioIcon()}
            </div>
            <div className="min-w-0 flex-1">
              {title && (
                <p className="text-sm font-medium text-gray-900 truncate">
                  {title}
                </p>
              )}
              {artist && (
                <p className="text-xs text-gray-500 truncate">
                  {artist}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Waveform or basic player */}
      <div className="p-3">
        {showWaveform ? (
          <div>
            {/* Waveform container */}
            <div
              ref={waveformRef}
              className={`w-full ${loading ? 'opacity-50' : ''}`}
              style={{ minHeight: compact ? '40px' : '60px' }}
            />
            
            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-sm text-gray-500">Loading waveform...</span>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-center py-4">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    initializeWaveform()
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Basic progress bar */
          <div>
            <div
              ref={progressBarRef}
              className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-100"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlayback}
              className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4 ml-0.5" />
              )}
            </button>
            
            <div className="text-xs text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="text-xs text-gray-400 capitalize">
            {audioType}
          </div>
        </div>
      </div>

      {/* Hidden HTML5 audio element (fallback) */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onEnded={handleAudioEnded}
        preload="metadata"
      />
    </div>
  )
})

export default OptimizedAudioPlayer 