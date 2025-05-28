'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
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
} from '@heroicons/react/24/outline'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface DocumentFile {
  id: string
  file: File
  url: string
  name: string
  size: number
  type: string
  extension: string
  preview?: string
  metadata?: {
    pages?: number
    title?: string
    author?: string
    subject?: string
    keywords?: string
    creator?: string
    producer?: string
    creationDate?: string
    modificationDate?: string
  }
  conversionStatus?: 'pending' | 'converting' | 'completed' | 'failed'
  htmlContent?: string
  textContent?: string
}

interface DocumentUploaderProps {
  onFilesChange: (files: DocumentFile[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  showPreview?: boolean
  enableConversion?: boolean
}

const DEFAULT_ACCEPTED_TYPES = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.rtf', '.odt', '.ods', '.odp'
]

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
  odt: '📝',
  ods: '📊',
  odp: '📋',
  default: '📄'
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
  odt: 'bg-blue-100 text-blue-600 border-blue-200',
  ods: 'bg-green-100 text-green-600 border-green-200',
  odp: 'bg-orange-100 text-orange-600 border-orange-200',
  default: 'bg-gray-100 text-gray-600 border-gray-200'
}

export default function DocumentUploader({
  onFilesChange,
  maxFiles = 10,
  maxFileSize = 50, // 50MB default
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  showPreview = true,
  enableConversion = true
}: DocumentUploaderProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentFile | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [conversionProgress, setConversionProgress] = useState<{ [key: string]: number }>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Update parent component when documents change
  useEffect(() => {
    onFilesChange(documents)
  }, [documents, onFilesChange])

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  const getFileIcon = (extension: string): string => {
    return DOCUMENT_ICONS[extension as keyof typeof DOCUMENT_ICONS] || DOCUMENT_ICONS.default
  }

  const getFileColor = (extension: string): string => {
    return DOCUMENT_COLORS[extension as keyof typeof DOCUMENT_COLORS] || DOCUMENT_COLORS.default
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    const extension = getFileExtension(file.name)
    
    if (!acceptedTypes.some(type => type.includes(extension))) {
      return `File type .${extension} is not supported`
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`
    }
    
    if (documents.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`
    }
    
    return null
  }

  const extractMetadata = async (file: File): Promise<DocumentFile['metadata']> => {
    const extension = getFileExtension(file.name)
    
    if (extension === 'pdf') {
      try {
        // For PDF files, we can extract metadata using PDF.js
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
        const metadata = await pdf.getMetadata()
        
        // Type the metadata info properly
        const info = metadata.info as any
        
        return {
          pages: pdf.numPages,
          title: info?.Title || undefined,
          author: info?.Author || undefined,
          subject: info?.Subject || undefined,
          keywords: info?.Keywords || undefined,
          creator: info?.Creator || undefined,
          producer: info?.Producer || undefined,
          creationDate: info?.CreationDate || undefined,
          modificationDate: info?.ModDate || undefined,
        }
      } catch (error) {
        console.warn('Failed to extract PDF metadata:', error)
      }
    }
    
    return {}
  }

  const convertDocument = async (document: DocumentFile): Promise<void> => {
    if (!enableConversion) return
    
    setDocuments(prev => prev.map(doc => 
      doc.id === document.id 
        ? { ...doc, conversionStatus: 'converting' }
        : doc
    ))
    
    try {
      // Simulate conversion progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setConversionProgress(prev => ({ ...prev, [document.id]: progress }))
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // In a real implementation, this would call the conversion API
      // For now, we'll simulate successful conversion
      const htmlContent = await generatePreviewContent(document)
      
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { 
              ...doc, 
              conversionStatus: 'completed',
              htmlContent,
              textContent: extractTextFromHTML(htmlContent)
            }
          : doc
      ))
      
    } catch (error) {
      console.error('Document conversion failed:', error)
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, conversionStatus: 'failed' }
          : doc
      ))
    } finally {
      setConversionProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[document.id]
        return newProgress
      })
    }
  }

  const generatePreviewContent = async (document: DocumentFile): Promise<string> => {
    const extension = getFileExtension(document.name)
    
    if (extension === 'txt' || extension === 'csv') {
      // For text files, read content directly
      const text = await document.file.text()
      if (extension === 'csv') {
        return convertCSVToHTML(text)
      }
      return `<pre style="white-space: pre-wrap; font-family: monospace;">${text}</pre>`
    }
    
    // For other formats, return a placeholder
    return `<div class="document-preview">
      <h3>${document.name}</h3>
      <p>Document preview will be available after conversion.</p>
      <p>File type: ${extension.toUpperCase()}</p>
      <p>Size: ${formatFileSize(document.size)}</p>
    </div>`
  }

  const convertCSVToHTML = (csvText: string): string => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length === 0) return '<p>Empty CSV file</p>'
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')))
    
    let html = '<table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">'
    html += '<thead><tr>'
    headers.forEach(header => {
      html += `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">${header}</th>`
    })
    html += '</tr></thead><tbody>'
    
    rows.forEach(row => {
      html += '<tr>'
      row.forEach(cell => {
        html += `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`
      })
      html += '</tr>'
    })
    
    html += '</tbody></table>'
    return html
  }

  const extractTextFromHTML = (html: string): string => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        alert(validationError)
        continue
      }
      
      const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const url = URL.createObjectURL(file)
      const extension = getFileExtension(file.name)
      
      const documentFile: DocumentFile = {
        id,
        file,
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        extension,
        conversionStatus: 'pending'
      }
      
      setDocuments(prev => [...prev, documentFile])
      
      // Extract metadata
      try {
        const metadata = await extractMetadata(file)
        setDocuments(prev => prev.map(doc => 
          doc.id === id ? { ...doc, metadata } : doc
        ))
      } catch (error) {
        console.warn('Failed to extract metadata:', error)
      }
      
      // Start conversion if enabled
      if (enableConversion) {
        setTimeout(() => convertDocument(documentFile), 500)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
    e.target.value = '' // Reset input
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeDocument = (id: string) => {
    setDocuments(prev => {
      const doc = prev.find(d => d.id === id)
      if (doc) {
        URL.revokeObjectURL(doc.url)
      }
      return prev.filter(d => d.id !== id)
    })
  }

  const openViewer = (document: DocumentFile) => {
    setSelectedDocument(document)
    setIsViewerOpen(true)
  }

  const closeViewer = () => {
    setIsViewerOpen(false)
    setSelectedDocument(null)
  }

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            Drop documents here or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Supports: {acceptedTypes.join(', ')} • Max {maxFileSize}MB per file • Up to {maxFiles} files
          </p>
        </div>
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Documents ({documents.length}/{maxFiles})
          </h4>
          
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onRemove={removeDocument}
              onView={openViewer}
              conversionProgress={conversionProgress[doc.id]}
              showPreview={showPreview}
            />
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      {isViewerOpen && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={closeViewer}
        />
      )}
    </div>
  )
}

