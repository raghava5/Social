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
  MoonIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
  BookmarkIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  LifebuoyIcon,
  HandRaisedIcon,
  CameraIcon,
  EyeSlashIcon,
  MapPinIcon,
  ArrowsRightLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FireIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  HandThumbUpIcon,
  ChartBarIcon
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
  verification?: {
    status: VerificationStatus;
    verifiedBy?: string;
    verificationDate?: string;
    notes?: string;
  }
  availableTimes?: string[];
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

// Add new types for the verified needs and help history
type VerificationStatus = 'pending' | 'verified' | 'rejected';

type HelpHistory = {
  id: number;
  postId: number;
  date: string;
  type: 'helped' | 'received';
  details: string;
  feedback?: string;
  rating?: number;
  testimonial?: string;
  badge?: string;
}

// New sidebar component
function Sidebar({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  sidebarView,
  setSidebarView,
  user,
  filteredPosts
}: {
  searchQuery: string,
  setSearchQuery: (query: string) => void,
  viewMode: 'list' | 'map',
  setViewMode: (mode: 'list' | 'map') => void,
  sidebarView: 'safety',
  setSidebarView: (view: 'safety') => void,
  user: User,
  filteredPosts: Post[]
}) {
  // Filter posts that match the user's skills and interests
  const matchingPosts = filteredPosts.filter(post => {
    if (post.type !== 'problem') return false;
    
    // Check if any of the post's tags match user's skills or interests
    const userSkills = user.profile.skills || [];
    const userInterests = user.profile.interests || [];
    
    return post.tags.some(tag => 
      userSkills.includes(tag) || 
      userInterests.includes(tag) ||
      post.category === "Emergency" // Always include emergency posts
    );
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {/* Search */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Requests"
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      
      {/* View Toggle */}
      <div className="bg-gray-100 rounded-lg mb-6">
        <div className="flex p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 flex justify-center items-center py-2 px-4 rounded-md ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ListBulletIcon className="h-5 w-5 mr-2" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 flex justify-center items-center py-2 px-4 rounded-md ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MapIcon className="h-5 w-5 mr-2" />
            <span>Map View</span>
          </button>
        </div>
      </div>
      
      {/* Safety section */}
      <div className="mb-4">
        <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">
          Safety Resources
        </h2>
        <div className="space-y-1">
          <button
            onClick={() => setSidebarView('safety')}
            className={`w-full text-left flex items-center px-3 py-2 rounded-md ${
              sidebarView === 'safety' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShieldCheckIcon className="h-5 w-5 mr-3 text-gray-400" />
            <span>Safety & Verification</span>
          </button>
        </div>
      </div>
      
      {/* Safety Content */}
      {sidebarView === 'safety' && (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Safety Guidelines</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <div className="p-1 bg-blue-100 rounded-full mt-0.5 mr-2">
                <CheckCircleIcon className="h-4 w-4 text-blue-700" />
              </div>
              <p>Meet in public places for first-time interactions</p>
            </div>
            <div className="flex items-start">
              <div className="p-1 bg-blue-100 rounded-full mt-0.5 mr-2">
                <CheckCircleIcon className="h-4 w-4 text-blue-700" />
              </div>
              <p>Share your meeting details with a trusted contact</p>
            </div>
            <div className="flex items-start">
              <div className="p-1 bg-blue-100 rounded-full mt-0.5 mr-2">
                <CheckCircleIcon className="h-4 w-4 text-blue-700" />
              </div>
              <p>Verify identity through our verification system</p>
            </div>
            <div className="flex items-start">
              <div className="p-1 bg-blue-100 rounded-full mt-0.5 mr-2">
                <CheckCircleIcon className="h-4 w-4 text-blue-700" />
              </div>
              <p>Trust your instincts - cancel if something feels wrong</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
            <h4 className="font-medium text-yellow-800 mb-1">Verification Status</h4>
            <p className="text-sm text-yellow-700">
              Your account is partially verified. Complete ID verification to unlock all features.
            </p>
            <button className="mt-2 text-sm bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-300">
              Complete Verification
            </button>
          </div>
          
          <div className="mt-4">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Download Safety Guide
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

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
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarView, setSidebarView] = useState<'safety'>('safety')
  const [showFilters, setShowFilters] = useState(false)

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

  // Apply all filters and search query
  const filteredPosts = processedPosts.filter(post => {
    // Search query filter
    if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !post.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !post.category.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Existing filters
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
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <Sidebar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sidebarView={sidebarView}
              setSidebarView={setSidebarView}
              user={user}
              filteredPosts={filteredPosts}
            />
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-3">
            <div className="mt-4 flex justify-between items-center">
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
            </div>

            <div className="mt-6">
              {/* Post Creation Section */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      {user.profile.avatar || "🧑"}
                    </div>
                  </div>
                  <div className="flex-grow flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                    <span className="text-gray-500">Need a help, {user.name.split(' ')[0]}?</span>
                    <button className="ml-auto bg-blue-600 text-white px-4 py-1 rounded-md">
                      Ask
                    </button>
                  </div>
                </div>

                <div className="flex mt-4 space-x-4">
                  <button className="flex-1 flex items-center justify-center text-sm text-gray-600 py-1.5 hover:bg-gray-50 rounded-md">
                    <CameraIcon className="h-5 w-5 mr-2 text-green-500" />
                    Photo/Video
                  </button>
                  <button className="flex-1 flex items-center justify-center text-sm text-gray-600 py-1.5 hover:bg-gray-50 rounded-md">
                    <EyeSlashIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Anonymous
                  </button>
                  <button className="flex-1 flex items-center justify-center text-sm text-gray-600 py-1.5 hover:bg-gray-50 rounded-md">
                    <MapPinIcon className="h-5 w-5 mr-2 text-red-500" />
                    Location
                  </button>
                </div>
              </div>

              {/* Filter Toolbar */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <h3 className="font-medium">Filter Posts</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={resetFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Reset Filters
                    </button>
                    <button 
                      onClick={() => setShowFilters(!showFilters)} 
                      className="text-sm flex items-center text-gray-600"
                    >
                      {showFilters ? (
                        <>
                          <ChevronUpIcon className="h-4 w-4 mr-1" />
                          Hide Filters
                        </>
                      ) : (
                        <>
                          <ChevronDownIcon className="h-4 w-4 mr-1" />
                          Show Filters
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {showFilters && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Post Type */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Post Type</label>
                        <div className="relative">
                          <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                          <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-2 top-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                        <div className="relative">
                          <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                          <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-2 top-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Distance */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Distance</label>
                        <div className="relative">
                          <select
                            value={filterDistance}
                            onChange={(e) => setFilterDistance(e.target.value)}
                            className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="">All Distances</option>
                            <option value="1">Within 1 km</option>
                            <option value="5">Within 5 km</option>
                            <option value="10">Within 10 km</option>
                            <option value="50">Within 50 km</option>
                            <option value="100">Within 100 km</option>
                          </select>
                          <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-2 top-2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {/* Urgency */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Urgency</label>
                        <div className="relative">
                          <select
                            value={filterUrgency}
                            onChange={(e) => setFilterUrgency(e.target.value)}
                            className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="">All Urgency Levels</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                          <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-2 top-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <div className="relative">
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                          <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-2 top-2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Life Spoke */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Life Spoke</label>
                        <div className="relative">
                          <select
                            value={filterLifeSpoke}
                            onChange={(e) => setFilterLifeSpoke(e.target.value as LifeSpoke | "")}
                            className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="">All Life Spokes</option>
                            {LIFE_SPOKES.map(spoke => (
                              <option key={spoke.id} value={spoke.id}>{spoke.name}</option>
                            ))}
                          </select>
                          <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-2 top-2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      {/* Tag Search */}
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tag Search</label>
                      <input
                        type="text"
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        placeholder="Search by tag"
                        className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </>
                )}

                <div className="mt-4 border-t pt-4 flex justify-between items-center">
                  <label className="block text-xs font-medium text-gray-500">Sort By</label>
                  <div className="relative w-48">
                    <select
                      value={sortMethod}
                      onChange={(e) => setSortMethod(e.target.value as 'proximity' | 'time' | 'urgency' | 'upvotes')}
                      className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="proximity">Proximity</option>
                      <option value="time">Most Recent</option>
                      <option value="urgency">Urgency</option>
                      <option value="upvotes">Most Upvoted</option>
                    </select>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 absolute right-2 top-2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Dashboard Content - Active Posts */}
              {dashboardView === 'active' && (
                viewMode === 'list' ? (
                  <div className="space-y-6">
                    {sortedPosts.length > 0 ? (
                      sortedPosts.map(post => (
                        <PostCard key={post.id} post={post} user={user} />
                      ))
                    ) : (
                      <div className="bg-white p-8 rounded-lg shadow text-center">
                        <LifebuoyIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No posts found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search criteria</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 bg-blue-50 border-b">
                      <h3 className="font-medium">Map View</h3>
                      <p className="text-sm text-gray-500">Showing {sortedPosts.length} help requests nearby</p>
                    </div>
                    <div className="h-[600px] bg-gray-100 flex items-center justify-center">
                      {isClient ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <p className="text-gray-500">Interactive map would load here showing all nearby help requests as pins</p>
                        </div>
                      ) : (
                        <p>Loading map...</p>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 border-t">
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                          <span className="text-xs">Emergency</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                          <span className="text-xs">Medium Urgency</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                          <span className="text-xs">Low Urgency</span>
                        </div>
                        <div className="flex items-center ml-auto">
                          <MapPinIcon className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-xs">Your Location</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Dashboard Content - History */}
              {dashboardView === 'history' && (
                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                  <div className="border-b border-gray-200">
                    <div className="px-6 py-4">
                      <h2 className="text-xl font-semibold text-gray-900">Help History</h2>
                      <p className="mt-1 text-sm text-gray-500">Track your impact and interactions in the community</p>
                    </div>
                    <div className="px-6 py-3 bg-gray-50 flex flex-wrap gap-3">
                      <button className="bg-blue-600 text-white px-3 py-1 text-sm rounded-md">All History</button>
                      <button className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1 text-sm rounded-md">Help Provided</button>
                      <button className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1 text-sm rounded-md">Help Received</button>
                      <button className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1 text-sm rounded-md">Pending</button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Help Provided</h3>
                            <p className="text-sm text-gray-500">People you've helped</p>
                          </div>
                          <div className="bg-blue-100 text-blue-800 text-xl font-bold px-3 py-1 rounded-full">
                            {user.profile.helpProvided}
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-600 rounded-full" 
                            style={{ width: `${Math.min((user.profile.helpProvided / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-right text-gray-500 mt-1">
                          {20 - user.profile.helpProvided > 0 ? `${20 - user.profile.helpProvided} more to Gold level` : 'Gold level achieved!'}
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Help Received</h3>
                            <p className="text-sm text-gray-500">Times you got help</p>
                          </div>
                          <div className="bg-green-100 text-green-800 text-xl font-bold px-3 py-1 rounded-full">
                            {user.profile.helpReceived}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-3">
                          <span className="text-gray-500">Balance ratio:</span>
                          <span className="font-medium">
                            {user.profile.helpProvided > 0 
                              ? (user.profile.helpProvided / (user.profile.helpReceived || 1)).toFixed(1) 
                              : 0} : 1
                          </span>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Badges Earned</h3>
                            <p className="text-sm text-gray-500">Recognitions of your impact</p>
                          </div>
                          <div className="bg-purple-100 text-purple-800 text-xl font-bold px-3 py-1 rounded-full">
                            2
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <div className="flex-1 flex flex-col items-center p-2 bg-white rounded-md">
                            <span className="text-xl">🌟</span>
                            <span className="text-xs text-gray-600 mt-1">First Help</span>
                          </div>
                          <div className="flex-1 flex flex-col items-center p-2 bg-white rounded-md">
                            <span className="text-xl">🙏</span>
                            <span className="text-xs text-gray-600 mt-1">Gratitude</span>
                          </div>
                          <button className="flex-1 flex flex-col items-center p-2 bg-purple-100 rounded-md">
                            <span className="text-xl">+</span>
                            <span className="text-xs text-purple-800 mt-1">View All</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>

                    {/* Timeline of help history */}
                    <div className="relative border-l-2 border-gray-200 pl-6 space-y-10 py-2">
                      {/* First help entry */}
                      <div className="relative">
                        <div className="absolute -left-9 mt-1.5 h-5 w-5 rounded-full border-4 border-white bg-blue-500"></div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 rounded-full px-2 py-0.5">Helped</span>
                            <h4 className="text-base font-medium text-gray-900 mt-1">Tutored Ahmed in Math</h4>
                            <p className="text-sm text-gray-500 mt-1">1 week ago • Education Category</p>
                            <div className="mt-2 text-sm">
                              <p className="text-gray-700">Helped Ahmed prepare for his calculus exam. He said it really improved his understanding.</p>
                            </div>
                          </div>
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <div className="flex items-center">
                              <UserCircleIcon className="h-5 w-5 text-gray-500 mr-1" />
                              <span className="text-sm font-medium">Ahmed</span>
                            </div>
                            <div className="flex mt-1">
                              <span className="text-yellow-500">★★★★★</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-3">
                          <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center">
                            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                            View Details
                          </button>
                          <button className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-md">
                            Message Ahmed
                          </button>
                        </div>
                      </div>

                      {/* Second help entry */}
                      <div className="relative">
                        <div className="absolute -left-9 mt-1.5 h-5 w-5 rounded-full border-4 border-white bg-green-500"></div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-medium text-green-600 bg-green-100 rounded-full px-2 py-0.5">Received</span>
                            <h4 className="text-base font-medium text-gray-900 mt-1">Received help with moving</h4>
                            <p className="text-sm text-gray-500 mt-1">3 weeks ago • Physical Category</p>
                            <div className="mt-2 text-sm">
                              <p className="text-gray-700">Maria helped me move into my new apartment. She was incredibly helpful with the heavy lifting.</p>
                            </div>
                          </div>
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <div className="flex items-center">
                              <UserCircleIcon className="h-5 w-5 text-gray-500 mr-1" />
                              <span className="text-sm font-medium">Maria</span>
                            </div>
                            <button className="mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              Add Rating
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-3">
                          <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center">
                            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                            View Details
                          </button>
                          <button className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-md">
                            Say Thanks
                          </button>
                        </div>
                      </div>
                      
                      {/* Third help entry */}
                      <div className="relative">
                        <div className="absolute -left-9 mt-1.5 h-5 w-5 rounded-full border-4 border-white bg-blue-500"></div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 rounded-full px-2 py-0.5">Helped</span>
                            <h4 className="text-base font-medium text-gray-900 mt-1">Helped Maria with groceries</h4>
                            <p className="text-sm text-gray-500 mt-1">2 days ago • Food Category</p>
                            <div className="mt-2 text-sm">
                              <p className="text-gray-700">Went shopping for groceries for Maria when she was sick. Delivered them to her doorstep.</p>
                            </div>
                          </div>
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <div className="flex items-center">
                              <UserCircleIcon className="h-5 w-5 text-gray-500 mr-1" />
                              <span className="text-sm font-medium">Maria</span>
                            </div>
                            <div className="flex mt-1">
                              <span className="text-yellow-500">★★★★<span className="text-gray-300">★</span></span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-3">
                          <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center">
                            <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                            View Details
                          </button>
                          <button className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-md">
                            Message Maria
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Full History
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dashboard Content - Stats */}
              {dashboardView === 'stats' && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Statistics Coming Soon</h3>
                  <p className="text-gray-500">We're working on detailed analytics for your help activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 

// Add this component to render the post cards
function PostCard({ post, user }: { post: Post, user: User }) {
  const postDate = new Date(post.timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - postDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  let timeAgo = '';
  if (diffDays > 0) {
    timeAgo = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffHours > 0) {
    timeAgo = `${diffHours} ${diffHours === 1 ? 'hr' : 'hrs'} ago`;
  } else {
    timeAgo = `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'} ago`;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
              {post.user?.profile.avatar || "👤"}
            </div>
            <div>
              <div className="font-medium">
                {post.anonymous ? "Anonymous User" : post.user?.name}
                {post.user?.profile.verified && (
                  <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    <CheckCircleIcon className="h-3 w-3 mr-0.5" />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span>{timeAgo}</span>
                <span className="mx-1">•</span>
                {post.distance && (
                  <>
                    <span>{post.distance.toFixed(1)} km away</span>
                    <span className="mx-1">•</span>
                  </>
                )}
                <span className={`px-1.5 py-0.5 rounded-sm ${
                  post.status === 'open' ? 'bg-green-100 text-green-800' :
                  post.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {post.status === 'open' ? 'Open' : 
                   post.status === 'in-progress' ? 'In Progress' : 
                   'Resolved'}
                </span>
              </div>
            </div>
          </div>
          <div>
            {post.verification?.status === 'verified' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <CheckCircleIcon className="h-3 w-3 mr-0.5" />
                Verified Need
              </span>
            )}
          </div>
        </div>
        <h3 className="text-lg font-medium mt-2">{post.content}</h3>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center h-72">
          {/* This would be an actual image in a real implementation */}
          <div className="text-white text-opacity-80">Media content would be displayed here</div>
        </div>
      )}

      {/* Tags and Category */}
      <div className="px-4 py-3 bg-gray-50 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          post.category === 'Emergency' ? 'bg-red-100 text-red-800' :
          post.category === 'Health' ? 'bg-green-100 text-green-800' :
          post.category === 'Education' ? 'bg-blue-100 text-blue-800' :
          post.category === 'Food' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {post.category}
        </span>

        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          post.urgency === 'high' ? 'bg-red-100 text-red-800' :
          post.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {post.urgency.charAt(0).toUpperCase() + post.urgency.slice(1)} urgency
        </span>

        {post.availableTimes && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Available: {post.availableTimes[0]}
          </span>
        )}

        {post.tags.map((tag, idx) => (
          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            #{tag}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-3 border-t flex">
        <button className="flex-1 flex justify-center items-center text-sm font-medium text-blue-600 hover:text-blue-800 py-1">
          <HandThumbUpIcon className="h-5 w-5 mr-1.5" />
          I'll Help
        </button>
        <div className="border-l"></div>
        <button className="flex-1 flex justify-center items-center text-sm font-medium text-gray-600 hover:text-gray-800 py-1">
          <ChatBubbleLeftIcon className="h-5 w-5 mr-1.5" />
          Comment
        </button>
        <div className="border-l"></div>
        <button className="flex-1 flex justify-center items-center text-sm font-medium text-gray-600 hover:text-gray-800 py-1">
          <ShareIcon className="h-5 w-5 mr-1.5" />
          Share
        </button>
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t bg-gray-50 flex justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <span className="inline-flex items-center">
            <HandThumbUpIcon className="h-3.5 w-3.5 text-blue-500 mr-1" />
            {post.upvotes} support reactions
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span>97 comments</span>
          <span>24 shares</span>
        </div>
      </div>

      {/* Enhanced Features */}
      <div className="p-3 border-t bg-blue-50 flex justify-between text-xs">
        <button className="flex items-center text-blue-600 hover:text-blue-800">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Live Check-In
        </button>
        <button className="flex items-center text-blue-600 hover:text-blue-800">
          <CalendarIcon className="h-4 w-4 mr-1" />
          Add to Calendar
        </button>
        <button className="flex items-center text-blue-600 hover:text-blue-800">
          <UserGroupIcon className="h-4 w-4 mr-1" />
          Group Up
        </button>
      </div>
    </div>
  );
}