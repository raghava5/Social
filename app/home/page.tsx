'use client'

import { useState, useEffect } from 'react'
import CreatePost from '../components/CreatePost'
import EmptyFeed from '../components/EmptyFeed'
import { usePosts } from '@/hooks/usePosts'
import { usePostInteractions } from '@/hooks/usePostInteractions'
import TopNav from '../components/TopNav'
import PostCard from '../components/PostCard'
import { useAuth } from '@/context/AuthContext'
import { Post, PostType, Spoke, Prompt, LiveEvent, TrendingItem, Recommendation } from '@/types/post'
import Link from 'next/link'
import { BookmarkIcon, TrashIcon } from '@heroicons/react/24/outline'

// Configuration
const spokes: Spoke[] = [
  { id: 1, name: 'Spiritual', progress: 75, color: 'bg-purple-500' },
  { id: 2, name: 'Mental', progress: 60, color: 'bg-blue-500' },
  { id: 3, name: 'Physical', progress: 85, color: 'bg-green-500' },
  { id: 4, name: 'Personal', progress: 45, color: 'bg-pink-500' },
  { id: 5, name: 'Professional', progress: 70, color: 'bg-yellow-500' },
  { id: 6, name: 'Financial', progress: 55, color: 'bg-red-500' },
  { id: 7, name: 'Social', progress: 80, color: 'bg-indigo-500' },
  { id: 8, name: 'Mindfulness', progress: 65, color: 'bg-teal-500' },
  { id: 9, name: 'Leadership', progress: 50, color: 'bg-orange-500' },
]

const prompts: Prompt[] = [
  { id: 1, text: 'What are you grateful for today?', spoke: 'Spiritual' },
  { id: 2, text: 'Take 5 minutes to practice mindfulness', spoke: 'Mental' },
  { id: 3, text: 'Go for a 15-minute walk', spoke: 'Physical' },
]

const liveEvents: LiveEvent[] = [
  { id: 1, title: 'Morning Meditation', time: '8:00 AM', participants: 45 },
  { id: 2, title: 'Financial Planning Workshop', time: '2:00 PM', participants: 23 },
]

const trendingItems: TrendingItem[] = [
  { id: 1, title: 'Mindful Living Challenge', type: 'challenge', participants: 120 },
  { id: 2, title: 'Financial Freedom Group', type: 'group', members: 89 },
  { id: 3, title: 'Daily Wisdom Quotes', type: 'content', likes: 256 },
]

const recommendations: Recommendation[] = [
  { id: 1, title: 'The Power of Now', type: 'book', author: 'Eckhart Tolle' },
  { id: 2, title: 'Meditation for Beginners', type: 'course', duration: '30 mins' },
  { id: 3, title: 'Mindful Living Workshop', type: 'course', duration: '2 hours' },
]

