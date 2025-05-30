'use client'

import { useState, useRef, useEffect } from 'react'
import {
  FaceSmileIcon,
  MapPinIcon,
  XMarkIcon,
  MicrophoneIcon,
  DocumentIcon,
  PaperClipIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  PhotoIcon,
  PlayIcon,
  PlusIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { Editor } from '@tiptap/react'
import dynamic from 'next/dynamic'

// Dynamically import components to avoid SSR issues
const ArticleEditor = dynamic(() => import('./ArticleEditor'), { ssr: false })
const ParallaxSliderModal = dynamic(() => import('./ParallaxSliderModal'), { ssr: false })

const feelings = [
  '😊 Happy',
  '😢 Sad',
  '😎 Cool',
  '😍 Loved',
  '😤 Frustrated',
  '🤔 Thoughtful',
  '😴 Tired',
  '🤗 Grateful',
]

interface CreatePostProps {
  onSubmit: (formData: FormData) => Promise<void>
}

interface LocationSuggestion {
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
  }
}

interface Document {
  id: string
  file: File
  name: string
  size: number
  type: string
  url: string
}

interface SlideData {
  id: string
  imageURL: string
  title: string
  caption: string
  parallaxLayers: Array<{
    id: string
    content: string
    parallaxOffset: string
    zIndex: number
  }>
}

