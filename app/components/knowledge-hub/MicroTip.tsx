'use client'

import { useState } from 'react'
import {
  LightBulbIcon,
  BookmarkIcon as BookmarkOutlineIcon,
  ShareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'

interface MicroTipProps {
  id: string
  title: string
  content: string
  category: string
  isBookmarked?: boolean
  onBookmark?: (tipId: string) => void
  onShare?: (tipId: string) => void
  onDismiss?: (tipId: string) => void
}

export default function MicroTip({
  id,
  title,
  content,
  category,
  isBookmarked = false,
  onBookmark,
  onShare,
  onDismiss,
}: MicroTipProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [bookmarked, setBookmarked] = useState(isBookmarked)

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    onBookmark?.(id)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.(id)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 relative">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-primary-100">
            <LightBulbIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBookmark}
            className="text-gray-400 hover:text-gray-500"
          >
            {bookmarked ? (
              <BookmarkSolidIcon className="h-5 w-5 text-primary-600" />
            ) : (
              <BookmarkOutlineIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => onShare?.(id)}
            className="text-gray-400 hover:text-gray-500"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        <p className="text-sm text-gray-600">{content}</p>
      </div>
    </div>
  )
} 