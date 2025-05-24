'use client'

import { useState, useRef, useEffect } from 'react'
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  BookmarkIcon,
  FlagIcon,
  EyeSlashIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline'

interface PostOptionsMenuProps {
  postId: string
  authorId: string
  currentUserId?: string
  onEdit?: () => void
  onDelete?: () => void
  onSave?: () => void
  onHide?: () => void
  onReport?: () => void
  onUnfollow?: () => void
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
                onClick={() => handleMenuAction(onEdit)}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Edit post</div>
                  <div className="text-sm text-gray-500">Make changes to your post</div>
                </div>
              </button>
              
              <button
                onClick={() => handleMenuAction(onDelete)}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <TrashIcon className="w-5 h-5 text-red-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-red-600">Delete post</div>
                  <div className="text-sm text-gray-500">Remove this post permanently</div>
                </div>
              </button>

              <hr className="my-2 border-gray-100" />

              <button
                onClick={() => handleMenuAction(onSave)}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <BookmarkIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Save post</div>
                  <div className="text-sm text-gray-500">Add to your saved items</div>
                </div>
              </button>
            </>
          ) : (
            // Options for other people's posts
            <>
              <button
                onClick={() => handleMenuAction(onSave)}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <BookmarkIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Save post</div>
                  <div className="text-sm text-gray-500">Add to your saved items</div>
                </div>
              </button>

              <button
                onClick={() => handleMenuAction(onHide)}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <EyeSlashIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Hide post</div>
                  <div className="text-sm text-gray-500">See fewer posts like this</div>
                </div>
              </button>

              <button
                onClick={() => handleMenuAction(onUnfollow)}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <UserMinusIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Unfollow</div>
                  <div className="text-sm text-gray-500">Stop seeing posts from this person</div>
                </div>
              </button>

              <hr className="my-2 border-gray-100" />

              <button
                onClick={() => handleMenuAction(onReport)}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <FlagIcon className="w-5 h-5 text-red-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-red-600">Report post</div>
                  <div className="text-sm text-gray-500">Report inappropriate content</div>
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
} 