export default function CreatePost({ onSubmit }: CreatePostProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [feeling, setFeeling] = useState('')
  const [location, setLocation] = useState('')
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null)
  const [showFeelings, setShowFeelings] = useState(false)
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [showArticleEditor, setShowArticleEditor] = useState(false)
  const [title, setTitle] = useState('')
  const [showContentError, setShowContentError] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  
  // Document state
  const [documents, setDocuments] = useState<Document[]>([])
  
  // Article Editor state
  const [articleContent, setArticleContent] = useState('')
  const [editor, setEditor] = useState<Editor | null>(null)
  
  // Parallax Slider state
  const [showSliderModal, setShowSliderModal] = useState(false)
  const [slides, setSlides] = useState<SlideData[]>([])
  
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)

  // Cache for reverse geocoding to reduce API calls
  const geocodingCache = useRef<Map<string, LocationSuggestion[]>>(new Map())

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'audio' | 'document') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => {
      if (type === 'media') {
        return file.type.startsWith('image/') || file.type.startsWith('video/')
      } else if (type === 'audio') {
        return file.type.startsWith('audio/')
      } else if (type === 'document') {
        return file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text') || 
               file.type.includes('spreadsheet') || file.type.includes('presentation') ||
               file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.pdf') ||
               file.name.endsWith('.txt') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ||
               file.name.endsWith('.ppt') || file.name.endsWith('.pptx')
      }
      return false
    })

    if (validFiles.length === 0) return;

    if (type === 'document') {
      // Handle documents separately
      const newDocuments: Document[] = validFiles.map(file => ({
        id: `doc-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }))
      setDocuments(prev => [...prev, ...newDocuments])
    } else {
      setSelectedFiles(prev => [...prev, ...validFiles])
      validFiles.forEach(file => {
        const url = URL.createObjectURL(file)
        setPreviewUrls(prev => [...prev, url])
      })
    }
    
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index)
      URL.revokeObjectURL(prev[index])
      return newUrls
    })
  }

  const removeDocument = (id: string) => {
    setDocuments(prev => {
      const doc = prev.find(d => d.id === id)
      if (doc) URL.revokeObjectURL(doc.url)
      return prev.filter(d => d.id !== id)
    })
  }

  const handleSliderSave = (slideData: SlideData[]) => {
    setSlides(slideData)
    if (editor && slideData.length > 0) {
      // Insert slider into TipTap editor
      editor.chain().focus().insertContent({
        type: 'parallaxSlider',
        attrs: { slides: slideData }
      }).run()
    }
    setShowSliderModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate content - Enhanced validation for article mode
    const hasBasicContent = content.trim().length > 0
    const hasArticleContent = showArticleEditor && (editor?.getHTML()?.trim().length || 0) > 0
    const hasFiles = selectedFiles.length > 0
    const hasDocuments = documents.length > 0
    
    // Require explicit user action - don't auto-submit just because files exist
    if (!hasBasicContent && !hasArticleContent && !hasFiles && !hasDocuments) {
      setShowContentError(true)
      return
    }
    
    // Additional validation: ensure this is an intentional submit (not auto-triggered)
    if (!e.isTrusted && !hasBasicContent && !hasArticleContent) {
      console.log('🚫 Preventing auto-submission without content')
      return
    }
    
    // Check article content size to prevent database errors
    if (showArticleEditor && editor) {
      const contentBytes = new Blob([editor.getHTML()]).size
      if (contentBytes > 1000000) { // 1MB limit
        alert('Article content is too large (over 1MB). Please reduce the content size or use external links for large media.')
        return
      }
    }
    
    setShowContentError(false)

    const formData = new FormData()
    
    // Always include basic content (even if empty)
    formData.append('content', content)
    
    // Add article content if provided
    if (showArticleEditor && editor?.getHTML()) {
      formData.append('articleContent', editor.getHTML())
      formData.append('articleJson', JSON.stringify(editor.getJSON() || {}))
      if (slides.length > 0) {
        formData.append('slides', JSON.stringify(slides))
      }
    }
    
    formData.append('postMode', 'post') // Always post mode now
    if (title) formData.append('title', title)
    if (feeling) formData.append('feeling', feeling)
    if (location) formData.append('location', location)
    if (coordinates) {
      formData.append('latitude', coordinates.lat.toString())
      formData.append('longitude', coordinates.lon.toString())
    }
    if (isAnonymous) formData.append('isAnonymous', 'true')
    
    // Add media files
    selectedFiles.forEach(file => {
      formData.append('files', file)
    })
    
    // Add document files
    documents.forEach(doc => {
      formData.append('files', doc.file)
    })

    try {
      setIsSubmitting(true)
      console.log('🚀 Submitting post...', {
        content: content.substring(0, 50),
        hasArticleContent: showArticleEditor && !!editor?.getHTML(),
        filesCount: selectedFiles.length,
        documentsCount: documents.length,
        slidesCount: slides.length,
        isAnonymous,
        hasLocation: !!location,
        hasCoordinates: !!coordinates
      })
      
      await onSubmit(formData)
      console.log('✅ Post submitted successfully')

      // Clear form only on successful submission
      setContent('')
      setTitle('')
      setArticleContent('')
      setSelectedFiles([])
      setPreviewUrls([])
      setDocuments([])
      setSlides([])
      setFeeling('')
      setLocation('')
      setCoordinates(null)
      setIsAnonymous(false)
      setShowFeelings(false)
      setShowLocationInput(false)
      setShowContentError(false)
      setShowArticleEditor(false)
      setLocationSuggestions([])
      setShowLocationSuggestions(false)
      if (editor) {
        editor.commands.clearContent()
      }
    } catch (error) {
      console.error('❌ Error creating post:', error)
      
      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`Failed to create post: ${error.message}`)
      } else {
        alert('Failed to create post. Please try again.')
      }
      
      // Don't clear form on error - keep user's content
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsGettingLocation(true)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoordinates({ lat: latitude, lon: longitude })
        
        // Round coordinates to 3 decimals for caching (~100m accuracy)
        const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`
        
        try {
          // Check cache first
          if (geocodingCache.current.has(cacheKey)) {
            const cachedSuggestions = geocodingCache.current.get(cacheKey)!
            setLocationSuggestions(cachedSuggestions)
            setShowLocationSuggestions(true)
            setIsGettingLocation(false)
            return
          }

          // Fetch multiple zoom levels for different granularities
          const zoomLevels = [14, 10, 6] // neighborhood, city, state
          const suggestions: LocationSuggestion[] = []
          
          for (const zoom of zoomLevels) {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=${zoom}&addressdetails=1`,
                {
                  headers: {
                    'User-Agent': 'SocialApp/1.0 (contact@example.com)' // Required by Nominatim
                  }
                }
              )
              
              if (response.ok) {
                const data = await response.json()
                if (data.display_name && !suggestions.some(s => s.display_name === data.display_name)) {
                  suggestions.push(data)
                }
              }
              
              // Rate limiting - wait between requests
              await new Promise(resolve => setTimeout(resolve, 1000))
            } catch (error) {
              console.warn(`Failed to fetch zoom level ${zoom}:`, error)
            }
          }
          
          // Cache the results
          geocodingCache.current.set(cacheKey, suggestions)
          setLocationSuggestions(suggestions)
          setShowLocationSuggestions(true)
          
        } catch (error) {
          console.error('Reverse geocoding failed:', error)
          // Fallback to coordinates
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        setIsGettingLocation(false)
        alert("Could not get your current location. Please check your permissions.")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    )
  }

  const selectLocationSuggestion = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.display_name)
    setCoordinates({ lat: parseFloat(suggestion.lat), lon: parseFloat(suggestion.lon) })
    setShowLocationSuggestions(false)
    setShowLocationInput(false)
  }

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocation(value)
    
    // Clear coordinates if manually typing
    if (value !== locationSuggestions.find(s => s.display_name === value)?.display_name) {
      setCoordinates(null)
    }
  }

  const getFilePreview = (file: File, url: string, index: number) => {
    if (file.type.startsWith('image/')) {
      return <img src={url} alt="Preview" className="rounded-lg object-cover h-40 w-full" />
    } else if (file.type.startsWith('video/')) {
      return <video src={url} className="rounded-lg h-40 w-full" controls />
    } else if (file.type.startsWith('audio/')) {
      return (
        <div className="rounded-lg h-40 w-full bg-gray-100 flex flex-col items-center justify-center">
          <MicrophoneIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center px-2">{file.name}</p>
          <audio src={url} controls className="mt-2" />
        </div>
      )
    } else {
      return (
        <div className="rounded-lg h-40 w-full bg-gray-100 flex flex-col items-center justify-center">
          <DocumentIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 text-center px-2">{file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 transition-colors ${isSubmitting ? 'bg-yellow-50 border-yellow-200 border' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200">
              {isAnonymous ? (
                <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center">
                  <EyeSlashIcon className="h-5 w-5 text-white" />
                </div>
              ) : user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.name || 'User avatar'}
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/40?text=User';
                  }}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-medium">
                    {user?.user_metadata?.name?.[0] || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            {/* Title Input (Optional) */}
            {title && (
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Post title (optional)..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full text-lg font-semibold border-0 border-b border-gray-200 focus:border-blue-600 focus:ring-0 p-0 pb-2"
                />
              </div>
            )}

            {/* Main Content Input */}
            <div className="border-b border-gray-200 focus-within:border-blue-600">
              <textarea
                rows={2}
                name="content"
                id="content"
                className="block w-full resize-none border-0 border-b border-transparent p-0 pb-2 focus:ring-0 sm:text-sm"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  if (showContentError && (e.target.value.trim() || selectedFiles.length > 0)) {
                    setShowContentError(false)
                  }
                }}
              />
            </div>

            {/* Article Editor Section */}
            {showArticleEditor && (
              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Rich Article Content (Optional)</span>
                  <button
                    type="button"
                    onClick={() => setShowArticleEditor(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                <ArticleEditor
                  content={articleContent}
                  onChange={setArticleContent}
                  onEditorReady={setEditor}
                  onSliderRequest={() => setShowSliderModal(true)}
                />
              </div>
            )}

            {/* Content Error Message */}
            {showContentError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XMarkIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      Please write something or add media to create a post.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Media Previews */}
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={url} className="relative">
                    {getFilePreview(selectedFiles[index], url, index)}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 rounded-full p-1 hover:bg-opacity-70"
                    >
                      <XMarkIcon className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Document Previews */}
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Attached Documents</h4>
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DocumentIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Slides Preview */}
            {slides.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ArrowsPointingOutIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {slides.length} slide{slides.length > 1 ? 's' : ''} added
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSliderModal(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}

            {(feeling || location || isAnonymous) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {feeling && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {feeling}
                    <button
                      type="button"
                      onClick={() => setFeeling('')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {location}
                    <button
                      type="button"
                      onClick={() => {
                        setLocation('')
                        setCoordinates(null)
                      }}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {isAnonymous && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <EyeSlashIcon className="h-3 w-3 mr-1" />
                    Anonymous
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(false)}
                      className="ml-1 text-gray-600 hover:text-gray-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {showFeelings && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-4 gap-2">
                  {feelings.map((feel) => (
                    <button
                      key={feel}
                      type="button"
                      onClick={() => {
                        setFeeling(feel)
                        setShowFeelings(false)
                      }}
                      className="text-sm text-gray-700 hover:bg-gray-100 p-2 rounded"
                    >
                      {feel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showLocationInput && (
              <div className="mt-2 relative">
                <div className="flex items-center space-x-2">
                  <input
                    ref={locationInputRef}
                    type="text"
                    placeholder="Add location or use current location"
                    value={location}
                    onChange={handleLocationInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGettingLocation ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Current'
                    )}
                  </button>
                </div>
                
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectLocationSuggestion(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || 'Location'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {suggestion.display_name}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                if (mediaInputRef.current) {
                  mediaInputRef.current.click()
                }
              }}
              title="Add photos or videos"
              className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <PhotoIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (audioInputRef.current) {
                  audioInputRef.current.click()
                }
              }}
              title="Add audio files"
              className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (documentInputRef.current) {
                  documentInputRef.current.click()
                }
              }}
              title="Add documents"
              className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <DocumentIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowFeelings(!showFeelings)}
              title="Add feeling"
              className={`p-3 rounded-lg transition-colors ${
                showFeelings 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaceSmileIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowLocationInput(!showLocationInput)}
              title="Add location"
              className={`p-3 rounded-lg transition-colors ${
                showLocationInput 
                  ? 'bg-green-100 text-green-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapPinIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              title="Post anonymously"
              className={`p-3 rounded-lg transition-colors ${
                isAnonymous 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <EyeSlashIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowArticleEditor(!showArticleEditor)}
              title="Add rich article content"
              className={`p-3 rounded-lg transition-colors ${
                showArticleEditor 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>

            {showArticleEditor && (
              <button
                type="button"
                onClick={() => setShowSliderModal(true)}
                title="Add parallax slider"
                className="p-3 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <ArrowsPointingOutIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Publishing...' : 'Post'}
          </button>
        </div>
      </form>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={mediaInputRef}
        onChange={(e) => handleFileSelect(e, 'media')}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={audioInputRef}
        onChange={(e) => handleFileSelect(e, 'audio')}
        accept="audio/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={documentInputRef}
        onChange={(e) => handleFileSelect(e, 'document')}
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        multiple
        className="hidden"
      />

      {/* Parallax Slider Modal */}
      {showSliderModal && (
        <ParallaxSliderModal
          isOpen={showSliderModal}
          onClose={() => setShowSliderModal(false)}
          onSave={handleSliderSave}
          initialSlides={slides}
        />
      )}
    </div>
  )
} 