'use client'

import React, { useState, useEffect } from 'react'
import { ArrowsPointingOutIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import mammoth from 'mammoth'

interface InlineDocxViewerProps {
  url: string
  fileName?: string
  className?: string
  onFullScreen?: () => void
}

export default function InlineDocxViewer({ 
  url, 
  fileName = 'Document',
  className = '',
  onFullScreen 
}: InlineDocxViewerProps) {
  const [html, setHtml] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch document')
        }
        
        const arrayBuffer = await response.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })
        
        setHtml(result.value)
        setIsLoading(false)
        
        // Log any conversion messages (warnings)
        if (result.messages.length > 0) {
          console.warn('DOCX conversion messages:', result.messages)
        }
      } catch (err) {
        console.error('Error loading DOCX:', err)
        setError('Failed to load document')
        setIsLoading(false)
      }
    }

    loadDocument()
  }, [url])

  const handleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleFullscreen = () => {
    if (onFullScreen) {
      onFullScreen()
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
  }

  const getFileExtension = () => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return ext === 'docx' ? 'DOCX' : ext === 'doc' ? 'DOC' : 'Document'
  }

  return (
    <div className={`inline-docx-viewer ${className}`}>
      {/* Document Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📝</span>
          <div>
            <h4 className="text-sm font-medium text-gray-900 truncate max-w-xs">
              {fileName}
            </h4>
            <p className="text-xs text-gray-500">{getFileExtension()} Document</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExpand}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <XMarkIcon className="w-4 h-4" />
            ) : (
              <ArrowsPointingOutIcon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleFullscreen}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            title="View in fullscreen"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            title="Download document"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Viewer Container */}
      <div 
        className={`docx-container bg-white border border-gray-200 rounded-b-lg overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[800px]' : 'max-h-[400px]'
        }`}
      >
        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Loading document...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <p className="text-red-600 mb-2">❌ {error}</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Download Document Instead
              </button>
            </div>
          </div>
        )}

        {!error && !isLoading && html && (
          <div className="overflow-y-auto h-full">
            <div
              className="prose max-w-none p-6 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: html }}
              style={{
                fontFamily: "'Segoe UI', 'Arial', sans-serif",
                lineHeight: '1.6',
                color: '#374151'
              }}
            />
          </div>
        )}

        {!error && !isLoading && !html && (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Document appears to be empty</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Download Original
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .inline-docx-viewer {
          max-width: 100%;
          margin: 0 auto;
        }
        
        /* Enhanced prose styling for better document rendering */
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          font-weight: bold;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: #1f2937;
        }
        
        .prose h1 { font-size: 1.5em; }
        .prose h2 { font-size: 1.3em; }
        .prose h3 { font-size: 1.15em; }
        
        .prose p {
          margin-bottom: 1em;
          text-align: justify;
        }
        
        .prose ul, .prose ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .prose li {
          margin-bottom: 0.5em;
        }
        
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        
        .prose th, .prose td {
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          text-align: left;
        }
        
        .prose th {
          background-color: #f9fafb;
          font-weight: bold;
        }
        
        .prose strong {
          font-weight: bold;
        }
        
        .prose em {
          font-style: italic;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .prose {
            padding: 16px;
          }
          
          .prose table {
            font-size: 0.9em;
          }
          
          .prose th, .prose td {
            padding: 6px 8px;
          }
        }
      `}</style>
    </div>
  )
} 