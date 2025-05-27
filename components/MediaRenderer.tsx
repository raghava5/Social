'use client'

import React, { useState } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

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
  try {
    const docUrls = documents.split(',').map(url => url.trim()).filter(Boolean)
    
    return (
      <div className="space-y-2">
        {docUrls.map((doc, index) => {
          const filename = doc.split('/').pop() || doc
          const docUrl = doc.startsWith('http') ? doc : `/uploads/documents/${doc}`
          
          return (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mr-3">📄</div>
              <div className="flex-1">
                <div className="font-medium text-sm">{filename}</div>
                <a 
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  onClick={(e) => {
                    // Check if file exists before opening
                    fetch(docUrl, { method: 'HEAD' })
                      .catch(() => {
                        e.preventDefault()
                        alert('Document not found')
                      })
                  }}
                >
                  Open Document →
                </a>
              </div>
            </div>
          )
        })}
      </div>
    )
  } catch (error) {
    console.error('Error rendering documents:', error)
    return <div className="text-gray-500 text-sm">Documents unavailable</div>
  }
} 