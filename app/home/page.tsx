'use client'

import { useState, useEffect } from 'react'
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  VideoCameraIcon,
  PhotoIcon,
  FaceSmileIcon,
  ClockIcon,
  AcademicCapIcon,
  LightBulbIcon,
  SparklesIcon,
  FireIcon,
  StarIcon,
  HandRaisedIcon,
  GlobeAltIcon,
  MapPinIcon,
  MegaphoneIcon,
  WrenchIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline'
import CreatePost from '../components/CreatePost'
import EmptyFeed from '../components/EmptyFeed'
import { usePosts } from '@/hooks/usePosts'
import TopNav from '../components/TopNav'
import { useAuth } from '@/context/AuthContext'
import { Post, PostType, Spoke, Prompt, LiveEvent, TrendingItem, Recommendation } from '@/types/post'

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

interface CreatePostFormData extends FormData {
  get(key: string): string | null;
}

export default function Home() {
  const { posts: allPosts, loading, error, createPost } = usePosts()
  const { user } = useAuth()
  const [priorityFeed, setPriorityFeed] = useState<Post[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [activeSpoke, setActiveSpoke] = useState<string | null>(null)
  const [hideDummyContent, setHideDummyContent] = useState(false)

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false)
  }

  useEffect(() => {
    if (allPosts.length > 0) {
      buildPriorityFeed(allPosts)
    } else {
      setPriorityFeed([])
    }
  }, [allPosts])

  const buildPriorityFeed = (posts: Post[]) => {
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
      const postsOfType = posts.filter(post => post.type === postType)
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
    const remainingPosts = posts.filter(post => !usedPostIds.has(post.id))
    
    setPriorityFeed([...feed, ...remainingPosts])
  }

  const renderPostCard = (post: Post) => {
    const getPostStyling = () => {
      const baseStyle = 'rounded-lg bg-white p-4 shadow-sm border border-gray-200'
      const urgencyStyles = {
        high: 'border-red-500',
        medium: 'border-yellow-500',
        low: 'border-blue-500'
      }
      return `${baseStyle} ${post.urgency ? urgencyStyles[post.urgency] : ''}`
    }

    const PostTypeBadge = () => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {post.type}
      </span>
    )

    const SpokeBadge = () => (
      post.spoke && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ml-2">
          {post.spoke}
        </span>
      )
    )

    const LocationBadge = () => (
      post.location && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
          {post.location}
        </span>
      )
    )

    return (
      <div key={post.id} className={getPostStyling()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <img
              src={post.author.avatar || '/images/avatars/default.png'}
              alt={post.author.name}
              className="h-10 w-10 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
              <p className="text-xs text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <PostTypeBadge />
            <SpokeBadge />
            <LocationBadge />
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-600">{post.content}</p>

        {post.image && (
          <img
            src={post.image}
            alt="Post content"
            className="mt-4 rounded-lg w-full object-cover"
          />
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex space-x-4">
            <button className="flex items-center text-gray-500 hover:text-blue-600">
              <HeartIcon className="h-5 w-5 mr-1" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-blue-600">
              <ChatBubbleOvalLeftIcon className="h-5 w-5 mr-1" />
              <span>{post.comments}</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-blue-600">
              <ShareIcon className="h-5 w-5 mr-1" />
              <span>{post.shares}</span>
            </button>
          </div>
        </div>
      </div>
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

      // Create a new FormData object with the required fields
      const postData = new FormData()
      postData.append('content', content)
      postData.append('type', 'user-post')
      postData.append('authorId', user.id)
      postData.append('authorName', user.user_metadata.name || 'Anonymous')
      postData.append('authorAvatar', user.user_metadata.avatar_url || '')

      await createPost(postData)
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
        <main className="container mx-auto px-4 py-8">
          <CreatePost onSubmit={handlePostSubmit} />
          
          {priorityFeed.length === 0 ? (
            <EmptyFeed />
          ) : (
            <div className="space-y-6 mt-6">
              {priorityFeed.map(renderPostCard)}
            </div>
          )}
        </main>
      )}
    </div>
  )
} 