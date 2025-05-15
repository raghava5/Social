'use client'

import { useState } from 'react'
import {
  PlayIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

interface Expert {
  id: string
  name: string
  title: string
  avatar?: string
}

interface MediaContent {
  id: string
  title: string
  description: string
  type: 'video' | 'podcast' | 'article'
  duration: string
  expert: Expert
  thumbnail?: string
}

interface ExpertInsightsProps {
  content: MediaContent[]
}

export default function ExpertInsights({ content }: ExpertInsightsProps) {
  const [activeType, setActiveType] = useState<'video' | 'podcast' | 'article'>(
    'video'
  )

  const filteredContent = content.filter((item) => item.type === activeType)

  return (
    <div className="space-y-6">
      {/* Content type filter */}
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveType('video')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeType === 'video'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <PlayIcon className="h-5 w-5 mr-2" />
          Videos
        </button>
        <button
          onClick={() => setActiveType('podcast')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeType === 'podcast'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MicrophoneIcon className="h-5 w-5 mr-2" />
          Podcasts
        </button>
        <button
          onClick={() => setActiveType('article')}
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeType === 'article'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Articles
        </button>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            {/* Thumbnail */}
            {item.thumbnail && (
              <div className="relative aspect-video">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full p-3">
                      <PlayIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {item.description}
              </p>

              {/* Expert info */}
              <div className="mt-4 flex items-center space-x-3">
                {item.expert.avatar ? (
                  <img
                    src={item.expert.avatar}
                    alt={item.expert.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.expert.name}
                  </div>
                  <div className="text-xs text-gray-500">{item.expert.title}</div>
                </div>
              </div>

              {/* Duration */}
              <div className="mt-4 text-sm text-gray-500">{item.duration}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 