'use client'

import { useState } from 'react'
import { 
  XMarkIcon,
  LinkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  postContent: string
  postAuthor: string
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  postId, 
  postContent, 
  postAuthor 
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [recentShares] = useState([
    { platform: 'WhatsApp', lastUsed: '2 hours ago', icon: '💬' },
    { platform: 'Twitter', lastUsed: '1 day ago', icon: '🐦' },
    { platform: 'LinkedIn', lastUsed: '3 days ago', icon: '💼' },
  ])

  if (!isOpen) return null

  const postUrl = `${window.location.origin}/posts/${postId}`
  const shareText = `Check out this post by ${postAuthor}: "${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}"`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareToSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(postUrl)
    
    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText} ${encodedUrl}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
        break
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`
        break
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const shareWithinPlatform = (type: string) => {
    // Handle internal platform sharing
    console.log(`Sharing ${type} within platform:`, postId)
    // You can implement internal sharing logic here
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Share Post</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Share within platform */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Share within Seven Spokes</h4>
          <div className="space-y-2">
            <button
              onClick={() => shareWithinPlatform('story')}
              className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">📖</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Share to your story</div>
                <div className="text-sm text-gray-500">Share with your followers</div>
              </div>
            </button>
            
            <button
              onClick={() => shareWithinPlatform('message')}
              className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-lg">💬</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Send in message</div>
                <div className="text-sm text-gray-500">Share privately with friends</div>
              </div>
            </button>
          </div>
        </div>

        {/* Recently shared platforms */}
        {recentShares.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recently shared</h4>
            <div className="space-y-2">
              {recentShares.map((share, index) => (
                <button
                  key={index}
                  onClick={() => shareToSocial(share.platform.toLowerCase())}
                  className="w-full flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-lg">{share.icon}</span>
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900">{share.platform}</div>
                    <div className="text-sm text-gray-500">{share.lastUsed}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Social platforms */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Share to social media</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Twitter', icon: '🐦', key: 'twitter' },
              { name: 'Facebook', icon: '📘', key: 'facebook' },
              { name: 'LinkedIn', icon: '💼', key: 'linkedin' },
              { name: 'WhatsApp', icon: '💬', key: 'whatsapp' },
              { name: 'Telegram', icon: '✈️', key: 'telegram' },
              { name: 'Reddit', icon: '🤖', key: 'reddit' },
            ].map((platform) => (
              <button
                key={platform.key}
                onClick={() => shareToSocial(platform.key)}
                className="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-xl">{platform.icon}</span>
                </div>
                <span className="text-xs text-gray-700">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Copy link */}
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Copy link</h4>
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-gray-100 rounded-lg text-sm text-gray-700 truncate">
              {postUrl}
            </div>
            <button
              onClick={copyToClipboard}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <CheckIcon className="w-5 h-5" />
              ) : (
                <LinkIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-sm text-green-600 mt-2">Link copied to clipboard!</p>
          )}
        </div>
      </div>
    </div>
  )
} 