'use client'

import React, { useState, useEffect } from 'react'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { ArrowsPointingOutIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

interface InlinePDFViewerProps {
  url: string
  fileName?: string
  className?: string
  onFullScreen?: () => void
}

export default function InlinePDFViewer({ 
  url, 
  fileName = 'Document',
  className = '',
  onFullScreen 
}: InlinePDFViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create default layout plugin with minimal toolbar
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [], // Hide sidebar
  })

  const handleDocumentLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleDocumentError = () => {
    setIsLoading(false)
    setError('Failed to load PDF document')
  }

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

  return (
    <div className={`inline-pdf-viewer ${className}`}>
      {/* Document Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📄</span>
          <div>
            <h4 className="text-sm font-medium text-gray-900 truncate max-w-xs">
              {fileName}
            </h4>
            <p className="text-xs text-gray-500">PDF Document</p>
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
            title="Download PDF"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Viewer Container */}
      <div 
        className={`pdf-container bg-white border border-gray-200 rounded-b-lg overflow-hidden transition-all duration-300 ${
          isExpanded ? 'h-[800px]' : 'h-[400px]'
        }`}
      >
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 mb-2">❌ {error}</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Download PDF Instead
              </button>
            </div>
          </div>
        )}

        {!error && (
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
            <div className="h-full">
              <Viewer
                fileUrl={url}
                plugins={[defaultLayoutPluginInstance]}
                onDocumentLoad={handleDocumentLoad}
              />
            </div>
          </Worker>
        )}
      </div>

      <style jsx>{`
        .inline-pdf-viewer {
          max-width: 100%;
          margin: 0 auto;
        }
        
        /* Hide some default PDF.js toolbar items for cleaner look */
        .rpv-core__viewer .rpv-toolbar {
          background-color: #f8f9fa;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 12px;
        }
        
        .rpv-core__viewer .rpv-toolbar__item {
          margin: 0 2px;
        }
        
        /* Smooth scrolling within PDF */
        .rpv-core__inner-page {
          scroll-behavior: smooth;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .rpv-toolbar {
            padding: 6px 8px;
          }
          
          .rpv-toolbar__item {
            margin: 0 1px;
          }
        }
      `}</style>
    </div>
  )
} 