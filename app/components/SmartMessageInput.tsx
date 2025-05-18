'use client'

import { useState, useEffect, useRef } from 'react'
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  LightBulbIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

interface SmartMessageInputProps {
  onSendMessage: (message: string) => void
  conversationId?: string
  recipientId?: string
  placeholder?: string
  conversationContext?: string[] // Previous messages for context
  showSmartReplies?: boolean
}

export default function SmartMessageInput({
  onSendMessage,
  conversationId,
  recipientId,
  placeholder = 'Type a message...',
  conversationContext = [],
  showSmartReplies = true
}: SmartMessageInputProps) {
  const [message, setMessage] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showToxicityWarning, setShowToxicityWarning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])
  
  // Get smart reply suggestions when context changes
  useEffect(() => {
    if (!showSmartReplies || conversationContext.length === 0) {
      return
    }
    
    fetchReplySuggestions()
  }, [conversationContext, showSmartReplies])
  
  // Function to fetch reply suggestions from API
  const fetchReplySuggestions = async () => {
    try {
      const response = await fetch('/api/smart-replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationContext,
          userId: 'current-user', // Replace with actual user ID
          conversationId,
          recipientId
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to get reply suggestions')
      }
      
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Error fetching reply suggestions:', error)
      setSuggestions([])
    }
  }
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    // Check for potentially toxic content
    try {
      setLoading(true)
      
      const response = await fetch('/api/toxicity-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to check message content')
      }
      
      const data = await response.json()
      
      if (data.isToxic) {
        setShowToxicityWarning(true)
        return
      }
      
      // If not toxic, send the message
      onSendMessage(message)
      setMessage('')
      setSuggestions([])
      setShowToxicityWarning(false)
    } catch (error) {
      console.error('Error checking message content:', error)
      // If the check fails, just send the message
      onSendMessage(message)
      setMessage('')
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }
  
  // Handle pressing Enter to send (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  // Handle using a suggestion
  const handleUseSuggestion = (suggestion: string) => {
    onSendMessage(suggestion)
    setMessage('')
    setSuggestions([])
  }
  
  // Handle acknowledging toxicity warning and sending anyway
  const handleSendAnyway = () => {
    onSendMessage(message)
    setMessage('')
    setSuggestions([])
    setShowToxicityWarning(false)
  }
  
  return (
    <div className="relative">
      {/* Smart reply suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleUseSuggestion(suggestion)}
              className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full flex items-center hover:bg-blue-100 transition-colors"
            >
              <LightBulbIcon className="h-3.5 w-3.5 mr-1" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {/* Toxicity warning */}
      {showToxicityWarning && (
        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
            <div>
              <p className="text-sm text-amber-800">
                This message might be perceived as negative or disrespectful. Would you like to revise it?
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setShowToxicityWarning(false)}
                  className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Edit message
                </button>
                <button
                  onClick={handleSendAnyway}
                  className="px-3 py-1 text-xs bg-amber-100 text-amber-800 rounded hover:bg-amber-200"
                >
                  Send anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Message input */}
      <div className="flex items-end border rounded-lg bg-white overflow-hidden">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 resize-none focus:outline-none max-h-32"
          rows={1}
        />
        <div className="flex items-center px-2">
          <button 
            type="button" 
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <FaceSmileIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={loading || !message.trim()}
            className={`p-2 rounded-full ${
              message.trim() ? 'text-blue-600 hover:text-blue-800' : 'text-gray-300'
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 