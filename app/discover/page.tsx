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
  GlobeAltIcon,
  StarIcon,
  ShareIcon,
  BellIcon,
  ArrowDownTrayIcon
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
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Dashboard
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
                {/* Nutrition Course */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-700 flex items-end p-4">
                    <div className="text-white">
                      <div className="text-xs font-medium bg-blue-800 inline-block px-2 py-1 rounded mb-2">PHYSICAL</div>
                      <h3 className="text-lg font-bold">Nutrition Fundamentals</h3>
                      <p className="text-sm opacity-90">Master the basics of healthy eating</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">4 modules • Beginner</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Popular</span>
                    </div>
                    <button className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Start Learning</button>
                  </div>
                </div>
                
                {/* Mindfulness Course */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-40 bg-gradient-to-r from-purple-500 to-purple-700 flex items-end p-4">
                    <div className="text-white">
                      <div className="text-xs font-medium bg-purple-800 inline-block px-2 py-1 rounded mb-2">MENTAL</div>
                      <h3 className="text-lg font-bold">Mindfulness Meditation</h3>
                      <p className="text-sm opacity-90">Reduce stress through mindfulness</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">6 modules • All levels</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">New</span>
                    </div>
                    <button className="mt-2 w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Start Learning</button>
                  </div>
                </div>
                
                {/* Financial Course */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-40 bg-gradient-to-r from-green-500 to-green-700 flex items-end p-4">
                    <div className="text-white">
                      <div className="text-xs font-medium bg-green-800 inline-block px-2 py-1 rounded mb-2">FINANCIAL</div>
                      <h3 className="text-lg font-bold">Personal Finance 101</h3>
                      <p className="text-sm opacity-90">Build wealth with smart money habits</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">5 modules • Beginner</span>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Featured</span>
                    </div>
                    <button className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Start Learning</button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expert Insights */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Expert Insights</h3>
                <button className="text-sm text-blue-600 hover:underline">View All</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Video Interview */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-video bg-gray-800 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium">The Science of Happiness</h4>
                    <p className="text-sm text-gray-500 mt-1">Dr. Emily Chen shares research-backed happiness strategies</p>
                  </div>
                </div>
                
                {/* Podcast */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium">Mindful Career Choices</h4>
                        <p className="text-xs text-gray-500">Career & Mental • 43 min</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600">Listen to career expert Mark Johnson discuss aligning your career with your values and mental wellbeing.</p>
                    <button className="mt-3 text-blue-600 text-sm hover:underline">Listen Now</button>
                  </div>
                </div>
                
                {/* Expert Article */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                      <div className="ml-3">
                        <h4 className="font-medium">Sarah Williams</h4>
                        <p className="text-xs text-gray-500">Financial Advisor • May 4, 2023</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-2">5 Investment Strategies for Beginners</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">Learn the fundamental approaches to investing that can set you up for long-term financial success, even with minimal starting capital.</p>
                    <button className="mt-3 text-blue-600 text-sm hover:underline">Read Article</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'explore' ? (
          <div>
            {/* Three-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Spokes Column */}
              <div className="bg-white rounded-lg shadow p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Life Spokes</h3>
                
                <div className="space-y-3">
                  {spokes.map((spoke) => {
                    const Icon = spoke.icon
                    return (
                      <button
                        key={spoke.id}
                        onClick={() => setSelectedSpoke(spoke)}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                          selectedSpoke?.id === spoke.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mr-3 ${selectedSpoke?.id === spoke.id ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className="font-medium">{spoke.name}</span>
                        <span className="ml-auto text-xs font-semibold">
                          {spoke.progress}%
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Subcategories Column */}
              <div className="bg-white rounded-lg shadow p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedSpoke ? `${selectedSpoke.name} Categories` : 'Select a Spoke'}
                </h3>
                
                {selectedSpoke ? (
                  <div className="space-y-3">
                    {selectedSpoke.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => setSelectedSubcategory(subcategory)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedSubcategory?.id === subcategory.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{subcategory.name}</span>
                        <span className="text-xs text-gray-500 block mt-1">
                          {subcategory.activities.length} activities
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                    <UserGroupIcon className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">Select a spoke to view its categories</p>
                  </div>
                )}
              </div>
              
              {/* Activities Column */}
              <div className="bg-white rounded-lg shadow p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedSubcategory
                    ? `${selectedSubcategory.name} Activities`
                    : 'Select a Category'}
                </h3>
                
                {selectedSubcategory ? (
                  <div className="space-y-3">
                    {selectedSubcategory.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 rounded-lg border border-gray-100 hover:border-gray-200"
                      >
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium">{activity.name}</span>
                          <span
                            className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                              activity.level === 'Beginner'
                                ? 'bg-green-100 text-green-700'
                                : activity.level === 'Intermediate'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {activity.level}
                          </span>
                        </div>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {activity.completed ? 'Completed' : 'Not started'}
                          </span>
                          <button className="ml-auto text-xs text-blue-600 hover:underline">
                            {activity.completed ? 'View' : 'Start'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                    <ClipboardDocumentListIcon className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-gray-500">Select a category to view its activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'tools' ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Comprehensive Tools</h2>
            
            {/* Category selector */}
            <div className="mb-8">
              <div className="flex space-x-3 overflow-x-auto pb-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg whitespace-nowrap">
                  All Categories
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg whitespace-nowrap">
                  Physical Health
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg whitespace-nowrap">
                  Mental Well-being
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg whitespace-nowrap">
                  Relationships
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg whitespace-nowrap">
                  Career
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg whitespace-nowrap">
                  Finances
                </button>
              </div>
            </div>
            
            {/* Physical Health Tools */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4">Physical Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Fitness Planner */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600 p-4 flex items-center">
                    <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center">
                      <CalendarIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4 text-white">
                      <h4 className="font-semibold text-lg">Fitness Planner</h4>
                      <p className="text-sm opacity-90">Schedule your workouts</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">Create and manage personalized workout routines with progress tracking and reminders.</p>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      Use Tool
                    </button>
                  </div>
                </div>
                
                {/* Nutrition Tracker */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-green-400 to-green-600 p-4 flex items-center">
                    <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center">
                      <ChartBarIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4 text-white">
                      <h4 className="font-semibold text-lg">Nutrition Tracker</h4>
                      <p className="text-sm opacity-90">Monitor your diet</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">Log meals, track nutrients, and get personalized recommendations for a balanced diet.</p>
                    <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                      Use Tool
                    </button>
                  </div>
                </div>
                
                {/* Health Reminders */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-purple-400 to-purple-600 p-4 flex items-center">
                    <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center">
                      <BellIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4 text-white">
                      <h4 className="font-semibold text-lg">Health Reminders</h4>
                      <p className="text-sm opacity-90">Never miss appointments</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">Set up custom reminders for medications, doctor visits, and health-related habits.</p>
                    <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
                      Use Tool
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mental Well-being Tools */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4">Mental Well-being</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Meditation App */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-indigo-400 to-indigo-600 p-4 flex items-center">
                    <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center">
                      <SparklesIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="ml-4 text-white">
                      <h4 className="font-semibold text-lg">Meditation App</h4>
                      <p className="text-sm opacity-90">Find your inner peace</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">Access guided meditations, breathing exercises, and mindfulness practices for daily mental wellness.</p>
                    <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                      Use Tool
                    </button>
                  </div>
                </div>
                
                {/* More mental tools would be here */}
              </div>
            </div>
          </div>
        ) : activeTab === 'games' ? (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Fun Mini Games</h2>
            
            {/* Category selector */}
            <div className="mb-8">
              <div className="flex space-x-3 overflow-x-auto pb-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg whitespace-nowrap">
                  All Categories
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg whitespace-nowrap">
                  Physical Health
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg whitespace-nowrap">
                  Mental Well-being
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg whitespace-nowrap">
                  Relationships
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg whitespace-nowrap">
                  Career
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-lg whitespace-nowrap">
                  Finances
                </button>
              </div>
            </div>
            
            {/* Physical Health Games */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4">Physical Health Games</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Fitness Quest */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-video bg-blue-600 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-800/80 flex items-end p-4">
                      <div>
                        <h4 className="text-white text-lg font-bold">Fitness Quest</h4>
                        <div className="flex items-center mt-1">
                          <TrophyIcon className="h-4 w-4 text-yellow-300 mr-1" />
                          <span className="text-xs text-white">1,245 Players</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">Complete daily fitness challenges in an adventure storyline to unlock rewards and level up your character.</p>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      Play Now
                    </button>
                  </div>
                </div>
                
                {/* Nutrition Match */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-video bg-green-600 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-800/80 flex items-end p-4">
                      <div>
                        <h4 className="text-white text-lg font-bold">Nutrition Match</h4>
                        <div className="flex items-center mt-1">
                          <TrophyIcon className="h-4 w-4 text-yellow-300 mr-1" />
                          <span className="text-xs text-white">980 Players</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">Match foods to their nutritional benefits in this fun, fast-paced game that helps you learn about healthy eating.</p>
                    <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                      Play Now
                    </button>
                  </div>
                </div>
                
                {/* Sleep Challenge */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-video bg-indigo-600 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-800/80 flex items-end p-4">
                      <div>
                        <h4 className="text-white text-lg font-bold">Sleep Challenge</h4>
                        <div className="flex items-center mt-1">
                          <TrophyIcon className="h-4 w-4 text-yellow-300 mr-1" />
                          <span className="text-xs text-white">756 Players</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">Track your sleep patterns and compete with friends to build better sleep habits through gamified challenges.</p>
                    <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                      Play Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard tab content */
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Growth Dashboard</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Life Wheel Visualization */}
              <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Life Balance Wheel</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Updated Today</span>
                </div>
                <div className="aspect-square relative flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-4 border-blue-100 flex items-center justify-center">
                    {/* Life wheel chart would go here - simplified with colored sections */}
                    <div className="w-[90%] h-[90%] rounded-full bg-gray-100 flex items-center justify-center relative overflow-hidden">
                      {/* Physical Segment */}
                      <div className="absolute top-0 left-[50%] w-[50%] h-[50%] origin-bottom-left rotate-0 bg-blue-500 opacity-70"></div>
                      {/* Mental Segment */}
                      <div className="absolute top-0 left-[50%] w-[50%] h-[50%] origin-bottom-left rotate-45 bg-purple-500 opacity-70"></div>
                      {/* Emotional Segment */}
                      <div className="absolute top-0 left-[50%] w-[50%] h-[50%] origin-bottom-left rotate-90 bg-pink-500 opacity-70"></div>
                      {/* Spiritual Segment */}
                      <div className="absolute top-0 left-[50%] w-[50%] h-[50%] origin-bottom-left rotate-[135deg] bg-amber-500 opacity-70"></div>
                      {/* Financial Segment */}
                      <div className="absolute top-0 left-[50%] w-[50%] h-[50%] origin-bottom-left rotate-180 bg-green-500 opacity-70"></div>
                      {/* Social Segment */}
                      <div className="absolute top-0 left-[50%] w-[50%] h-[50%] origin-bottom-left rotate-[225deg] bg-red-500 opacity-70"></div>
                      {/* Career Segment */}
                      <div className="absolute top-0 left-[50%] w-[50%] h-[50%] origin-bottom-left rotate-[270deg] bg-teal-500 opacity-70"></div>
                      {/* Intellectual Segment */}
                      <div className="absolute top-0 left-[50%] w-[50%] h-[50%] origin-bottom-left rotate-[315deg] bg-indigo-500 opacity-70"></div>
                      {/* Center overlay */}
                      <div className="w-[50%] h-[50%] rounded-full bg-white shadow-sm flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">73%</div>
                          <div className="text-xs text-gray-500">Life Balance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">Your wheel shows strong <span className="font-medium text-blue-600">Physical</span> and <span className="font-medium text-purple-600">Mental</span> growth</p>
                  <button className="mt-2 text-xs text-blue-600 font-medium hover:underline">View Detailed Analysis</button>
                </div>
              </div>
              
              {/* Rewards & Progress */}
              <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Rewards & Progress</h3>
                  <div className="flex items-center">
                    <span className="flex items-center text-xs text-gray-600"><StarIcon className="h-4 w-4 text-yellow-500 mr-1" /> 450 Points</span>
                  </div>
                </div>
                
                {/* Recent badges */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recently Earned Badges</h4>
                  <div className="flex space-x-3">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <BanknotesIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-xs mt-1">Budget Pro</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <HeartIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-xs mt-1">Fitness Starter</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <span className="text-xs mt-1">Mind Master</span>
                    </div>
                  </div>
                </div>
                
                {/* Current challenges */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Challenges</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>30-Day Meditation</span>
                        <span className="font-medium">24/30</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-purple-500 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Investment Simulator</span>
                        <span className="font-medium">2/5</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <button className="text-blue-600 text-xs font-medium hover:underline">Visit Rewards Shop</button>
                </div>
              </div>
              
              {/* AI Coach & Spoke Synergy */}
              <div className="grid grid-rows-2 gap-4">
                {/* AI Coach */}
                <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                      <SparklesIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold mb-1">AI Growth Coach</h3>
                      <p className="text-sm text-gray-600">Based on your activity, I recommend focusing on your <span className="font-medium text-amber-600">Financial</span> spoke next - you&apos;re making great progress!</p>
                      <div className="mt-2 flex">
                        <button className="text-xs text-blue-600 font-medium mr-3 hover:underline">Get Advice</button>
                        <button className="text-xs text-gray-500 hover:underline">Dismiss</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Spoke Synergy */}
                <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-2">Spoke Synergy</h3>
                  <div className="mb-2 bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                        <HeartIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center -ml-2">
                        <AcademicCapIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="ml-2">
                        <span className="text-xs font-medium text-gray-700">Exercise ➔ Mental Clarity</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Your morning fitness routine enhances focus and productivity throughout the day.</p>
                  </div>
                  <button className="text-xs text-blue-600 font-medium hover:underline">Discover More Synergies</button>
                </div>
              </div>
            </div>
            
            {/* Additional Dashboard Sections */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Progress Summary */}
              <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-4">Monthly Progress Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Activities Completed</span>
                      <span className="font-medium text-blue-600">28</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full">
                      <div className="h-1.5 bg-blue-600 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Points Earned</span>
                      <span className="font-medium text-green-600">450/600</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full">
                      <div className="h-1.5 bg-green-600 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Challenges Joined</span>
                      <span className="font-medium text-purple-600">3/5</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full">
                      <div className="h-1.5 bg-purple-600 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Suggested Activities */}
              <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Recommended for You</h3>
                  <button className="text-xs text-blue-600 hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mr-3">
                      <HeartIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Morning Stretching Routine</h4>
                      <p className="text-xs text-gray-600">A quick 10-minute session to boost energy and flexibility</p>
                      <button className="mt-1 text-xs text-blue-600 hover:underline">Try Now</button>
                    </div>
                  </div>
                  <div className="flex items-start p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center mr-3">
                      <BanknotesIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Savings Goal Planner</h4>
                      <p className="text-xs text-gray-600">Create a personalized plan to reach your financial targets</p>
                      <button className="mt-1 text-xs text-blue-600 hover:underline">Start Planning</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="mt-6 flex flex-wrap justify-between items-center border-t pt-4">
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Download Report
                </button>
                <button className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                  <ShareIcon className="h-4 w-4 mr-1" />
                  Share Progress
                </button>
              </div>
              <div className="flex items-center mt-4 sm:mt-0">
                <div className="flex items-center mr-4">
                  <BellIcon className="h-5 w-5 text-gray-400 mr-1" />
                  <select className="text-xs text-gray-600 bg-transparent border-none focus:ring-0">
                    <option>Daily Notifications</option>
                    <option>Weekly Notifications</option>
                    <option>Disable Notifications</option>
                  </select>
                </div>
                <button className="text-xs text-gray-600 hover:underline">Settings</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 