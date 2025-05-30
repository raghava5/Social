'use client'

import { useState, useRef } from 'react'
import {
  XMarkIcon,
  PhotoIcon,
  FaceSmileIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline'

interface EditPostModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    id: string
    content: string
    images?: string
    videos?: string
    feeling?: string
    location?: string
    tags?: string[]
  }
  onSave: (updatedPost: any) => Promise<void>
}

const feelings = [
  'happy', 'excited', 'grateful', 'loved', 'blessed', 'motivated',
  'peaceful', 'confident', 'proud', 'accomplished', 'inspired', 'hopeful',
  'sad', 'frustrated', 'tired', 'stressed', 'worried', 'overwhelmed'
]

export default function EditPostModal({ isOpen, onClose, post, onSave }: EditPostModalProps) {
  const [content, setContent] = useState(post.content)
  const [feeling, setFeeling] = useState(post.feeling || '')
  const [location, setLocation] = useState(post.location || '')
  const [tags, setTags] = useState(post.tags?.join(', ') || '')
  const [isLoading, setIsLoading] = useState(false)
  const [showFeelings, setShowFeelings] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [mediaPreview, setMediaPreview] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!content.trim()) return

    setIsLoading(true)
    try {
      // Create FormData for file uploads
      const formData = new FormData()
      formData.append('content', content.trim())
      
      if (feeling) formData.append('feeling', feeling)
      if (location) formData.append('location', location)
      if (tags) formData.append('tags', tags)

      // Add files if any are selected
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      // Call the API directly with FormData if files are present
      if (selectedFiles.length > 0) {
        const response = await fetch(`/api/posts/${post.id}/edit`, {
          method: 'PATCH',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Failed to update post')
        }

        const data = await response.json()
        await onSave(data.post) // Pass the updated post data
      } else {
        // Use regular JSON if no files
        const updatedPost = {
          id: post.id,
          content: content.trim(),
          feeling: feeling || undefined,
          location: location || undefined,
          tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
        }
        await onSave(updatedPost)
      }

      onClose()
    } catch (error) {
      console.error('Error updating post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMediaUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(files)
      
      // Create preview URLs
      const previewUrls = files.map(file => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file)
        }
        return '' // For videos, we could add video preview logic later
      })
      setMediaPreview(previewUrls)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = mediaPreview.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setMediaPreview(newPreviews)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Post</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Post Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              placeholder="Share your thoughts..."
            />
          </div>

          {/* Feeling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling?
            </label>
            <div className="relative">
              <button
                onClick={() => setShowFeelings(!showFeelings)}
                className="w-full p-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <FaceSmileIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <span className={feeling ? 'text-gray-900' : 'text-gray-500'}>
                    {feeling ? `Feeling ${feeling}` : 'Add feeling'}
                  </span>
                </div>
              </button>
              
              {showFeelings && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => {
                      setFeeling('')
                      setShowFeelings(false)
                    }}
                    className="w-full p-2 text-left hover:bg-gray-50 text-gray-500"
                  >
                    Remove feeling
                  </button>
                  {feelings.map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFeeling(f)
                        setShowFeelings(false)
                      }}
                      className="w-full p-2 text-left hover:bg-gray-50 capitalize"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add location"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="relative">
              <TagIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add tags (comma separated)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Separate tags with commas (e.g., motivation, life, goals)
            </p>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media
            </label>
            <button
              onClick={handleMediaUpload}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Click to add photos or videos</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Current Media Preview */}
          {(post.images || post.videos || selectedFiles.length > 0) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media
              </label>
              <div className="space-y-2">
                {/* Existing Media */}
                {post.images && post.images.split(',').map((img, index) => (
                  <div key={`existing-${index}`} className="relative">
                    <img 
                      src={img.trim()} 
                      alt="Post media"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      Current
                    </div>
                  </div>
                ))}
                
                {/* New File Previews */}
                {mediaPreview.map((previewUrl, index) => (
                  <div key={`new-${index}`} className="relative">
                    <img 
                      src={previewUrl} 
                      alt="New media"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                      New
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
} 