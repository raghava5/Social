'use client'

import { useState, useEffect, useRef } from 'react'
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface TranscriptSegment {
  start: number
  end: number
  text: string
}

interface Transcript {
  id: string
  postId: string
  status: 'processing' | 'completed' | 'failed'
  segments: TranscriptSegment[]
  fullText: string
  duration: number
  language: string
}

interface VideoTranscriptProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  currentTime: number
  onSeek: (time: number) => void
}

export default function VideoTranscript({
  isOpen,
  onClose,
  postId,
  currentTime,
  onSeek
}: VideoTranscriptProps) {
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSegments, setFilteredSegments] = useState<TranscriptSegment[]>([])
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1)
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)
  
  const transcriptRef = useRef<HTMLDivElement>(null)
  const activeSegmentRef = useRef<HTMLDivElement>(null)

  // Fetch transcript when component opens
  useEffect(() => {
    if (isOpen && postId) {
      fetchTranscript()
    }
  }, [isOpen, postId])

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
      return currentTime >= segment.start && (!nextSegment || currentTime < nextSegment.start)
    })

    setActiveSegmentIndex(activeIndex)
  }, [currentTime, transcript])

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && activeSegmentIndex !== -1) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [activeSegmentIndex])

  const fetchTranscript = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/transcribe?postId=${postId}`)
      
      if (response.status === 404) {
        // Transcript doesn't exist, we might want to trigger creation
        setError('Transcript not available. Click to generate.')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch transcript')
      }

      const data = await response.json()
      setTranscript(data.transcript)
      
      if (data.transcript.segments) {
        setFilteredSegments(data.transcript.segments)
      }
    } catch (error) {
      console.error('Error fetching transcript:', error)
      setError('Failed to load transcript')
    } finally {
      setLoading(false)
    }
  }

  const generateTranscript = async () => {
    setLoading(true)
    setError(null)

    try {
      // We need the video URL from the post
      const postResponse = await fetch(`/api/posts/${postId}`)
      if (!postResponse.ok) {
        throw new Error('Failed to get post details')
      }
      
      const postData = await postResponse.json()
      const videoUrl = postData.videos // Assuming videos field contains the URL
      
      if (!videoUrl) {
        throw new Error('No video found for this post')
      }

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          videoUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start transcription')
      }

      const data = await response.json()
      setTranscript(data.transcript)
      
      // Poll for completion
      pollTranscriptionStatus()
    } catch (error) {
      console.error('Error generating transcript:', error)
      setError('Failed to generate transcript')
      setLoading(false)
    }
  }

  const pollTranscriptionStatus = async () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/transcribe?postId=${postId}`)
        if (response.ok) {
          const data = await response.json()
          setTranscript(data.transcript)
          
          if (data.transcript.status === 'completed') {
            setFilteredSegments(data.transcript.segments)
            setLoading(false)
            clearInterval(pollInterval)
          } else if (data.transcript.status === 'failed') {
            setError('Transcription failed')
            setLoading(false)
            clearInterval(pollInterval)
          }
        }
      } catch (error) {
        console.error('Error polling transcript status:', error)
      }
    }, 2000) // Poll every 2 seconds

    // Clear interval after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      setLoading(false)
    }, 300000)
  }

  const handleSegmentClick = (segment: TranscriptSegment) => {
    onSeek(segment.start)
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
    a.download = `transcript-${postId}.txt`
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
      onSeek(segment.start)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Video Transcript</h2>
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
          <div className="flex items-center space-x-2">
            {transcript && transcript.status === 'completed' && (
              <button
                onClick={downloadTranscript}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                title="Download transcript"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {transcript && transcript.status === 'completed' && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchResults.length > 0 && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-sm text-gray-500">
                  <span>{currentSearchIndex + 1} of {searchResults.length}</span>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" ref={transcriptRef}>
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {transcript?.status === 'processing' ? 'Generating transcript...' : 'Loading transcript...'}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-600 mb-4">{error}</p>
                {error.includes('not available') && (
                  <button
                    onClick={generateTranscript}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Generate Transcript
                  </button>
                )}
              </div>
            </div>
          )}

          {transcript && transcript.status === 'completed' && transcript.segments && (
            <div className="space-y-2">
              {filteredSegments.map((segment, index) => {
                const isActive = index === activeSegmentIndex
                const isSearchResult = searchResults.includes(index)
                const isCurrentSearchResult = searchResults[currentSearchIndex] === index
                
                return (
                  <div
                    key={index}
                    ref={isActive ? activeSegmentRef : undefined}
                    onClick={() => handleSegmentClick(segment)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : isCurrentSearchResult
                        ? 'bg-yellow-100 border-l-4 border-yellow-500'
                        : isSearchResult
                        ? 'bg-yellow-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {formatTime(segment.start)}
                        </span>
                      </div>
                      <p className={`text-sm flex-1 ${
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
                        <PlayIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {transcript && transcript.status === 'failed' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-600 mb-4">Transcription failed</p>
                <button
                  onClick={generateTranscript}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {transcript && transcript.status === 'completed' && (
          <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
            <div className="flex items-center justify-between">
              <span>Duration: {formatTime(transcript.duration)}</span>
              <span>Language: {transcript.language.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 