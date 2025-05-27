'use client'

import { useState, useRef } from 'react'
import {
  FaceSmileIcon,
  MapPinIcon,
  XMarkIcon,
  MicrophoneIcon,
  DocumentIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'

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

export default function CreatePost({ onSubmit }: CreatePostProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [feeling, setFeeling] = useState('')
  const [location, setLocation] = useState('')
  const [showFeelings, setShowFeelings] = useState(false)
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  const commonLocations = [
    'Home', 'Work', 'Coffee Shop', 'Park', 'Gym', 'Library', 'Downtown', 'Beach', 'School', 'Restaurant'
  ]

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])

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

    setSelectedFiles(prev => [...prev, ...validFiles])
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file)
      setPreviewUrls(prev => [...prev, url])
    })
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() && selectedFiles.length === 0) return

    const formData = new FormData()
    formData.append('content', content)
    if (feeling) formData.append('feeling', feeling)
    if (location) formData.append('location', location)
    selectedFiles.forEach(file => {
      formData.append('files', file)
    })

    try {
      setIsSubmitting(true)
      await onSubmit(formData)

      setContent('')
      setSelectedFiles([])
      setPreviewUrls([])
      setFeeling('')
      setLocation('')
      setShowFeelings(false)
      setShowLocationInput(false)
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocation(value)
    
    if (value.trim().length > 0) {
      const filteredLocations = commonLocations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      )
      setLocationSuggestions(filteredLocations)
    } else {
      setLocationSuggestions([])
    }
  }

  const selectLocation = (loc: string) => {
    setLocation(loc)
    setLocationSuggestions([])
  }

  const addCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Could not get your current location. Please check your permissions.")
        }
      )
    } else {
      alert("Geolocation is not supported by your browser")
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
    <div className="bg-white rounded-lg shadow p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200">
              {user?.user_metadata?.avatar_url ? (
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
            <div className="border-b border-gray-200 focus-within:border-blue-600">
              <textarea
                rows={2}
                name="content"
                id="content"
                className="block w-full resize-none border-0 border-b border-transparent p-0 pb-2 focus:ring-0 sm:text-sm"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

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

            {(feeling || location) && (
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
                      onClick={() => setLocation('')}
                      className="ml-1 text-green-600 hover:text-green-800"
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
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Add location"
                    value={location}
                    onChange={handleLocationChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCurrentLocation}
                    className="ml-2 p-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Current
                  </button>
                </div>
                
                {locationSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm">
                    {locationSuggestions.map(loc => (
                      <div 
                        key={loc} 
                        onClick={() => selectLocation(loc)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {loc}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              className="flex items-center text-gray-500 hover:text-gray-600 space-x-1"
              title="Add photos or videos"
            >
              <PaperClipIcon className="h-6 w-6" />
              <span className="text-sm hidden sm:inline">Media</span>
              <input
                type="file"
                ref={mediaInputRef}
                onChange={(e) => handleFileSelect(e, 'media')}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
            </button>
            
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="flex items-center text-gray-500 hover:text-gray-600 space-x-1"
              title="Add audio"
            >
              <MicrophoneIcon className="h-6 w-6" />
              <span className="text-sm hidden sm:inline">Audio</span>
              <input
                type="file"
                ref={audioInputRef}
                onChange={(e) => handleFileSelect(e, 'audio')}
                accept="audio/*"
                multiple
                className="hidden"
              />
            </button>
            
            <button
              type="button"
              onClick={() => documentInputRef.current?.click()}
              className="flex items-center text-gray-500 hover:text-gray-600 space-x-1"
              title="Add documents"
            >
              <DocumentIcon className="h-6 w-6" />
              <span className="text-sm hidden sm:inline">Docs</span>
              <input
                type="file"
                ref={documentInputRef}
                onChange={(e) => handleFileSelect(e, 'document')}
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                multiple
                className="hidden"
              />
            </button>
            
            <button
              type="button"
              onClick={() => setShowFeelings(!showFeelings)}
              className="text-gray-500 hover:text-gray-600"
              title="Add feeling"
            >
              <FaceSmileIcon className="h-6 w-6" />
            </button>
            
            <button
              type="button"
              onClick={() => setShowLocationInput(!showLocationInput)}
              className="text-gray-500 hover:text-gray-600"
              title="Add location"
            >
              <MapPinIcon className="h-6 w-6" />
            </button>
          </div>
          <button
            type="submit"
            disabled={(!content.trim() && selectedFiles.length === 0) || isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Posting...
              </>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </form>
    </div>
  )
} 