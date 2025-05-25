'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useParams } from 'next/navigation'
import TopNav from '../../components/TopNav'
import {
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  BookmarkIcon,
  CogIcon,
  HeartIcon,
  StarIcon,
  TrophyIcon,
  LightBulbIcon,
  ClockIcon,
  AcademicCapIcon,
  SparklesIcon,
  PhotoIcon,
  VideoCameraIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  bio?: string
  profileImageUrl?: string
  coverImageUrl?: string
  location?: string
  website?: string
  isPrivate: boolean
  createdAt: string
}

// Dummy data for demonstration
const spokes = [
  { id: 1, name: 'Spiritual', progress: 75, color: 'bg-purple-500', activities: 12 },
  { id: 2, name: 'Mental', progress: 60, color: 'bg-blue-500', activities: 8 },
  { id: 3, name: 'Physical', progress: 85, color: 'bg-green-500', activities: 15 },
  { id: 4, name: 'Personal', progress: 45, color: 'bg-pink-500', activities: 6 },
  { id: 5, name: 'Professional', progress: 70, color: 'bg-yellow-500', activities: 10 },
  { id: 6, name: 'Financial', progress: 55, color: 'bg-red-500', activities: 7 },
  { id: 7, name: 'Social', progress: 80, color: 'bg-indigo-500', activities: 14 },
]

export default function UserProfile() {
  const { user: currentUser } = useAuth()
  const params = useParams()
  const userId = params?.userId as string
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeSection, setActiveSection] = useState('overview')

  const isOwnProfile = currentUser?.id === userId

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${userId}`)
        
        if (!response.ok) {
          throw new Error('User not found')
        }
        
        const userData = await response.json()
        setUserProfile(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'about', name: 'About', icon: UserIcon },
    { id: 'timeline', name: 'Timeline', icon: ClockIcon },
    { id: 'friends', name: 'Friends', icon: UserGroupIcon },
    { id: 'photos', name: 'Photos', icon: PhotoIcon },
    { id: 'videos', name: 'Videos', icon: VideoCameraIcon },
    { id: 'more', name: 'More', icon: ClipboardDocumentListIcon },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'This user profile does not exist.'}</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="pt-16">
        {/* Cover Photo */}
        <div className="h-80 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {userProfile.coverImageUrl && (
            <img 
              src={userProfile.coverImageUrl} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden">
              {userProfile.profileImageUrl ? (
                <img 
                  src={userProfile.profileImageUrl} 
                  alt={`${userProfile.firstName} ${userProfile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pt-20 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userProfile.firstName} {userProfile.lastName}
                  </h1>
                  <p className="text-gray-600 mt-1">{userProfile.email}</p>
                  {userProfile.location && (
                    <p className="text-gray-500 text-sm mt-1">📍 {userProfile.location}</p>
                  )}
                </div>
                
                {isOwnProfile ? (
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Add Friend
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                      Message
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-8 border-b border-gray-200">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Seven Spokes Health Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Seven Spokes Health</h3>
                  <div className="space-y-4">
                    {spokes.map((spoke) => (
                      <div key={spoke.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{spoke.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${spoke.color}`}
                              style={{ width: `${spoke.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{spoke.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mood Tracker */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Mood</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">😊</span>
                      <div className="flex-1 ml-3">
                        <p className="text-sm font-medium">Happy</p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-6">
                {/* Recent Activities */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Completed meditation</p>
                        <p className="text-xs text-gray-500">15 minutes • 2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goals & Progress */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Goals & Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Daily Meditation</span>
                        <span>24/30 days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Achievements */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl mb-1">🏆</div>
                      <p className="text-xs font-medium">Mindfulness Master</p>
                    </div>
                  </div>
                </div>

                {/* Help Exchange Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Help Exchange</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Help Given</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Help Received</span>
                      <span className="text-sm font-medium">8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">About {userProfile.firstName}</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Name</h4>
                      <p className="text-gray-600">{userProfile.firstName} {userProfile.lastName}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <p className="text-gray-600">{userProfile.email}</p>
                    </div>
                    {userProfile.location && (
                      <div>
                        <h4 className="font-medium">Location</h4>
                        <p className="text-gray-600">{userProfile.location}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {userProfile.bio && (
                      <div>
                        <h4 className="font-medium">Bio</h4>
                        <p className="text-gray-600">{userProfile.bio}</p>
                      </div>
                    )}
                    {userProfile.website && (
                      <div>
                        <h4 className="font-medium">Website</h4>
                        <a href={userProfile.website} className="text-blue-600 hover:underline">
                          {userProfile.website}
                        </a>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">Joined</h4>
                      <p className="text-gray-600">
                        {new Date(userProfile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">{userProfile.firstName}'s Timeline</h2>
              <p className="text-gray-600">Timeline content will be displayed here.</p>
            </div>
          )}

          {/* Add other tab content as needed */}
        </div>
      </div>
    </div>
  )
} 