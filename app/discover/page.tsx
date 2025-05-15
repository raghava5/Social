'use client'

import { useState } from 'react'
import TopNav from '../components/TopNav'
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  TrophyIcon,
  CalendarIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  BoltIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  SparklesIcon,
  AcademicCapIcon,
  HeartIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  UsersIcon,
  UserIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

// Types for activities data structure
type Activity = {
  id: number
  name: string
  completed: boolean
  level: 'Beginner' | 'Intermediate' | 'Professional'
}

type Subcategory = {
  id: string
  name: string
  activities: Activity[]
}

type Spoke = {
  id: string
  name: string
  icon: any
  progress: number
  subcategories: Subcategory[]
}

// Dummy data for demonstration - Using complete data from activities page
const spokes: Spoke[] = [
  {
    id: 'spiritual',
    name: 'Spiritual',
    icon: SparklesIcon,
    progress: 75,
    subcategories: [
      {
        id: 'meditation',
        name: 'Meditation & Mindfulness',
        activities: [
          { id: 1, name: 'Sit quietly for 1 minute focusing on your breath', completed: false, level: 'Beginner' },
          { id: 2, name: 'Practice 3-minute mindful breathing', completed: false, level: 'Beginner' },
          { id: 3, name: 'Follow a 5-minute guided meditation', completed: false, level: 'Beginner' },
          { id: 4, name: 'Journal thoughts after meditation', completed: false, level: 'Beginner' },
          { id: 5, name: 'Try body scan meditation', completed: false, level: 'Beginner' }
        ]
      },
      {
        id: 'critical-thinking',
        name: 'Critical Thinking & Logic',
        activities: [
          { id: 1, name: 'Solve a basic puzzle or riddle', completed: false, level: 'Beginner' },
          { id: 2, name: 'Analyze both sides of a simple issue', completed: false, level: 'Beginner' },
          { id: 3, name: 'Watch a logic-based video', completed: false, level: 'Beginner' },
          { id: 4, name: 'Read a short article critically', completed: false, level: 'Beginner' },
          { id: 5, name: 'Learn about logical fallacies', completed: false, level: 'Beginner' }
        ]
      }
    ]
  },
  {
    id: 'mental',
    name: 'Mental',
    icon: AcademicCapIcon,
    progress: 60,
    subcategories: [
      {
        id: 'critical-thinking',
        name: 'Critical Thinking & Logic',
        activities: [
          { id: 1, name: 'Solve a basic puzzle or riddle', completed: false, level: 'Beginner' },
          { id: 2, name: 'Analyze both sides of a simple issue', completed: false, level: 'Beginner' },
          { id: 3, name: 'Watch a logic-based video', completed: false, level: 'Beginner' },
          { id: 4, name: 'Read a short article critically', completed: false, level: 'Beginner' },
          { id: 5, name: 'Learn about logical fallacies', completed: false, level: 'Beginner' }
        ]
      }
    ]
  }
];

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('activities')
  const [selectedSpoke, setSelectedSpoke] = useState<Spoke | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Discover</h1>
          <p className="mt-2 text-gray-600">
            Find new activities, communities, and resources
          </p>
        </div>
        
        {/* Main Tabs */}
        <div className="mb-6 bg-white inline-flex rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'activities'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'explore'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-6 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'tools'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`px-6 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'games'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Mini Games
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'activities' ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Interactive Learning</h2>
            
            {/* Learning Modules */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Learning Modules</h3>
                <select className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option>All Categories</option>
                  <option>Physical</option>
                  <option>Mental</option>
                  <option>Financial</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg overflow-hidden shadow">
                  <div className="h-40 bg-blue-100 relative">
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Physical
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <HeartIcon className="h-16 w-16 text-blue-500 opacity-50" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-semibold text-lg mb-2">Nutrition Basics</h4>
                    <p className="text-gray-600 text-sm mb-4">Learn the fundamentals of a balanced diet and how nutrition affects your overall health.</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">15 min • Beginner</span>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Start</button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg overflow-hidden shadow">
                  <div className="h-40 bg-purple-100 relative">
                    <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Mental
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <AcademicCapIcon className="h-16 w-16 text-purple-500 opacity-50" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-semibold text-lg mb-2">Mindfulness 101</h4>
                    <p className="text-gray-600 text-sm mb-4">Introduction to mindfulness practices and how they can reduce stress and improve focus.</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">10 min • Beginner</span>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Start</button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg overflow-hidden shadow">
                  <div className="h-40 bg-green-100 relative">
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Financial
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BanknotesIcon className="h-16 w-16 text-green-500 opacity-50" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-semibold text-lg mb-2">Budgeting Essentials</h4>
                    <p className="text-gray-600 text-sm mb-4">Learn how to create and stick to a budget that aligns with your financial goals.</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">20 min • Beginner</span>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Start</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expert Insights */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Expert Insights</h3>
                <button className="text-blue-600 text-sm hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-5 shadow flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                      <div className="flex items-center justify-center h-full bg-blue-100">
                        <UserCircleIcon className="h-14 w-14 text-blue-500" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Sleep Science Decoded</h4>
                    <p className="text-sm text-gray-500 mb-2">Dr. Sarah Johnson, Sleep Specialist</p>
                    <p className="text-sm text-gray-600 mb-3">Learn about the biology of sleep and practical tips for better rest.</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="flex items-center"><CalendarIcon className="h-3 w-3 mr-1" /> Podcast • 25 min</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-5 shadow flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                      <div className="flex items-center justify-center h-full bg-green-100">
                        <UserCircleIcon className="h-14 w-14 text-green-500" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Investing for Beginners</h4>
                    <p className="text-sm text-gray-500 mb-2">Mark Roberts, Financial Advisor</p>
                    <p className="text-sm text-gray-600 mb-3">Simple strategies to start building wealth through smart investments.</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="flex items-center"><CalendarIcon className="h-3 w-3 mr-1" /> Video • 15 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Two-column layout for personalized and progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Personalized Content */}
              <div className="bg-white rounded-lg shadow p-5">
                <h3 className="text-xl font-semibold mb-4">Recommended For You</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <SparklesIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">5-Minute Meditation</h4>
                      <p className="text-sm text-gray-600">Perfect for your busy schedule - reduce stress with this quick practice.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <HeartIcon className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Desk Stretches</h4>
                      <p className="text-sm text-gray-600">Based on your interest in physical health and work habits.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <BriefcaseIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Work-Life Balance Guide</h4>
                      <p className="text-sm text-gray-600">Practical tips for maintaining equilibrium in your busy life.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Tracking */}
              <div className="bg-white rounded-lg shadow p-5">
                <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-2">
                      <span className="text-xl font-bold text-blue-600">3</span>
                    </div>
                    <p className="text-sm text-gray-600">Modules Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-2">
                      <span className="text-xl font-bold text-green-600">2</span>
                    </div>
                    <p className="text-sm text-gray-600">Badges Earned</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-2">
                      <span className="text-xl font-bold text-purple-600">5</span>
                    </div>
                    <p className="text-sm text-gray-600">Days Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-2">
                      <span className="text-xl font-bold text-yellow-600">35</span>
                    </div>
                    <p className="text-sm text-gray-600">Points Earned</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 30-Day Challenges */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">30-Day Challenges</h3>
                <button className="text-blue-600 text-sm hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg overflow-hidden shadow">
                  <div className="h-3 bg-blue-600"></div>
                  <div className="p-5">
                    <h4 className="font-semibold text-lg mb-2">Gratitude Journal</h4>
                    <p className="text-gray-600 text-sm mb-4">Strengthen relationships by practicing daily gratitude for 30 days.</p>
                    <div className="mb-3 bg-gray-200 h-2 rounded-full">
                      <div className="bg-blue-600 h-2 rounded-full w-1/4"></div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Day 8 of 30</span>
                      <span>Social Spoke</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg overflow-hidden shadow">
                  <div className="h-3 bg-green-600"></div>
                  <div className="p-5">
                    <h4 className="font-semibold text-lg mb-2">No-Spend Month</h4>
                    <p className="text-gray-600 text-sm mb-4">Track your spending and find ways to reduce non-essential purchases.</p>
                    <div className="mb-3 bg-gray-200 h-2 rounded-full">
                      <div className="bg-green-600 h-2 rounded-full w-1/2"></div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Day 15 of 30</span>
                      <span>Financial Spoke</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg overflow-hidden shadow">
                  <div className="h-3 bg-purple-600"></div>
                  <div className="p-5">
                    <h4 className="font-semibold text-lg mb-2">Morning Meditation</h4>
                    <p className="text-gray-600 text-sm mb-4">Build a consistent meditation practice in just 5 minutes per day.</p>
                    <div className="mb-3 bg-gray-200 h-2 rounded-full">
                      <div className="bg-purple-600 h-2 rounded-full w-3/4"></div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Day 23 of 30</span>
                      <span>Mental Spoke</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Microlearning Tip */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Today's Microlearning</h3>
                <button className="text-blue-600 text-sm hover:underline">Next Tip</button>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs mb-4">Did You Know?</span>
                    <h4 className="text-xl font-semibold mb-2">10 Minutes of Stretching</h4>
                    <p className="mb-4">Just 10 minutes of morning stretching can increase your energy levels for hours and improve circulation throughout the day.</p>
                    <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm">Learn More</button>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                    <HeartIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Community Wisdom */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Community Wisdom</h3>
                <button className="text-blue-600 text-sm hover:underline">See All</button>
              </div>
              <div className="bg-white rounded-lg shadow">
                <div className="p-5 border-b">
                  <h4 className="font-semibold mb-3">Top Discussions</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <UserIcon className="h-4 w-4 text-blue-600" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">How I balanced work and family</p>
                          <p className="text-xs text-gray-500">32 comments • Work-Life Balance</p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 py-1 px-2 rounded-full">Social</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <UserIcon className="h-4 w-4 text-green-600" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">My debt-free journey: 5 lessons learned</p>
                          <p className="text-xs text-gray-500">18 comments • Financial Freedom</p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 py-1 px-2 rounded-full">Financial</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <UserIcon className="h-4 w-4 text-purple-600" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">Morning routines that changed my life</p>
                          <p className="text-xs text-gray-500">47 comments • Habits & Routines</p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 py-1 px-2 rounded-full">Mental</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <button className="w-full py-2 text-blue-600 font-medium text-sm hover:bg-blue-50 rounded-lg transition-colors">Join the Community</button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'explore' ? (
          <div>
            {/* Three-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Life Spokes */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Life Spokes</h2>
                <div className="space-y-2">
                  {spokes.map((spoke) => (
                    <button
                      key={spoke.id}
                      onClick={() => {
                        setSelectedSpoke(spoke)
                        setSelectedSubcategory(null)
                      }}
                      className={`w-full text-left px-4 py-2 rounded ${
                        selectedSpoke?.id === spoke.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <spoke.icon className="h-5 w-5 mr-2" />
                        <span>{spoke.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Middle Column - Categories */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                {selectedSpoke ? (
                  <div className="space-y-2">
                    {selectedSpoke.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => setSelectedSubcategory(subcategory)}
                        className={`w-full text-left px-4 py-2 rounded ${
                          selectedSubcategory?.id === subcategory.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {subcategory.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Select a life spoke to view categories</p>
                )}
              </div>

              {/* Right Column - Activities */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Activities</h2>
                {selectedSubcategory ? (
                  <div className="space-y-2">
                    {selectedSubcategory.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 rounded border hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{activity.name}</span>
                          <span className="text-xs text-gray-500">{activity.level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Select a category to view activities</p>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'tools' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Growth Tools</h2>
            
            {/* Tool Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
              <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-4 py-2 text-blue-700 font-medium text-sm flex items-center justify-center">
                <HeartIcon className="h-5 w-5 mr-2" />
                Physical 
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg px-4 py-2 text-purple-700 font-medium text-sm flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Mental
              </button>
              <button className="bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg px-4 py-2 text-pink-700 font-medium text-sm flex items-center justify-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                Relationships
              </button>
              <button className="bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-4 py-2 text-amber-700 font-medium text-sm flex items-center justify-center">
                <BriefcaseIcon className="h-5 w-5 mr-2" />
                Career
              </button>
              <button className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-4 py-2 text-green-700 font-medium text-sm flex items-center justify-center">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Finances
              </button>
            </div>

            {/* Physical Health */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-700">
                <HeartIcon className="h-6 w-6 mr-2" />
                Physical Health
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Fitness Planner</h4>
                  <p className="text-gray-600 text-sm mb-4">Customizable workout routines with video tutorials, tracking for steps, calories, or sleep via integrations.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Workouts</span>
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Tracking</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Create Plan
                  </button>
                </div>
                
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Nutrition Tracker</h4>
                  <p className="text-gray-600 text-sm mb-4">Meal planning tool with recipes, grocery lists, and calorie/nutrient tracking tailored to dietary preferences.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Recipes</span>
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Nutrition</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Track Meals
                  </button>
                </div>
                
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Health Reminders</h4>
                  <p className="text-gray-600 text-sm mb-4">Alerts for hydration, standing up, or doctor appointments with customizable notification methods.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Alerts</span>
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Scheduling</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Set Reminders
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mental Well-Being */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-purple-700">
                <AcademicCapIcon className="h-6 w-6 mr-2" />
                Mental Well-Being
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Meditation & Mindfulness</h4>
                  <p className="text-gray-600 text-sm mb-4">Guided sessions, breathing exercises, and mood trackers to manage stress and anxiety for daily mental wellness.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Meditation</span>
                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Stress</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Start Session
                  </button>
                </div>
                
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Journaling Tool</h4>
                  <p className="text-gray-600 text-sm mb-4">Prompts for gratitude, self-reflection, or goal-setting, with exportable entries for personal records.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Prompts</span>
                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Reflection</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Write Journal
                  </button>
                </div>
                
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Therapy Connector</h4>
                  <p className="text-gray-600 text-sm mb-4">Directory of licensed therapists or affordable online counseling platforms with filtering by specialty.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Support</span>
                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Professional</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Find Support
                  </button>
                </div>
              </div>
            </div>
            
            {/* Relationships */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-pink-700">
                <UsersIcon className="h-6 w-6 mr-2" />
                Relationships
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Connection Planner</h4>
                  <p className="text-gray-600 text-sm mb-4">Calendar tool to schedule quality time with family/friends, with reminders for birthdays or anniversaries.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">Quality Time</span>
                    <span className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">Reminders</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                    Plan Connection
                  </button>
                </div>
                
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Communication Tips</h4>
                  <p className="text-gray-600 text-sm mb-4">Templates for difficult conversations like resolving conflicts or expressing appreciation effectively.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">Templates</span>
                    <span className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">Conflict</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                    Get Tips
                  </button>
                </div>
                
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Partner Compatibility Quiz</h4>
                  <p className="text-gray-600 text-sm mb-4">Fun assessments to understand relationship dynamics and improve communication with your partner.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">Quiz</span>
                    <span className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">Insights</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                    Take Quiz
                  </button>
                </div>
              </div>
            </div>
            
            {/* Career */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-amber-700">
                <BriefcaseIcon className="h-6 w-6 mr-2" />
                Career
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Skill-Building Tracker</h4>
                  <p className="text-gray-600 text-sm mb-4">Tool to set career goals, track certifications, or log professional development hours with progress metrics.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">Skills</span>
                    <span className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">Growth</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                    Track Skills
                  </button>
                </div>
                
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Resume Builder</h4>
                  <p className="text-gray-600 text-sm mb-4">Templates and AI-driven feedback to create or improve resumes tailored to specific industries.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">Templates</span>
                    <span className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">AI Feedback</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                    Build Resume
                  </button>
                </div>
                
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Networking Hub</h4>
                  <p className="text-gray-600 text-sm mb-4">Integration with platforms like LinkedIn or in-app networking events to expand professional connections.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">Connections</span>
                    <span className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">Events</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                    Connect
                  </button>
                </div>
              </div>
            </div>
            
            {/* Finances */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-green-700">
                <BanknotesIcon className="h-6 w-6 mr-2" />
                Finances
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Budget Planner</h4>
                  <p className="text-gray-600 text-sm mb-4">Interactive tool to track income, expenses, and savings goals, with visualizations of your financial health.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Budgeting</span>
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Tracking</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Create Budget
                  </button>
                </div>
                
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Investment Simulator</h4>
                  <p className="text-gray-600 text-sm mb-4">Risk-free environment to learn about stocks, crypto, or mutual funds with virtual portfolio management.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Simulation</span>
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Learning</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Start Investing
                  </button>
                </div>
                
                <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold mb-2">Debt Payoff Calculator</h4>
                  <p className="text-gray-600 text-sm mb-4">Tool to strategize debt repayment with timelines and interest calculations for different payment methods.</p>
                  <div className="flex space-x-2">
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Planning</span>
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Debt Free</span>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Calculate Plan
                  </button>
                </div>
              </div>
            </div>
            
            {/* View More button */}
            <div className="text-center mt-6">
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
                Show More Categories
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mini Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Game Cards */}
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-3">Daily Quest</h3>
                <p className="text-gray-600 text-sm mb-4">Complete daily challenges across different life spokes</p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Start Quest
                </button>
              </div>
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-3">Habit Builder</h3>
                <p className="text-gray-600 text-sm mb-4">Build lasting habits through gamified challenges</p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Build Habits
                </button>
              </div>
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-3">Skill Tree</h3>
                <p className="text-gray-600 text-sm mb-4">Level up your life skills RPG-style</p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Tree
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 