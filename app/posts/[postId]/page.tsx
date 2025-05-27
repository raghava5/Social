'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { usePostInteractions } from '@/hooks/usePostInteractions'
import PostCard from '@/app/components/PostCard'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import ErrorBoundary from '@/app/components/ErrorBoundary'

interface Post {
  id: string
  content: string
  images?: string
  videos?: string
  audios?: string
  documents?: string
  likes: any[]
  comments: any[]
  shares: number
  createdAt: string
  updatedAt?: string
  isEdited?: boolean
  spoke?: string
  location?: string
  feeling?: string
  tags?: string[]
  type?: string
  isLikedByCurrentUser?: boolean
  author: {
    id: string
    name: string
    username?: string
    avatar?: string
    profileImageUrl?: string
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { likePost, commentOnPost, sharePost } = usePostInteractions()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const postId = params?.postId as string

  useEffect(() => {
    if (!postId) return

    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/posts/${postId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Post not found')
          } else {
            setError('Failed to load post')
          }
          return
        }

        const data = await response.json()
        setPost(data.post)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  const handleLike = async (postId: string) => {
    try {
      const result = await likePost(postId)
      if (post && result) {
        setPost({
          ...post,
          isLikedByCurrentUser: result.liked,
          likes: result.liked 
            ? [...post.likes, { userId: user?.id }]
            : post.likes.filter(like => like.userId !== user?.id)
        })
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const handleComment = async (postId: string, content: string) => {
    try {
      const result = await commentOnPost(postId, content)
      if (post && result) {
        setPost({
          ...post,
          comments: [...post.comments, result.comment]
        })
      }
    } catch (error) {
      console.error('Failed to comment on post:', error)
    }
  }

  const handleShare = async (postId: string) => {
    try {
      await sharePost(postId)
      if (post) {
        setPost({
          ...post,
          shares: post.shares + 1
        })
      }
    } catch (error) {
      console.error('Failed to share post:', error)
    }
  }

  const handleEdit = async (postId: string, updatedPost: any) => {
    try {
      const response = await fetch(`/api/posts/${postId}/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost)
      })

      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      }
    } catch (error) {
      console.error('Failed to edit post:', error)
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/delete`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/home')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const handleSave = async (postId: string) => {
    try {
      await fetch(`/api/posts/${postId}/save`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Failed to save post:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || 'Post not found'}
              </h2>
              <p className="text-gray-600">
                This post may have been deleted or you don't have permission to view it.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
        
        <ErrorBoundary>
          <PostCard
            id={post.id}
            author={post.author}
            content={post.content}
            images={post.images}
            videos={post.videos}
            audios={post.audios}
            documents={post.documents}
            likes={post.likes}
            comments={post.comments}
            shares={post.shares}
            createdAt={post.createdAt}
            updatedAt={post.updatedAt}
            isEdited={post.isEdited}
            spoke={post.spoke}
            location={post.location}
            feeling={post.feeling}
            tags={post.tags}
            type={post.type}
            isLikedByCurrentUser={post.isLikedByCurrentUser}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSave={handleSave}
            currentUserId={user?.id}
          />
        </ErrorBoundary>
      </div>
    </div>
  )
} 