export default function Home() {
  const { posts: allPosts, loading, error, createPost, refreshPosts } = usePosts()
  const { user } = useAuth()
  const [priorityFeed, setPriorityFeed] = useState<Post[]>([])
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [activeSpoke, setActiveSpoke] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const POSTS_PER_BATCH = 3 // Load 3 posts at a time

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false)
  }

  // Filter posts by spoke
  const handleSpokeFilter = (spokeName: string) => {
    if (activeSpoke === spokeName) {
      setActiveSpoke(null) // Clear filter
    } else {
      setActiveSpoke(spokeName) // Apply filter
    }
    setDisplayedPosts([]) // Reset displayed posts
    setHasMore(true) // Reset pagination
  }

  useEffect(() => {
    if (allPosts.length > 0) {
      buildPriorityFeed(allPosts)
    } else {
      setPriorityFeed([])
      setDisplayedPosts([])
    }
  }, [allPosts, activeSpoke])

  // Progressive loading effect
  useEffect(() => {
    if (priorityFeed.length > 0 && displayedPosts.length === 0) {
      // Load first batch immediately
      loadNextBatch()
    }
  }, [priorityFeed])

  const loadNextBatch = () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const currentLength = displayedPosts.length
      const nextBatch = priorityFeed.slice(currentLength, currentLength + POSTS_PER_BATCH)
      
      if (nextBatch.length > 0) {
        setDisplayedPosts(prev => [...prev, ...nextBatch])
      }
      
      if (currentLength + nextBatch.length >= priorityFeed.length) {
        setHasMore(false)
      }
      
      setLoadingMore(false)
    }, 300) // 300ms delay for smooth loading
  }

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 // Load when 1000px from bottom
      ) {
        loadNextBatch()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [displayedPosts, loadingMore, hasMore])

  const buildPriorityFeed = (posts: Post[]) => {
    // Filter by active spoke if one is selected
    let filteredPosts = activeSpoke 
      ? posts.filter(post => post.spoke === activeSpoke)
      : posts

    // Get or initialize spoke rotation
    const storedRotation = localStorage.getItem('spokeRotation')
    let spokeRotation = storedRotation ? JSON.parse(storedRotation) : spokes.map(spoke => spoke.name)
    
    // Rotate spokes
    const [firstSpoke, ...restSpokes] = spokeRotation
    spokeRotation = [...restSpokes, firstSpoke]
    localStorage.setItem('spokeRotation', JSON.stringify(spokeRotation))
    
    // Priority order for post types
    const postTypeOrder: PostType[] = [
      'help-request',
      'spend-time',
      'user-post',
      'campaign',
      'activity',
      'tool',
      'game'
    ]
    
    // Build feed based on priority and spoke rotation
    const feed = postTypeOrder.reduce<Post[]>((acc, postType) => {
      const postsOfType = filteredPosts.filter(post => post.type === postType)
      if (postsOfType.length === 0) return acc
      
      // Try to find a post from the current spoke rotation
      const postFromRotation = postsOfType.find(post => 
        post.spoke && spokeRotation.includes(post.spoke)
      )
      
      if (postFromRotation) {
        acc.push(postFromRotation)
      } else {
        // If no post from rotation, take the first available
        acc.push(postsOfType[0])
      }
      
      return acc
    }, [])
    
    // Add remaining posts that weren't included
    const usedPostIds = new Set(feed.map(post => post.id))
    const remainingPosts = filteredPosts.filter(post => !usedPostIds.has(post.id))
    
    setPriorityFeed([...feed, ...remainingPosts])
  }

  const { likePost, commentOnPost, sharePost } = usePostInteractions()

  // Simplified like handler 
  const handleLike = async (postId: string) => {
    try {
      const response = await likePost(postId)
      console.log('Like response:', response)
      return response
    } catch (error) {
      console.error('Error liking post:', error)
      throw error
    }
  }

  // Simplified comment handler
  const handleComment = async (postId: string, content: string) => {
    try {
      const response = await commentOnPost(postId, content)
      console.log('Comment response:', response)
      return response
    } catch (error) {
      console.error('Error commenting on post:', error)
      throw error
    }
  }

  // Edit post handler
  const handleEditPost = async (postId: string, updatedPost: any) => {
    try {
      const response = await fetch(`/api/posts/${postId}/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedPost,
          userId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to edit post')
      }

      const data = await response.json()
      
      // Update local state immediately for better UX
      const updatedPostData: Post = {
        id: data.post.id,
        type: 'user-post' as PostType,
        author: {
          id: data.post.author.id,
          name: data.post.author.name,
          avatar: data.post.author.profileImageUrl || '/images/avatars/default.svg'
        },
        content: data.post.content,
        images: data.post.images,
        videos: data.post.videos,
        likes: data.post.likeCount || 0,
        comments: data.post.commentCount || 0,
        commentsList: data.post.comments || [],
        shares: 0,
        timestamp: data.post.createdAt,
        updatedAt: data.post.updatedAt,
        isEdited: data.post.isEdited,
        spoke: data.post.spoke,
        location: data.post.location,
        feeling: data.post.feeling,
        tags: data.post.tags || [],
        isLikedByCurrentUser: data.post.likes?.some((like: any) => like.userId === user?.id) || false
      }

      // Update both displayed posts and priority feed
      setDisplayedPosts(prev => 
        prev.map(post => post.id === postId ? updatedPostData : post)
      )
      setPriorityFeed(prev => 
        prev.map(post => post.id === postId ? updatedPostData : post)
      )
      
      return data
    } catch (error) {
      console.error('Error editing post:', error)
      throw error
    }
  }

  // Delete post handler
  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      // Remove post from local state immediately for better UX
      setDisplayedPosts(prev => prev.filter(post => post.id !== postId))
      setPriorityFeed(prev => prev.filter(post => post.id !== postId))
      
      // Do not refresh posts from server - just keep local state
      
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  // Save post handler
  const handleSavePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save post')
      }

      const data = await response.json()
      console.log('Save response:', data)
      
      return data
    } catch (error) {
      console.error('Error saving post:', error)
      throw error
    }
  }

  const renderPostCard = (post: Post) => {
    return (
      <PostCard 
        key={post.id}
        id={post.id}
        author={post.author}
        content={post.content}
        images={post.images}
        videos={post.videos}
        likes={[]}
        comments={post.commentsList}
        shares={post.shares || 0}
        createdAt={post.timestamp || new Date()}
        updatedAt={post.updatedAt}
        isEdited={post.isEdited || false}
        spoke={post.spoke}
        location={post.location}
        feeling={post.feeling}
        type={post.type}
        isLikedByCurrentUser={post.isLikedByCurrentUser}
        onLike={handleLike}
        onComment={handleComment}
        onShare={sharePost}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
        onSave={handleSavePost}
        currentUserId={user?.id}
      />
    )
  }

  const handlePostSubmit = async (formData: FormData) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to create a post')
      }

      const content = formData.get('content')?.toString()
      if (!content) {
        throw new Error('Post content is required')
      }

      // Create optimistic post for instant feedback
      const tempId = `temp-${Date.now()}`
      const optimisticPost: Post = {
        id: tempId,
        type: 'user-post',
        author: {
          id: user.id,
          name: `${user.user_metadata?.firstName || 'User'} ${user.user_metadata?.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User',
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.profileImageUrl || '/images/avatars/default.svg'
        },
        content: content,
        images: '',
        videos: '',
        likes: 0,
        comments: 0,
        commentsList: [],
        shares: 0,
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEdited: false,
        spoke: formData.get('spoke')?.toString() || undefined,
        location: formData.get('location')?.toString() || undefined,
        feeling: formData.get('feeling')?.toString() || undefined,
        tags: [],
        isLikedByCurrentUser: false
      }

      // Add optimistic post immediately
      setDisplayedPosts(prev => [optimisticPost, ...prev])
      setPriorityFeed(prev => [optimisticPost, ...prev])

      try {
        // Create actual post
        await createPost(formData)
        
        // Remove the optimistic post since createPost will add the real one
        setDisplayedPosts(prev => prev.filter(post => post.id !== tempId))
        setPriorityFeed(prev => prev.filter(post => post.id !== tempId))
        
      } catch (error) {
        // Remove optimistic post on error
        setDisplayedPosts(prev => prev.filter(post => post.id !== tempId))
        setPriorityFeed(prev => prev.filter(post => post.id !== tempId))
        throw error
      }
    } catch (error: any) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      {showOnboarding ? (
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome {user?.email || 'there'}!</h2>
          <p className="text-gray-600 mb-4">Let's get you started with your journey.</p>
          <button
            onClick={handleCompleteOnboarding}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="flex">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-64 fixed left-0 top-16 h-full bg-white border-r border-gray-200 p-4">
            <div className="space-y-4">
              {/* Seven Spokes Section - Now on Top */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Nine Spokes</h3>
                  {/* Clear Filter Button - Now next to header */}
                  {activeSpoke && (
                    <button
                      onClick={() => handleSpokeFilter('')}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {spokes.map((spoke) => (
                    <div 
                      key={spoke.id} 
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        activeSpoke === spoke.name 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSpokeFilter(spoke.name)}
                    >
                      <span className={`text-sm ${
                        activeSpoke === spoke.name ? 'text-blue-800 font-medium' : 'text-gray-600'
                      }`}>
                        {spoke.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${spoke.color}`}
                            style={{ width: `${spoke.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{spoke.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Access Section - Now at Bottom */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Quick Access</h4>
                <div className="space-y-2">
                  <Link
                    href="/saved-posts"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <BookmarkIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">Saved Posts</span>
                  </Link>
                  
                  <Link
                    href="/deleted-posts"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                    <span className="text-gray-700">Deleted Posts</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 lg:ml-64 container mx-auto px-4 py-8">
            <CreatePost onSubmit={handlePostSubmit} />
            
            {/* Filter Indicator */}
            {activeSpoke && (
              <div className="mt-6 mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-800 font-medium">Filtering by:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    🎯 {activeSpoke}
                  </span>
                </div>
                <button
                  onClick={() => handleSpokeFilter('')}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Clear Filter
                </button>
              </div>
            )}
            
            {displayedPosts.length === 0 ? (
              <EmptyFeed />
            ) : (
              <div className="space-y-6 mt-6">
                {displayedPosts.map(renderPostCard)}
                
                {/* Loading indicator */}
                {loadingMore && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span>Loading more posts...</span>
                    </div>
                  </div>
                )}
                
                {/* End of posts indicator */}
                {!hasMore && displayedPosts.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>You've reached the end! 🎉</p>
                    <p className="text-sm mt-1">Check back later for more posts</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
} 