// Document Card Component
interface DocumentCardProps {
  document: DocumentFile
  onRemove: (id: string) => void
  onView: (document: DocumentFile) => void
  conversionProgress?: number
  showPreview: boolean
}

function DocumentCard({ document, onRemove, onView, conversionProgress, showPreview }: DocumentCardProps) {
  const colorClass = DOCUMENT_COLORS[document.extension as keyof typeof DOCUMENT_COLORS] || DOCUMENT_COLORS.default
  const icon = DOCUMENT_ICONS[document.extension as keyof typeof DOCUMENT_ICONS] || DOCUMENT_ICONS.default
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  return (
    <div className={`border rounded-lg p-4 ${colorClass}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="text-2xl">{icon}</div>
          
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-medium truncate">{document.name}</h5>
            <div className="text-xs opacity-75 space-y-1">
              <p>{formatFileSize(document.size)} • {document.extension.toUpperCase()}</p>
              {document.metadata?.pages && (
                <p>{document.metadata.pages} pages</p>
              )}
              {document.metadata?.author && (
                <p>Author: {document.metadata.author}</p>
              )}
            </div>
            
            {/* Conversion Status */}
            {document.conversionStatus && (
              <div className="mt-2">
                {document.conversionStatus === 'converting' && conversionProgress !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${conversionProgress}%` }}
                    />
                  </div>
                )}
                <p className="text-xs mt-1">
                  {document.conversionStatus === 'pending' && 'Preparing...'}
                  {document.conversionStatus === 'converting' && `Converting... ${conversionProgress || 0}%`}
                  {document.conversionStatus === 'completed' && '✅ Ready for preview'}
                  {document.conversionStatus === 'failed' && '❌ Conversion failed'}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {showPreview && document.conversionStatus === 'completed' && (
            <button
              onClick={() => onView(document)}
              className="p-1.5 hover:bg-white hover:bg-opacity-50 rounded"
              title="Preview document"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          )}
          
          <a
            href={document.url}
            download={document.name}
            className="p-1.5 hover:bg-white hover:bg-opacity-50 rounded"
            title="Download document"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </a>
          
          <button
            onClick={() => onRemove(document.id)}
            className="p-1.5 hover:bg-white hover:bg-opacity-50 rounded"
            title="Remove document"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Document Viewer Component
interface DocumentViewerProps {
  document: DocumentFile
  onClose: () => void
}

function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [scale, setScale] = useState(1.0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const viewerRef = useRef<HTMLDivElement>(null)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      viewerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (window.document.fullscreenElement) {
        window.document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!window.document.fullscreenElement)
    }
    
    window.document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => window.document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div 
        ref={viewerRef}
        className={`bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium truncate">{document.name}</h3>
            {numPages && (
              <span className="text-sm text-gray-500">
                Page {currentPage} of {numPages}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
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
            
            {/* Controls */}
            <button
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
              className="p-1 hover:bg-gray-100 rounded"
              title="Zoom out"
            >
              -
            </button>
            <span className="text-sm px-2">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
              className="p-1 hover:bg-gray-100 rounded"
              title="Zoom in"
            >
              +
            </button>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Toggle dark mode"
            >
              {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-1 hover:bg-gray-100 rounded"
              title="Toggle fullscreen"
            >
              {isFullscreen ? 
                <ArrowsPointingInIcon className="h-4 w-4" /> : 
                <ArrowsPointingOutIcon className="h-4 w-4" />
              }
            </button>
            
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              title="Close"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {document.extension === 'pdf' ? (
            <div className="flex flex-col items-center">
              <Document
                file={document.file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="max-w-full"
              >
                <Page 
                  pageNumber={currentPage} 
                  scale={scale}
                  className="shadow-lg"
                />
              </Document>
            </div>
          ) : document.htmlContent ? (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: document.htmlContent }}
            />
          ) : (
            <div className="text-center py-8">
              <DocumentIcon className="mx-auto h-16 w-16 text-gray-400" />
              <p className="mt-4 text-gray-500">Preview not available for this file type</p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {numPages && numPages > 1 && (
          <div className={`flex items-center justify-center space-x-4 p-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            
            <span className="text-sm">
              Page {currentPage} of {numPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
              disabled={currentPage >= numPages}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 