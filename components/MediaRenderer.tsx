'use client'

import React, { useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import EnhancedDocumentViewer from '../app/components/EnhancedDocumentViewer'
import { EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface MediaRendererProps {
  images?: string | null
  videos?: string | null  
  audios?: string | null
  documents?: string | null
  postId?: string
}

export function MediaRenderer({ images, videos, audios, documents, postId }: MediaRendererProps) {
  return (
    <ErrorBoundary fallback={<div className="text-gray-500 text-sm">Media content unavailable</div>}>
      <div className="mt-3 space-y-3">
        {images && <ImageRenderer images={images} postId={postId} />}
        {videos && <VideoRenderer videos={videos} postId={postId} />}
        {audios && <AudioRenderer audios={audios} postId={postId} />}
        {documents && <DocumentRenderer documents={documents} postId={postId} />}
      </div>
    </ErrorBoundary>
  )
}

function ImageRenderer({ images, postId }: { images: string, postId?: string }) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  
  try {
    const imageUrls = images.split(',').map(url => url.trim()).filter(Boolean)
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {imageUrls.map((img, index) => {
          if (failedImages.has(img)) {
            return (
              <div key={index} className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
                <div className="text-2xl mb-2">🖼️</div>
                <div className="text-sm">Image unavailable</div>
              </div>
            )
          }
          
          return (
            <img
              key={index}
              src={img.startsWith('http') ? img : `/uploads/images/${img}`}
              alt={`Post image ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
              loading="lazy"
              onError={() => {
                console.warn(`Failed to load image: ${img}`)
                setFailedImages(prev => new Set([...prev, img]))
              }}
            />
          )
        })}
      </div>
    )
  } catch (error) {
    console.error('Error rendering images:', error)
    return <div className="text-gray-500 text-sm">Images unavailable</div>
  }
}

function VideoRenderer({ videos, postId }: { videos: string, postId?: string }) {
  const [failedVideos, setFailedVideos] = useState<Set<string>>(new Set())
  
  try {
    const videoUrls = videos.split(',').map(url => url.trim()).filter(Boolean)
    
    return (
      <div className="space-y-3">
        {videoUrls.map((video, index) => {
          if (failedVideos.has(video)) {
            return (
              <div key={index} className="bg-gray-100 p-6 rounded-lg text-center text-gray-500">
                <div className="text-3xl mb-2">🎥</div>
                <div className="text-sm">Video unavailable</div>
                <div className="text-xs text-gray-400 mt-1">{video}</div>
              </div>
            )
          }
          
          return (
            <video
              key={index}
              src={video.startsWith('http') ? video : `/uploads/videos/${video}`}
              controls
              className="w-full max-h-96 rounded-lg"
              preload="metadata"
              onError={() => {
                console.warn(`Failed to load video: ${video}`)
                setFailedVideos(prev => new Set([...prev, video]))
              }}
            >
              Your browser does not support the video tag.
            </video>
          )
        })}
      </div>
    )
  } catch (error) {
    console.error('Error rendering videos:', error)
    return <div className="text-gray-500 text-sm">Videos unavailable</div>
  }
}

function AudioRenderer({ audios, postId }: { audios: string, postId?: string }) {
  const [failedAudios, setFailedAudios] = useState<Set<string>>(new Set())
  
  try {
    const audioUrls = audios.split(',').map(url => url.trim()).filter(Boolean)
    
    return (
      <div className="space-y-3">
        {audioUrls.map((audio, index) => {
          if (failedAudios.has(audio)) {
            return (
              <div key={index} className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
                <div className="text-2xl mb-2">🎵</div>
                <div className="text-sm">Audio unavailable</div>
                <div className="text-xs text-gray-400 mt-1">{audio}</div>
              </div>
            )
          }
          
          return (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <audio
                src={audio.startsWith('http') ? audio : `/uploads/audios/${audio}`}
                controls
                className="w-full"
                preload="metadata"
                onError={() => {
                  console.warn(`Failed to load audio: ${audio}`)
                  setFailedAudios(prev => new Set([...prev, audio]))
                }}
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
          )
        })}
      </div>
    )
  } catch (error) {
    console.error('Error rendering audios:', error)
    return <div className="text-gray-500 text-sm">Audio unavailable</div>
  }
}

function DocumentRenderer({ documents, postId }: { documents: string, postId?: string }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState(0)
  
  try {
    const docUrls = documents.split(',').map(url => url.trim()).filter(Boolean)
    
    const getDocumentIcon = (filename: string) => {
      const extension = filename.split('.').pop()?.toLowerCase() || ''
      const icons = {
        pdf: '📄',
        doc: '📝',
        docx: '📝',
        xls: '📊',
        xlsx: '📊',
        ppt: '📋',
        pptx: '📋',
        txt: '📃',
        csv: '📈',
        rtf: '📝'
      }
      return icons[extension as keyof typeof icons] || '📄'
    }

    const getDocumentColor = (filename: string) => {
      const extension = filename.split('.').pop()?.toLowerCase() || ''
      const colors = {
        pdf: 'bg-red-50 border-red-200 hover:bg-red-100',
        doc: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
        docx: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
        xls: 'bg-green-50 border-green-200 hover:bg-green-100',
        xlsx: 'bg-green-50 border-green-200 hover:bg-green-100',
        ppt: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
        pptx: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
        txt: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
        csv: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
        rtf: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
      }
      return colors[extension as keyof typeof colors] || 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }

    const openViewer = (index: number) => {
      setSelectedDocumentIndex(index)
      setIsViewerOpen(true)
    }
    
    return (
      <>
        <div className="space-y-3">
          {docUrls.map((doc, index) => {
            const filename = doc.split('/').pop() || doc
            const docUrl = doc.startsWith('http') ? doc : `/uploads/documents/${doc}`
            const extension = filename.split('.').pop()?.toLowerCase() || ''
            const fileSize = ''; // We don't have file size info here
            
            return (
              <div 
                key={index} 
                className={`border rounded-lg p-4 transition-all duration-200 ${getDocumentColor(filename)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-white shadow-sm flex items-center justify-center text-xl">
                        {getDocumentIcon(filename)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {filename}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span className="uppercase font-medium">{extension}</span>
                        {fileSize && <span>• {fileSize}</span>}
                        <span>• Document</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Preview Button */}
                    <button
                      onClick={() => openViewer(index)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Preview document"
                    >
                      <EyeIcon className="h-3 w-3 mr-1" />
                      Preview
                    </button>
                    
                    {/* Download Button */}
                    <a
                      href={docUrl}
                      download={filename}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Download document"
                      onClick={(e) => {
                        // Check if file exists before downloading
                        fetch(docUrl, { method: 'HEAD' })
                          .catch(() => {
                            e.preventDefault()
                            alert('Document not found')
                          })
                      }}
                    >
                      <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                      Download
                    </a>
                  </div>
                </div>
                
                {/* Quick Info */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Click Preview for interactive viewing</span>
                    <span>Supports search, zoom, and text-to-speech</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Enhanced Document Viewer */}
        <EnhancedDocumentViewer
          documents={documents}
          postId={postId}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          initialDocumentIndex={selectedDocumentIndex}
        />
      </>
    )
  } catch (error) {
    console.error('Error rendering documents:', error)
    return <div className="text-gray-500 text-sm">Documents unavailable</div>
  }
} 