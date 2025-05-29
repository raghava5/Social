'use client'

import React, { useState, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import InlinePDFViewer from './InlinePDFViewer'
import InlineDocxViewer from './InlineDocxViewer'
import { ArrowDownTrayIcon, DocumentIcon } from '@heroicons/react/24/outline'

interface InlineDocumentViewerProps {
  url: string
  fileName?: string
  className?: string
  onFullScreen?: () => void
  lazyLoad?: boolean
}

export default function InlineDocumentViewer({ 
  url, 
  fileName = 'Document',
  className = '',
  onFullScreen,
  lazyLoad = true
}: InlineDocumentViewerProps) {
  const [hasLoaded, setHasLoaded] = useState(!lazyLoad)
  
  // Intersection observer for lazy loading
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  // Load document when it comes into view
  React.useEffect(() => {
    if (inView && !hasLoaded) {
      setHasLoaded(true)
    }
  }, [inView, hasLoaded])

  // Determine file type from filename or URL
  const getFileType = (): 'pdf' | 'docx' | 'doc' | 'unknown' => {
    const fileNameLower = fileName.toLowerCase()
    const urlLower = url.toLowerCase()
    
    if (fileNameLower.endsWith('.pdf') || urlLower.includes('.pdf')) {
      return 'pdf'
    }
    if (fileNameLower.endsWith('.docx') || urlLower.includes('.docx')) {
      return 'docx'
    }
    if (fileNameLower.endsWith('.doc') || urlLower.includes('.doc')) {
      return 'doc'
    }
    
    // Try to detect from URL patterns
    if (urlLower.includes('pdf')) return 'pdf'
    if (urlLower.includes('docx') || urlLower.includes('doc')) return 'docx'
    
    return 'unknown'
  }

  const fileType = getFileType()

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
  }

  // Render placeholder while lazy loading
  if (!hasLoaded) {
    return (
      <div ref={ref} className={`document-placeholder ${className}`}>
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DocumentIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 truncate max-w-xs">
                {fileName}
              </h4>
              <p className="text-xs text-gray-500 uppercase">
                {fileType === 'unknown' ? 'Document' : fileType} • Click to load
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setHasLoaded(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Load Preview
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
      </div>
    )
  }

  // Render appropriate viewer based on file type
  if (fileType === 'pdf') {
    return (
      <InlinePDFViewer
        url={url}
        fileName={fileName}
        className={className}
        onFullScreen={onFullScreen}
      />
    )
  }

  if (fileType === 'docx' || fileType === 'doc') {
    return (
      <InlineDocxViewer
        url={url}
        fileName={fileName}
        className={className}
        onFullScreen={onFullScreen}
      />
    )
  }

  // Fallback for unknown file types
  return (
    <div className={`document-fallback ${className}`}>
      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <DocumentIcon className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 truncate max-w-xs">
              {fileName}
            </h4>
            <p className="text-xs text-gray-500">
              Document • Preview not available
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onFullScreen && (
            <button
              onClick={onFullScreen}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              View in Fullscreen
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            title="Download document"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6 text-center border border-gray-200 border-t-0 rounded-b-lg bg-white">
        <p className="text-gray-600 mb-4">
          Preview not available for this file type. Click to download and view with a compatible application.
        </p>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Download {fileName}
        </button>
      </div>
    </div>
  )
} 