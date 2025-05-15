'use client'

import { useState, useEffect, Suspense } from 'react'
import TopNav from '../components/TopNav'
import dynamic from 'next/dynamic'
import {
  MapIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  PencilSquareIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'

// Types
type UserProfile = {
  bio: string
  avatar: string
  karma: number
  verified: boolean
  skills: string[]
  helpProvided: number
  helpReceived: number
  interests?: string[]
  lifeSpokes?: LifeSpoke[]
}

type LifeSpoke = 'physical' | 'mental' | 'spiritual' | 'family' | 'financial' | 'personal' | 'career'

type Post = {
  id: number
  type: 'problem' | 'solution' | 'goods' | 'money' | 'time' | 'information' | 'services'
  content: string
  timestamp: string
  category: 'Health' | 'Education' | 'Emergency' | 'Food' | 'Shelter' | 'Jobs' | 'Legal' | 'Misc' | 'Medical' | 'Donation' | 'Volunteer' | 'General'
  user?: User
  distance?: number
  priority?: string
  urgency: 'low' | 'medium' | 'high'
  tags: string[]
  location?: {lat: number, lon: number}
  media?: string[]
  anonymous: boolean
  upvotes: number
  status: 'open' | 'in-progress' | 'resolved'
  lifeSpoke?: LifeSpoke
}

type User = {
  id: number
  name: string
  lat: number
  lon: number
  country: string
  profile: UserProfile
  posts: Post[]
  role: 'asker' | 'helper' | 'both'
  language: string
  availableHours?: number[]
  wallet?: string
}

type Location = {
  lat: number
  lon: number
  country: string
}

type Message = {
  sender: string
  recipient: string
  content: string
  timestamp: string
  translated?: boolean
  originalLanguage?: string
}

// Simulated backend data
const users: User[] = [
  { 
    id: 1, 
    name: "Amit", 
    lat: 28.6139, 
    lon: 77.2090, 
    country: "IN", 
    profile: { 
      bio: "Community volunteer", 
      avatar: "🧑", 
      karma: 45, 
      verified: true, 
      skills: ["Medical aid", "Food distribution"],
      helpProvided: 12,
      helpReceived: 3
    }, 
    role: 'both',
    language: 'en',
    posts: [{ 
      id: 1, 
      type: "problem", 
      content: "Need food supplies for flood victims", 
      timestamp: "2025-05-15T10:00:00Z", 
      category: "Emergency",
      urgency: "high",
      tags: ["Disaster", "Children"],
      anonymous: false,
      upvotes: 5,
      status: 'open'
    }] 
  },
  { 
    id: 2, 
    name: "Priya", 
    lat: 13.0827, 
    lon: 80.2707, 
    country: "IN", 
    profile: { 
      bio: "NGO worker", 
      avatar: "👩", 
      karma: 78, 
      verified: true, 
      skills: ["Counseling", "Teaching"],
      helpProvided: 23,
      helpReceived: 5
    }, 
    role: 'helper',
    language: 'en',
    posts: [{ 
      id: 2, 
      type: "solution", 
      content: "Can donate clothes", 
      timestamp: "2025-05-15T11:00:00Z", 
      category: "Shelter",
      urgency: "medium",
      tags: ["Clothing", "Winter"],
      anonymous: false,
      upvotes: 3,
      status: 'open'
    }] 
  },
  { 
    id: 3, 
    name: "Tashi", 
    lat: 27.3314, 
    lon: 88.6138, 
    country: "BT", 
    profile: { 
      bio: "Local helper", 
      avatar: "🧑‍⚕️", 
      karma: 32, 
      verified: true, 
      skills: ["Medical aid", "First aid"],
      helpProvided: 8,
      helpReceived: 2
    }, 
    role: 'asker',
    language: 'en',
    posts: [{ 
      id: 3, 
      type: "problem", 
      content: "Need medical supplies", 
      timestamp: "2025-05-15T12:00:00Z", 
      category: "Health",
      urgency: "high",
      tags: ["Medicine", "Elderly"],
      anonymous: false,
      upvotes: 7,
      status: 'open'
    }] 
  },
]

// Haversine formula to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Assign priority bucket
function getPriorityBucket(distance: number): string {
  if (distance <= 1) return "P0"
  let threshold = 1
  for (let i = 1; i <= 15; i++) {
    threshold *= 2
    if (distance <= threshold) return `P${i}`
  }
  return "P15"
}

// User Profile Component
function UserProfile({ user, setUser }: { user: User, setUser: (user: User) => void }) {
  const [bio, setBio] = useState(user?.profile?.bio || "")
  
  const handleUpdate = () => {
    setUser({ ...user, profile: { ...user.profile, bio } })
    alert("Profile updated!")
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <div className="flex items-center mb-4">
        <UserCircleIcon className="h-6 w-6 mr-2 text-blue-600" />
        <h2 className="text-xl font-semibold">Your Profile</h2>
      </div>
      <p className="text-lg">Welcome, {user.name} {user.profile.avatar}</p>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Update your bio..."
        className="w-full p-2 border rounded mt-2"
      ></textarea>
      <button
        onClick={handleUpdate}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update Profile
      </button>
    </div>
  )
}

// Post Creation Component
function PostForm({ user, setUser, location }: { user: User, setUser: (user: User) => void, location: Location }) {
  const [newPost, setNewPost] = useState("")
  const [postType, setPostType] = useState<Post['type']>("problem")
  const [category, setCategory] = useState<Post['category']>("Health")
  const [urgency, setUrgency] = useState<Post['urgency']>("medium")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [anonymous, setAnonymous] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [postLocation, setPostLocation] = useState<{lat: number, lon: number} | null>(null)

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSetLocation = () => {
    // In a real app, you'd have a map picker here
    // For now, we'll just use the user's current location
    setPostLocation({ lat: location.lat, lon: location.lon })
    setShowMap(false)
    alert("Location set to your current position")
  }

  const handlePost = () => {
    if (!newPost) return
    const newUser = { ...user }
    newUser.posts = newUser.posts || []
    
    newUser.posts.push({
      id: Date.now(),
      type: postType,
      content: newPost,
      timestamp: new Date().toISOString(),
      category,
      urgency,
      tags,
      anonymous,
      upvotes: 0,
      status: 'open',
      location: postLocation || undefined,
      media: [] // No media upload functionality yet
    })
    
    // Update users array
    const userIndex = users.findIndex(u => u.id === user.id)
    if (userIndex >= 0) {
      users[userIndex] = newUser
    } else {
      users.push(newUser)
    }
    
    setUser(newUser)
    setNewPost("")
    setTags([])
    setPostLocation(null)
    alert("Post submitted! Notification sent to nearby users.")
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mt-4">
      <div className="flex items-center mb-4">
        <PencilSquareIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold dark:text-white">Create a Post</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Post Type</label>
          <select
            value={postType}
            onChange={(e) => setPostType(e.target.value as Post['type'])}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="problem">Need Help</option>
            <option value="solution">Offer Solution</option>
            <option value="goods">Offer Goods</option>
            <option value="money">Financial Aid</option>
            <option value="time">Volunteer Time</option>
            <option value="information">Share Information</option>
            <option value="services">Offer Services</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Post['category'])}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Emergency">Emergency</option>
            <option value="Food">Food</option>
            <option value="Shelter">Shelter</option>
            <option value="Jobs">Jobs</option>
            <option value="Legal">Legal</option>
            <option value="Misc">Miscellaneous</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgency</label>
        <div className="flex gap-4">
          {(['low', 'medium', 'high'] as const).map(level => (
            <label key={level} className="inline-flex items-center">
              <input
                type="radio"
                name="urgency"
                value={level}
                checked={urgency === level}
                onChange={() => setUrgency(level)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300 capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span key={tag} className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
              {tag}
              <button 
                onClick={() => handleRemoveTag(tag)} 
                className="ml-1 text-blue-800 dark:text-blue-100 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            className="flex-grow p-2 border rounded-l dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleAddTag}
            className="bg-blue-600 text-white px-3 rounded-r hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precise Location</label>
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-sm text-blue-600 dark:text-blue-400"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
        
        {showMap && (
          <div className="mt-2 p-3 border rounded dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              For precise help, set an exact location
            </p>
            <button
              onClick={handleSetLocation}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              Use My Current Location
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous(!anonymous)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-gray-700 dark:text-gray-300">Post Anonymously</span>
        </label>
      </div>
      
      <textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder="Describe your problem or offer..."
        className="w-full p-2 border rounded mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        rows={4}
        aria-label="Post content"
      ></textarea>
      
      <button
        onClick={handlePost}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {postType === 'problem' ? 'Ask for Help' : 'Offer Help'}
      </button>
    </div>
  )
}

// Chat Component
function Chat({ user }: { user: User }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [recipient, setRecipient] = useState("")

  const sendMessage = () => {
    if (!newMessage || !recipient) return
    setMessages([...messages, { 
      sender: user.name, 
      recipient, 
      content: newMessage, 
      timestamp: new Date().toISOString() 
    }])
    setNewMessage("")
    alert(`Message sent to ${recipient}`)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <div className="flex items-center mb-4">
        <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-blue-600" />
        <h2 className="text-xl font-semibold">Chat</h2>
      </div>
      <select
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full p-2 border rounded mt-2"
        aria-label="Select recipient"
      >
        <option value="">Select Recipient</option>
        {users.filter(u => u.id !== user.id).map(u => (
          <option key={u.id} value={u.name}>{u.name}</option>
        ))}
      </select>
      <div className="mt-2 h-40 overflow-y-auto border p-2 rounded">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <p><strong>{msg.sender}</strong> to <strong>{msg.recipient}</strong>: {msg.content}</p>
            <p className="text-sm text-gray-500">{new Date(msg.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        className="w-full p-2 border rounded mt-2"
        aria-label="Chat message"
      ></textarea>
      <button
        onClick={sendMessage}
        className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Send
      </button>
    </div>
  )
}

// Dynamic import for Leaflet map (client-side only)
const MapComponent = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-200 h-80 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
})

// Life Spoke definitions
const LIFE_SPOKES = [
  {
    id: 'physical',
    name: 'Physical',
    description: 'Health, fitness, nutrition, and overall physical well-being',
    icon: '💪',
    color: 'bg-red-100 dark:bg-red-900/30',
    categories: ['Health', 'Medical', 'Food']
  },
  {
    id: 'mental',
    name: 'Mental',
    description: 'Emotional support, cognitive development, mental clarity',
    icon: '🧠',
    color: 'bg-purple-100 dark:bg-purple-900/30',
    categories: ['Education', 'Mental Health']
  },
  {
    id: 'spiritual',
    name: 'Spiritual',
    description: 'Inner growth, mindfulness, and connection to purpose',
    icon: '✨',
    color: 'bg-blue-100 dark:bg-blue-900/30',
    categories: ['Meditation', 'Community']
  },
  {
    id: 'family',
    name: 'Family',
    description: 'Family relationships, parenting, and home life balance',
    icon: '👨‍👩‍👧‍👦',
    color: 'bg-green-100 dark:bg-green-900/30',
    categories: ['Childcare', 'Elder Care', 'Household']
  },
  {
    id: 'financial',
    name: 'Financial',
    description: 'Money management, investments, and financial security',
    icon: '💰',
    color: 'bg-yellow-100 dark:bg-yellow-900/30',
    categories: ['Jobs', 'Donation', 'Financial Advice']
  },
  {
    id: 'personal',
    name: 'Personal',
    description: 'Personal growth, hobbies, self-improvement',
    icon: '🌱',
    color: 'bg-indigo-100 dark:bg-indigo-900/30',
    categories: ['Hobbies', 'Skills', 'Volunteer']
  },
  {
    id: 'career',
    name: 'Career',
    description: 'Professional growth, skills development, and work fulfillment',
    icon: '💼',
    color: 'bg-orange-100 dark:bg-orange-900/30',
    categories: ['Jobs', 'Training', 'Mentorship']
  }
]

// Interest tags for user personalization
const INTEREST_TAGS = [
  'Health & Fitness', 'Mental Wellness', 'Spiritual Growth', 
  'Family Support', 'Financial Help', 'Personal Development',
  'Career Growth', 'Education', 'Technology', 'Arts & Crafts', 
  'Cooking', 'Gardening', 'Home Repair', 'Transportation',
  'Childcare', 'Elder Care', 'Pet Care', 'Emergency Response',
  'Language Learning', 'Music', 'Sports', 'Outdoor Activities'
]

export default function HelpOthersPage() {
  const [user, setUser] = useState<User>({
    id: Date.now(),
    name: "Guest User",
    lat: 28.6139,
    lon: 77.2090,
    country: "IN",
    profile: { 
      bio: "", 
      avatar: "🧑",
      karma: 0,
      verified: false,
      skills: [],
      helpProvided: 0,
      helpReceived: 0,
      interests: ['Health & Fitness', 'Technology'],
      lifeSpokes: ['physical', 'career']
    },
    role: 'both',
    language: 'en',
    posts: []
  })
  
  const [location, setLocation] = useState<Location>({ lat: 28.6139, lon: 77.2090, country: "IN" })
  const [filterType, setFilterType] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterDistance, setFilterDistance] = useState("")
  const [filterUrgency, setFilterUrgency] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterLifeSpoke, setFilterLifeSpoke] = useState<LifeSpoke | "">("")
  const [tagSearch, setTagSearch] = useState("")
  const [sortMethod, setSortMethod] = useState<'proximity' | 'time' | 'urgency' | 'upvotes'>('proximity')
  const [mapKey, setMapKey] = useState(0) // Used to force map re-render
  const [isClient, setIsClient] = useState(false)
  const [userRole, setUserRole] = useState<User['role']>('both')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPostDetail, setShowPostDetail] = useState(false)
  const [dashboardView, setDashboardView] = useState<'active' | 'history' | 'stats'>('active')
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [highContrast, setHighContrast] = useState(false)
  const [accessibilityMode, setAccessibilityMode] = useState(false)
  const [showLifeSpokes, setShowLifeSpokes] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Try to get user's location automatically
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            country: location.country
          }
          setLocation(newLoc)
          setUser(prev => ({ ...prev, lat: newLoc.lat, lon: newLoc.lon }))
          // Force map re-render with new coords
          setMapKey(prev => prev + 1)
        },
        () => console.warn("Geolocation failed. Using default location.")
      )
    }
    
    // Check for user preferences
    if (typeof window !== 'undefined') {
      const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large' || 'medium'
      const savedHighContrast = localStorage.getItem('highContrast') === 'true'
      const savedAccessibilityMode = localStorage.getItem('accessibilityMode') === 'true'
      
      setFontSize(savedFontSize)
      setHighContrast(savedHighContrast)
      setAccessibilityMode(savedAccessibilityMode)
    }
  }, [])
  
  // Save preferences when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fontSize', fontSize)
      localStorage.setItem('highContrast', highContrast.toString())
      localStorage.setItem('accessibilityMode', accessibilityMode.toString())
    }
  }, [fontSize, highContrast, accessibilityMode])

  const toggleHighContrast = () => {
    setHighContrast(!highContrast)
  }
  
  const toggleAccessibilityMode = () => {
    setAccessibilityMode(!accessibilityMode)
  }

  const resetFilters = () => {
    setFilterType("")
    setFilterCategory("")
    setFilterDistance("")
    setFilterUrgency("")
    setFilterStatus("")
    setFilterLifeSpoke("")
    setTagSearch("")
    setSortMethod('proximity')
  }
  
  const toggleFontSize = () => {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large']
    const currentIndex = sizes.indexOf(fontSize)
    const nextIndex = (currentIndex + 1) % sizes.length
    setFontSize(sizes[nextIndex])
  }
  
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm'
      case 'medium': return 'text-base'
      case 'large': return 'text-lg'
      default: return 'text-base'
    }
  }
  
  const getContrastClass = () => {
    return highContrast ? 'high-contrast' : ''
  }

  // Process and sort posts
  const processedPosts = users.flatMap(u => 
    u.posts.map(post => ({
      ...post,
      user: u,
      distance: calculateDistance(location.lat, location.lon, u.lat, u.lon),
      // Assign life spoke based on category if not already present
      lifeSpoke: post.lifeSpoke || getCategoryLifeSpoke(post.category)
    }))
  ).map(post => ({
    ...post,
    priority: getPriorityBucket(post.distance || 0)
  }))
  
  // Helper to determine life spoke from category
  function getCategoryLifeSpoke(category: Post['category']): LifeSpoke {
    for (const spoke of LIFE_SPOKES) {
      if (spoke.categories.includes(category as string)) {
        return spoke.id as LifeSpoke
      }
    }
    return 'personal' // Default to personal if no match
  }

  // Apply all filters
  const filteredPosts = processedPosts.filter(post => {
    // Base type and category filters
    if (filterType && post.type !== filterType) return false
    if (filterCategory && post.category !== filterCategory) return false
    
    // Distance filter
    if (filterDistance && post.distance) {
      const maxDistance = Number(filterDistance)
      if (post.distance > maxDistance) return false
    }
    
    // Urgency filter
    if (filterUrgency && post.urgency !== filterUrgency) return false
    
    // Status filter
    if (filterStatus && post.status !== filterStatus) return false
    
    // Life spoke filter
    if (filterLifeSpoke && post.lifeSpoke !== filterLifeSpoke) return false
    
    // Tag search
    if (tagSearch && !post.tags?.some(tag => 
      tag.toLowerCase().includes(tagSearch.toLowerCase())
    )) return false
    
    return true
  })

  // Sort based on selected method
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    // Primary sort: Always country-first rule
    const isSameCountryA = a.user?.country === location.country
    const isSameCountryB = b.user?.country === location.country
    if (isSameCountryA && !isSameCountryB) return -1
    if (!isSameCountryA && isSameCountryB) return 1
    
    // Secondary sort based on user selection
    switch (sortMethod) {
      case 'proximity':
        // Sort by priority buckets
        const priorityA = parseInt(a.priority?.replace("P", "") || "0")
        const priorityB = parseInt(b.priority?.replace("P", "") || "0")
        return priorityA - priorityB
        
      case 'time':
        // Sort by timestamp (newest first)
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        
      case 'urgency':
        // Sort by urgency level
        const urgencyMap = { high: 3, medium: 2, low: 1 }
        return (urgencyMap[b.urgency] || 0) - (urgencyMap[a.urgency] || 0)
        
      case 'upvotes':
        // Sort by number of upvotes
        return (b.upvotes || 0) - (a.upvotes || 0)
        
      default:
        return 0
    }
  })

  return (
    <div className={`min-h-screen ${getFontSizeClass()} ${getContrastClass()} transition-colors duration-300`}>
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Help Others</h1>
            <p className="mt-2 text-gray-600">
              Connect with people who need help or offer your assistance
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex border rounded-lg overflow-hidden">
              <button 
                onClick={() => setUserRole('asker')} 
                className={`px-3 py-1.5 text-sm ${
                  userRole === 'asker' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600'
                }`}
              >
                I Need Help
              </button>
              <button 
                onClick={() => setUserRole('helper')} 
                className={`px-3 py-1.5 text-sm ${
                  userRole === 'helper' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600'
                }`}
              >
                I Can Help
              </button>
              <button 
                onClick={() => setUserRole('both')} 
                className={`px-3 py-1.5 text-sm ${
                  userRole === 'both' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600'
                }`}
              >
                Both
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex border rounded-lg overflow-hidden">
            <button 
              onClick={() => setViewMode('list')} 
              className={`px-4 py-2 flex items-center ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              List View
            </button>
            <button 
              onClick={() => setViewMode('map')} 
              className={`px-4 py-2 flex items-center ${
                viewMode === 'map' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600'
              }`}
            >
              <MapIcon className="h-5 w-5 mr-1" />
              Map View
            </button>
          </div>
          
          {userRole === 'both' && (
            <div className="flex border rounded-lg overflow-hidden">
              <button 
                onClick={() => setDashboardView('active')} 
                className={`px-3 py-1.5 text-sm ${
                  dashboardView === 'active' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600'
                }`}
              >
                Active Posts
              </button>
              <button 
                onClick={() => setDashboardView('history')} 
                className={`px-3 py-1.5 text-sm ${
                  dashboardView === 'history' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600'
                }`}
              >
                History
              </button>
              <button 
                onClick={() => setDashboardView('stats')} 
                className={`px-3 py-1.5 text-sm ${
                  dashboardView === 'stats' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600'
                }`}
              >
                Stats
              </button>
            </div>
          )}
        </div>

        <div className="mt-6">
          {/* Main content area */}
          {viewMode === 'list' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <UserProfile user={user} setUser={setUser} />
                {userRole !== 'helper' && <PostForm user={user} setUser={setUser} location={location} />}
                
                <div className="bg-white p-4 rounded-lg shadow mt-4">
                  <div className="flex items-center mb-4">
                    <AdjustmentsHorizontalIcon className="h-6 w-6 mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold">Filter Posts</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full p-2 border rounded"
                        aria-label="Filter by post type"
                      >
                        <option value="">All Types</option>
                        <option value="problem">Need Help</option>
                        <option value="solution">Offer Solution</option>
                        <option value="goods">Offer Goods</option>
                        <option value="money">Financial Aid</option>
                        <option value="time">Volunteer Time</option>
                        <option value="information">Information</option>
                        <option value="services">Services</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full p-2 border rounded"
                        aria-label="Filter by category"
                      >
                        <option value="">All Categories</option>
                        <option value="Health">Health</option>
                        <option value="Education">Education</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Food">Food</option>
                        <option value="Shelter">Shelter</option>
                        <option value="Jobs">Jobs</option>
                        <option value="Legal">Legal</option>
                        <option value="Misc">Miscellaneous</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
                      <select
                        value={filterDistance}
                        onChange={(e) => setFilterDistance(e.target.value)}
                        className="w-full p-2 border rounded"
                        aria-label="Filter by distance"
                      >
                        <option value="">All Distances</option>
                        <option value="1">Within 1 km</option>
                        <option value="5">Within 5 km</option>
                        <option value="10">Within 10 km</option>
                        <option value="50">Within 50 km</option>
                        <option value="100">Within 100 km</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                      <select
                        value={filterUrgency}
                        onChange={(e) => setFilterUrgency(e.target.value)}
                        className="w-full p-2 border rounded"
                        aria-label="Filter by urgency"
                      >
                        <option value="">All Urgency Levels</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full p-2 border rounded"
                        aria-label="Filter by status"
                      >
                        <option value="">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Life Spoke</label>
                      <select
                        value={filterLifeSpoke}
                        onChange={(e) => setFilterLifeSpoke(e.target.value as LifeSpoke | "")}
                        className="w-full p-2 border rounded"
                        aria-label="Filter by life spoke"
                      >
                        <option value="">All Life Spokes</option>
                        {LIFE_SPOKES.map(spoke => (
                          <option key={spoke.id} value={spoke.id}>{spoke.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tag Search</label>
                      <input
                        type="text"
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        placeholder="Search by tag"
                        className="w-full p-2 border rounded"
                        aria-label="Search by tag"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSortMethod('proximity')}
                        className={`px-3 py-1 text-sm rounded ${
                          sortMethod === 'proximity' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Proximity
                      </button>
                      <button
                        onClick={() => setSortMethod('time')}
                        className={`px-3 py-1 text-sm rounded ${
                          sortMethod === 'time' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Most Recent
                      </button>
                      <button
                        onClick={() => setSortMethod('urgency')}
                        className={`px-3 py-1 text-sm rounded ${
                          sortMethod === 'urgency' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Urgency
                      </button>
                      <button
                        onClick={() => setSortMethod('upvotes')}
                        className={`px-3 py-1 text-sm rounded ${
                          sortMethod === 'upvotes' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Most Upvoted
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={resetFilters}
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center mb-4">
                    <MapIcon className="h-6 w-6 mr-2 text-blue-600" />
                    <h2 className="text-xl font-semibold">Location View</h2>
                  </div>
                  <div className="h-80 rounded-lg overflow-hidden shadow">
                    <div className="h-full">
                      {isClient ? (
                        <Suspense fallback={<div className="bg-gray-200 h-full flex items-center justify-center"><p>Loading map...</p></div>}>
                          <MapComponent key={mapKey} location={location} posts={sortedPosts} />
                        </Suspense>
                      ) : (
                        <div className="bg-gray-200 h-full flex items-center justify-center">
                          <p>Map loading...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <Chat user={user} />
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Community Posts</h2>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {sortedPosts.length > 0 ? (
                      sortedPosts.map(post => {
                        // Get the life spoke data for this post
                        const spokeData = LIFE_SPOKES.find(s => s.id === post.lifeSpoke) || LIFE_SPOKES[0];
                        
                        return (
                          <div key={post.id} className={`p-4 rounded-lg ${
                            post.type === 'problem' ? 'bg-red-50 border-l-4 border-red-500' :
                            post.type === 'solution' ? 'bg-green-50 border-l-4 border-green-500' :
                            post.type === 'goods' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                            post.type === 'money' ? 'bg-blue-50 border-l-4 border-blue-500' :
                            post.type === 'information' ? 'bg-purple-50 border-l-4 border-purple-500' :
                            post.type === 'services' ? 'bg-indigo-50 border-l-4 border-indigo-500' :
                            'bg-gray-50 border-l-4 border-gray-500'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                {!post.anonymous && post.user?.profile.avatar && (
                                  <span className="mr-2 text-lg">{post.user.profile.avatar}</span>
                                )}
                                <div>
                                  <div className="font-medium">
                                    {post.anonymous ? 'Anonymous' : post.user?.name}
                                    {post.user?.profile.verified && (
                                      <span className="ml-1 text-blue-500" title="Verified User">✓</span>
                                    )}
                                  </div>
                                  {!post.anonymous && post.user?.profile.karma !== undefined && (
                                    <div className="text-xs text-gray-500">
                                      Karma: {post.user.profile.karma} • {post.user.role === 'asker' ? 'Needs Help' : 
                                            post.user.role === 'helper' ? 'Helps Others' : 'Community Member'}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 flex flex-col items-end">
                                <div>{post.priority}, {post.distance?.toFixed(2)} km</div>
                                <div className="mt-1">
                                  {post.urgency === 'high' ? (
                                    <span className="bg-red-100 px-2 py-0.5 rounded-full text-xs">
                                      Urgent
                                    </span>
                                  ) : post.urgency === 'medium' ? (
                                    <span className="bg-yellow-100 px-2 py-0.5 rounded-full text-xs">
                                      Medium
                                    </span>
                                  ) : (
                                    <span className="bg-green-100 px-2 py-0.5 rounded-full text-xs">
                                      Low
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-2 mb-2">
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full
                                  ${post.category === 'Emergency' ? 'bg-red-100 text-red-800' :
                                  post.category === 'Health' || post.category === 'Medical' ? 'bg-blue-100 text-blue-800' :
                                  post.category === 'Donation' ? 'bg-green-100 text-green-800' :
                                  post.category === 'Volunteer' ? 'bg-yellow-100 text-yellow-800' :
                                  post.category === 'Education' ? 'bg-indigo-100 text-indigo-800' :
                                  post.category === 'Food' ? 'bg-orange-100 text-orange-800' :
                                  post.category === 'Shelter' ? 'bg-teal-100 text-teal-800' :
                                  post.category === 'Jobs' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {post.category}
                                </span>
                                
                                {/* Life Spoke Tag */}
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${spokeData.color}`}>
                                  <span className="mr-1">{spokeData.icon}</span>
                                  {spokeData.name}
                                </span>
                              </div>
                              
                              <p className="text-gray-700">{post.content}</p>
                              
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {post.tags.map((tag, i) => (
                                    <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                {new Date(post.timestamp).toLocaleString()}
                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  className="text-gray-500 hover:text-blue-500 text-sm flex items-center"
                                  aria-label={`Upvote - Current count: ${post.upvotes || 0}`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {post.upvotes || 0}
                                </button>
                                <button 
                                  className="text-gray-500 hover:text-blue-500 text-sm flex items-center"
                                  aria-label="Connect with this person"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                  </svg>
                                  Connect
                                </button>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  post.status === 'open' ? 'bg-green-100' :
                                  post.status === 'in-progress' ? 'bg-yellow-100' :
                                  'bg-gray-100'
                                }`}>
                                  {post.status === 'open' ? 'Open' : post.status === 'in-progress' ? 'In Progress' : 'Resolved'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 italic">No posts match your current filters</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Map view mode
            <div className="h-[calc(100vh-200px)] rounded-lg overflow-hidden shadow">
              <div className="h-full">
                {isClient ? (
                  <Suspense fallback={<div className="bg-gray-200 h-full flex items-center justify-center"><p>Loading map...</p></div>}>
                    <MapComponent key={mapKey} location={location} posts={sortedPosts} fullScreen={true} />
                  </Suspense>
                ) : (
                  <div className="bg-gray-200 h-full flex items-center justify-center">
                    <p>Map loading...</p>
                  </div>
                )}
              </div>
              
              {/* Overlay for the map view showing posts near current view */}
              <div className="fixed bottom-24 right-4 w-80 max-h-80 overflow-y-auto bg-white rounded-lg shadow-lg p-3">
                <h3 className="font-medium mb-2">Posts Near You</h3>
                <div className="space-y-2">
                  {sortedPosts.slice(0, 5).map(post => (
                    <div key={post.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{post.user?.name || 'Anonymous'}</span>
                        <span className="text-xs text-gray-500">{post.distance?.toFixed(1)} km</span>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 