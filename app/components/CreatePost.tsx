'use client'

import { useState, useRef } from 'react'
import {
  PhotoIcon,
  VideoCameraIcon,
  FaceSmileIcon,
  MapPinIcon,
  XMarkIcon,
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Common locations for suggestions
  const commonLocations = [
    'Home',
    'Work',
    'Coffee Shop',
    'Park',
    'Gym',
    'Library',
    'Downtown',
    'Beach',
    'School',
    'Restaurant'
  ]

  // Location Input
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => {
      if (type === 'image') {
        return file.type.startsWith('image/')
      } else {
        return file.type.startsWith('video/')
      }
    })

    if (validFiles.length === 0) return;

    // Add to selected files
    setSelectedFiles(prev => [...prev, ...validFiles])

    // Create and store preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file)
      setPreviewUrls(prev => [...prev, url])
    })
    
    // Reset file input
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index)
      // Cleanup old URL
      URL.revokeObjectURL(prev[index])
      return newUrls
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() && selectedFiles.length === 0) return

    // Create form data
    const formData = new FormData()
    formData.append('content', content)
    if (feeling) formData.append('feeling', feeling)
    if (location) formData.append('location', location)
    selectedFiles.forEach(file => {
      formData.append('files', file)
    })

    try {
      await onSubmit(formData)

      // Reset form
      setContent('')
      setSelectedFiles([])
      setPreviewUrls([])
      setFeeling('')
      setLocation('')
      setShowFeelings(false)
      setShowLocationInput(false)
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocation(value)
    
    // Show suggestions if the user has typed something
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

  // Add geolocation functionality
  const addCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For real implementation, you might want to reverse geocode
          // these coordinates to get a human-readable address
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

            {/* Media Previews */}
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={url} className="relative">
                    {selectedFiles[index]?.type.startsWith('image/') ? (
                      <img src={url} alt="Preview" className="rounded-lg object-cover h-40 w-full" />
                    ) : (
                      <video src={url} className="rounded-lg h-40 w-full" controls />
                    )}
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

            {/* Feeling and Location Tags */}
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

            {/* Feelings Selector */}
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

            {/* Location Input */}
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
                
                {/* Location suggestions */}
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
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-600"
            >
              <PhotoIcon className="h-6 w-6" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e, 'image')}
                accept="image/*"
                multiple
                className="hidden"
              />
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-600"
            >
              <VideoCameraIcon className="h-6 w-6" />
              <input
                type="file"
                ref={videoInputRef}
                onChange={(e) => handleFileSelect(e, 'video')}
                accept="video/*"
                multiple
                className="hidden"
              />
            </button>
            <button
              type="button"
              onClick={() => setShowFeelings(!showFeelings)}
              className="text-gray-500 hover:text-gray-600"
            >
              <FaceSmileIcon className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => setShowLocationInput(!showLocationInput)}
              className="text-gray-500 hover:text-gray-600"
            >
              <MapPinIcon className="h-6 w-6" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!content.trim() && selectedFiles.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  )
} 