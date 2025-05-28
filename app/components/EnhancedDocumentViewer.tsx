'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  DocumentIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  TableCellsIcon,
  PresentationChartBarIcon,
  DocumentChartBarIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline'

interface EnhancedDocumentViewerProps {
  documents: string
  postId?: string
  isOpen: boolean
  onClose: () => void
  initialDocumentIndex?: number
}

interface DocumentInfo {
  url: string
  name: string
  extension: string
  type: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'txt' | 'csv' | 'rtf' | 'unknown'
  icon: string
  color: string
}

const DOCUMENT_ICONS = {
  pdf: '📄',
  doc: '📝',
  docx: '📝',
  xls: '📊',
  xlsx: '📊',
  ppt: '📋',
  pptx: '📋',
  txt: '📃',
  csv: '📈',
  rtf: '📝',
  unknown: '📄'
}

const DOCUMENT_COLORS = {
  pdf: 'bg-red-100 text-red-600 border-red-200',
  doc: 'bg-blue-100 text-blue-600 border-blue-200',
  docx: 'bg-blue-100 text-blue-600 border-blue-200',
  xls: 'bg-green-100 text-green-600 border-green-200',
  xlsx: 'bg-green-100 text-green-600 border-green-200',
  ppt: 'bg-orange-100 text-orange-600 border-orange-200',
  pptx: 'bg-orange-100 text-orange-600 border-orange-200',
  txt: 'bg-gray-100 text-gray-600 border-gray-200',
  csv: 'bg-purple-100 text-purple-600 border-purple-200',
  rtf: 'bg-indigo-100 text-indigo-600 border-indigo-200',
  unknown: 'bg-gray-100 text-gray-600 border-gray-200'
}

