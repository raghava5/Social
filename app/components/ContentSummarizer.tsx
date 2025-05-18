'use client'

import { useState } from 'react'
import { DocumentTextIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface ContentSummarizerProps {
  content: string
  maxLength?: number
  showFullContentByDefault?: boolean
}

export default function ContentSummarizer({
  content,
  maxLength = 280,
  showFullContentByDefault = false
}: ContentSummarizerProps) {
  const [showFullContent, setShowFullContent] = useState(showFullContentByDefault)
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Check if content needs summarization
  const needsSummarization = content.length > maxLength
  
  // Get the display text based on state
  const displayText = !needsSummarization
    ? content
    : showFullContent
      ? content
      : summary || content.substring(0, maxLength) + '...'
  
  // Function to handle summarization request
  const handleSummarize = async () => {
    if (summary) {
      // Already have a summary, just toggle view
      setShowFullContent(!showFullContent)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Call the API to get the summary
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content, maxLength }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }
      
      const data = await response.json()
      setSummary(data.summary)
      setShowFullContent(false)
    } catch (err) {
      console.error('Error summarizing content:', err)
      setError('Unable to generate summary')
      // Fallback to simple truncation
      setSummary(content.substring(0, maxLength) + '...')
    } finally {
      setLoading(false)
    }
  }
  
  if (!needsSummarization) {
    return <p className="text-gray-700">{content}</p>
  }
  
  return (
    <div className="relative">
      <div 
        className={`text-gray-700 ${loading ? 'opacity-50' : ''}`}
      >
        {displayText}
      </div>
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
      
      <div className="mt-2 flex justify-end">
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : showFullContent ? (
            <>
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Show Less
              <ChevronUpIcon className="h-3 w-3 ml-1" />
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              {summary ? 'Show More' : 'Summarize'}
              <ChevronDownIcon className="h-3 w-3 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  )
} 