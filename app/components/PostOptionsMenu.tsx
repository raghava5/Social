'use client'

import { useState, useRef, useEffect } from 'react'
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  BookmarkIcon,
  FlagIcon,
  EyeSlashIcon,
  UserMinusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface PostOptionsMenuProps {
  postId: string
  authorId: string
  currentUserId?: string
  onEdit: () => void
  onDelete: () => void
  onSave: () => void
  onHide: () => void
  onReport: () => void
  onUnfollow: () => void
}

export default function PostOptionsMenu({
  postId,
  authorId,
  currentUserId,
  onEdit,
  onDelete,
  onSave,
  onHide,
  onReport,
  onUnfollow
}: PostOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const isOwnPost = currentUserId === authorId

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMenuAction = (action?: () => void) => {
    if (action) {
      action()
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Post options"
      >
        <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
        >
          {isOwnPost ? (
            // Options for own posts
            <>
              <button
                onClick={onEdit}
                className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-3 text-gray-500" />
                <span className="text-sm text-gray-700">Edit post</span>
              </button>
              
              <button
                onClick={onDelete}
                className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-3 text-red-500" />
                <span className="text-sm text-red-600">Delete post</span>
              </button>
            </>
          ) : (
            // Options for other people's posts
            <>
              <button
                onClick={onHide}
                className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <EyeSlashIcon className="w-4 h-4 mr-3 text-gray-500" />
                <span className="text-sm text-gray-700">Hide post</span>
              </button>

              <button
                onClick={onUnfollow}
                className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <UserMinusIcon className="w-4 h-4 mr-3 text-gray-500" />
                <span className="text-sm text-gray-700">Unfollow user</span>
              </button>

              <hr className="my-1" />

              <button
                onClick={onReport}
                className="w-full flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <ExclamationTriangleIcon className="w-4 h-4 mr-3 text-red-500" />
                <span className="text-sm text-red-600">Report post</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
} 