export default function EnhancedDocumentViewer({
  documents,
  postId,
  isOpen,
  onClose,
  initialDocumentIndex = 0
}: EnhancedDocumentViewerProps) {
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(initialDocumentIndex)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [documentContent, setDocumentContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTextToSpeechActive, setIsTextToSpeechActive] = useState(false)
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  
  const viewerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Parse documents
  const documentList: DocumentInfo[] = React.useMemo(() => {
    if (!documents) return []
    
    return documents.split(',').map(doc => {
      const url = doc.trim()
      const name = url.split('/').pop() || 'Document'
      const extension = name.split('.').pop()?.toLowerCase() || 'unknown'
      const type = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'].includes(extension) 
        ? extension as DocumentInfo['type'] 
        : 'unknown'
      
      return {
        url,
        name,
        extension,
        type,
        icon: DOCUMENT_ICONS[type],
        color: DOCUMENT_COLORS[type]
      }
    }).filter(doc => doc.url)
  }, [documents])

  const currentDocument = documentList[currentDocumentIndex]

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis)
    }
  }, [])

  // Load document content for preview
  useEffect(() => {
    if (!currentDocument || !isOpen) return

    const loadDocumentContent = async () => {
      setIsLoading(true)
      setError(null)
      setDocumentContent(null)

      try {
        // For text files, try to fetch content directly
        if (currentDocument.type === 'txt' || currentDocument.type === 'csv') {
          const response = await fetch(currentDocument.url)
          if (response.ok) {
            const text = await response.text()
            if (currentDocument.type === 'csv') {
              setDocumentContent(convertCSVToHTML(text))
            } else {
              setDocumentContent(`<pre style="white-space: pre-wrap; font-family: monospace; line-height: 1.6; padding: 20px;">${escapeHtml(text)}</pre>`)
            }
          } else {
            throw new Error('Failed to load document content')
          }
        } else {
          // For other document types, show a preview placeholder
          setDocumentContent(generateDocumentPreview(currentDocument))
        }
      } catch (err) {
        console.error('Error loading document:', err)
        setError('Failed to load document content')
        setDocumentContent(generateDocumentPreview(currentDocument))
      } finally {
        setIsLoading(false)
      }
    }

    loadDocumentContent()
  }, [currentDocument, isOpen])

  const convertCSVToHTML = (csvText: string): string => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length === 0) return '<p>Empty CSV file</p>'
    
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }
    
    const headers = parseCSVLine(lines[0])
    const rows = lines.slice(1).map(line => parseCSVLine(line))
    
    let html = `
      <style>
        .csv-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .csv-table th {
          background-color: #4f46e5;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
        }
        .csv-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .csv-table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .csv-table tr:hover {
          background-color: #f3f4f6;
        }
      </style>
      <table class="csv-table">
        <thead><tr>
    `
    
    headers.forEach(header => {
      html += `<th>${escapeHtml(header)}</th>`
    })
    
    html += `</tr></thead><tbody>`
    
    rows.forEach(row => {
      html += '<tr>'
      headers.forEach((_, index) => {
        const cellValue = row[index] || ''
        html += `<td>${escapeHtml(cellValue)}</td>`
      })
      html += '</tr>'
    })
    
    html += `</tbody></table>`
    return html
  }

  const generateDocumentPreview = (doc: DocumentInfo): string => {
    const typeNames = {
      pdf: 'PDF Document',
      doc: 'Word Document',
      docx: 'Word Document',
      xls: 'Excel Spreadsheet',
      xlsx: 'Excel Spreadsheet',
      ppt: 'PowerPoint Presentation',
      pptx: 'PowerPoint Presentation',
      txt: 'Text Document',
      csv: 'CSV Spreadsheet',
      rtf: 'Rich Text Document',
      unknown: 'Document'
    }

    return `
      <div style="text-align: center; padding: 60px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white; margin: 20px;">
        <div style="font-size: 64px; margin-bottom: 24px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
          ${doc.icon}
        </div>
        <h2 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 600;">${typeNames[doc.type]}</h2>
        <p style="margin: 0 0 24px 0; font-size: 16px; opacity: 0.9;">${doc.name}</p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <a href="${doc.url}" target="_blank" rel="noopener noreferrer" 
             style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; color: white; text-decoration: none; font-weight: 500; backdrop-filter: blur(10px); transition: all 0.3s ease;">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Download
          </a>
          <button onclick="window.open('${doc.url}', '_blank')" 
                  style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; color: white; font-weight: 500; backdrop-filter: blur(10px); transition: all 0.3s ease; cursor: pointer;">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
            </svg>
            Open in New Tab
          </button>
        </div>
      </div>
    `
  }

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      viewerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const toggleTextToSpeech = () => {
    if (!speechSynthesis) return

    if (isTextToSpeechActive && currentUtterance) {
      speechSynthesis.cancel()
      setIsTextToSpeechActive(false)
      setCurrentUtterance(null)
    } else if (documentContent) {
      // Extract text from HTML content
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = documentContent
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      
      if (textContent.trim()) {
        const utterance = new SpeechSynthesisUtterance(textContent)
        utterance.rate = 0.8
        utterance.pitch = 1
        utterance.volume = 1
        
        utterance.onend = () => {
          setIsTextToSpeechActive(false)
          setCurrentUtterance(null)
        }
        
        utterance.onerror = () => {
          setIsTextToSpeechActive(false)
          setCurrentUtterance(null)
        }
        
        setCurrentUtterance(utterance)
        setIsTextToSpeechActive(true)
        speechSynthesis.speak(utterance)
      }
    }
  }

  const navigateDocument = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDocumentIndex > 0) {
      setCurrentDocumentIndex(currentDocumentIndex - 1)
    } else if (direction === 'next' && currentDocumentIndex < documentList.length - 1) {
      setCurrentDocumentIndex(currentDocumentIndex + 1)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          navigateDocument('prev')
          break
        case 'ArrowRight':
          navigateDocument('next')
          break
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            // Focus search input
          }
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentDocumentIndex, documentList.length])

  if (!isOpen || !currentDocument) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div 
        ref={viewerRef}
        className={`bg-white rounded-lg shadow-xl max-w-7xl max-h-[95vh] w-full mx-4 flex flex-col ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'
        } ${isFullscreen ? 'max-w-none max-h-none h-full rounded-none' : ''}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="text-2xl">{currentDocument.icon}</div>
            <div>
              <h3 className="text-lg font-medium truncate">{currentDocument.name}</h3>
              <p className="text-sm text-gray-500">
                {currentDocumentIndex + 1} of {documentList.length} documents
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search in document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-8 pr-3 py-1 text-sm border rounded ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <MagnifyingGlassIcon className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
            </div>
            
            {/* Text-to-Speech */}
            {speechSynthesis && (
              <button
                onClick={toggleTextToSpeech}
                className={`p-2 hover:bg-gray-100 rounded ${
                  isTextToSpeechActive ? 'text-blue-600' : 'text-gray-600'
                }`}
                title={isTextToSpeechActive ? 'Stop reading' : 'Read aloud'}
              >
                {isTextToSpeechActive ? (
                  <SpeakerXMarkIcon className="h-4 w-4" />
                ) : (
                  <SpeakerWaveIcon className="h-4 w-4" />
                )}
              </button>
            )}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-gray-100 rounded"
              title="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
            
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 rounded"
              title="Toggle fullscreen"
            >
              {isFullscreen ? 
                <ArrowsPointingInIcon className="h-4 w-4" /> : 
                <ArrowsPointingOutIcon className="h-4 w-4" />
              }
            </button>
            
            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
              title="Close viewer"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3">Loading document...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-red-600">
              <DocumentIcon className="h-16 w-16 mb-4" />
              <p>{error}</p>
            </div>
          ) : documentContent ? (
            <div 
              className={`p-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              dangerouslySetInnerHTML={{ __html: documentContent }}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <DocumentIcon className="h-16 w-16 text-gray-400" />
              <p className="mt-4 text-gray-500">No preview available</p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {documentList.length > 1 && (
          <div className={`flex items-center justify-between p-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={() => navigateDocument('prev')}
              disabled={currentDocumentIndex <= 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span>Previous</span>
            </button>
            
            <div className="flex items-center space-x-2">
              {documentList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentDocumentIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentDocumentIndex 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => navigateDocument('next')}
              disabled={currentDocumentIndex >= documentList.length - 1}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 