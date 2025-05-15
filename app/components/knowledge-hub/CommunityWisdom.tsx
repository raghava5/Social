'use client'

import { useState } from 'react'
import {
  ChatBubbleLeftIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  FlagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  upvotes: number
  downvotes: number
}

interface Post {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  tags: string[]
  upvotes: number
  downvotes: number
  comments: Comment[]
}

interface CommunityWisdomProps {
  posts: Post[]
  onUpvote: (postId: string) => void
  onDownvote: (postId: string) => void
  onReport: (postId: string) => void
  onAddComment: (postId: string, comment: string) => void
}

export default function CommunityWisdom({
  posts,
  onUpvote,
  onDownvote,
  onReport,
  onAddComment,
}: CommunityWisdomProps) {
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})
  const [expandedPost, setExpandedPost] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
          {/* Post header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <UserCircleIcon className="h-10 w-10 text-gray-400" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Posted by {post.author.name} • {post.createdAt}
                </p>
              </div>
            </div>
            <button
              onClick={() => onReport(post.id)}
              className="text-gray-400 hover:text-gray-500"
            >
              <FlagIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Post content */}
          <div className="mt-4">
            <p className="text-gray-600">{post.content}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Post actions */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onUpvote(post.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <HandThumbUpIcon className="h-5 w-5" />
                <span>{post.upvotes}</span>
              </button>
              <button
                onClick={() => onDownvote(post.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <HandThumbDownIcon className="h-5 w-5" />
                <span>{post.downvotes}</span>
              </button>
              <button
                onClick={() => setExpandedPost(post.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
                <span>{post.comments.length} comments</span>
              </button>
            </div>
          </div>

          {/* Comments section */}
          {expandedPost === post.id && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold mb-4">Comments</h4>
              <div className="space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    {comment.author.avatar ? (
                      <img
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.author.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {comment.createdAt}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {comment.content}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          <HandThumbUpIcon className="h-4 w-4 inline mr-1" />
                          {comment.upvotes}
                        </button>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          <HandThumbDownIcon className="h-4 w-4 inline mr-1" />
                          {comment.downvotes}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add comment form */}
                <div className="mt-4">
                  <textarea
                    value={newComment[post.id] || ''}
                    onChange={(e) =>
                      setNewComment({
                        ...newComment,
                        [post.id]: e.target.value,
                      })
                    }
                    placeholder="Add a comment..."
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => {
                        if (newComment[post.id]) {
                          onAddComment(post.id, newComment[post.id])
                          setNewComment({ ...newComment, [post.id]: '' })
                        }
                      }}
                      className="btn-primary"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 