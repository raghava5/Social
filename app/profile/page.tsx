'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import TopNav from '../components/TopNav'
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

const recentActivities = [
  { id: 1, type: 'meditation', spoke: 'Spiritual', duration: '15 mins', timestamp: '2 hours ago' },
  { id: 2, type: 'workout', spoke: 'Physical', duration: '30 mins', timestamp: '4 hours ago' },
  { id: 3, type: 'reading', spoke: 'Mental', duration: '45 mins', timestamp: '1 day ago' },
]

const goals = [
  { id: 1, title: 'Daily Meditation', spoke: 'Spiritual', progress: 80, target: 30 },
  { id: 2, title: 'Weekly Workouts', spoke: 'Physical', progress: 60, target: 4 },
  { id: 3, title: 'Monthly Reading', spoke: 'Mental', progress: 40, target: 4 },
]

const achievements = [
  { id: 1, title: 'Mindfulness Master', type: 'badge', icon: '🧘' },
  { id: 2, title: 'Fitness Enthusiast', type: 'badge', icon: '💪' },
  { id: 3, title: 'Knowledge Seeker', type: 'badge', icon: '📚' },
]

const moodHistory = [
  { id: 1, mood: 'happy', date: 'Today', note: 'Great meditation session' },
  { id: 2, mood: 'calm', date: 'Yesterday', note: 'Productive day at work' },
  { id: 3, mood: 'energetic', date: '2 days ago', note: 'Completed morning workout' },
]

export default function Profile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeSection, setActiveSection] = useState('overview')

  // Get user's name from metadata or email
  const firstName = user?.user_metadata?.firstName || user?.email?.split('@')[0] || 'John'
  const lastName = user?.user_metadata?.lastName || 'Doe'
  const email = user?.email || 'john.doe@example.com'

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'about', name: 'About', icon: UserIcon },
    { id: 'timeline', name: 'Timeline', icon: ClockIcon },
    { id: 'friends', name: 'Friends', icon: UserGroupIcon },
    { id: 'photos', name: 'Photos', icon: PhotoIcon },
    { id: 'videos', name: 'Videos', icon: VideoCameraIcon },
    { id: 'more', name: 'More', icon: ClipboardDocumentListIcon },
  ]

  const aboutSections = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'general', name: 'General', icon: UserIcon },
    { id: 'spiritual', name: 'Spiritual', icon: SparklesIcon },
    { id: 'mental', name: 'Mental', icon: LightBulbIcon },
    { id: 'physical', name: 'Physical', icon: UserIcon },
    { id: 'personal', name: 'Personal', icon: HeartIcon },
    { id: 'professional', name: 'Professional', icon: AcademicCapIcon },
    { id: 'financial', name: 'Financial', icon: CogIcon },
    { id: 'social', name: 'Social', icon: UserGroupIcon },
    { id: 'interests', name: 'Interests', icon: BookmarkIcon },
  ]

  const renderAboutContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Profile Overview</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Name</h4>
                  <p className="text-gray-600">{firstName} {lastName}</p>
                </div>
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-gray-600">{email}</p>
                </div>
                <div>
                  <h4 className="font-medium">Spiritual</h4>
                  <p className="text-gray-600">Daily meditation practitioner, Buddhist</p>
                </div>
                <div>
                  <h4 className="font-medium">Mental</h4>
                  <p className="text-gray-600">Excellent mental health, regular mindfulness practice</p>
                </div>
                <div>
                  <h4 className="font-medium">Physical</h4>
                  <p className="text-gray-600">Very active, regular exercise routine</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Personal</h4>
                  <p className="text-gray-600">Enjoys reading, traveling, and photography</p>
                </div>
                <div>
                  <h4 className="font-medium">Professional</h4>
                  <p className="text-gray-600">Software Engineer with 5+ years experience</p>
                </div>
                <div>
                  <h4 className="font-medium">Financial</h4>
                  <p className="text-gray-600">Regular saver, diverse investment portfolio</p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">General Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={`${firstName} ${lastName}`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input 
                    type="text" 
                    defaultValue={firstName.toLowerCase()}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={email}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="tel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input type="text" placeholder="City, State, Country" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )
      case 'spiritual':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">🧘 Spiritual Spoke</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Religious/Spiritual Affiliation</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Hinduism</option>
                  <option>Christianity</option>
                  <option>Islam</option>
                  <option>Buddhism</option>
                  <option>Sikhism</option>
                  <option>Jainism</option>
                  <option>Other</option>
                  <option>None</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency of Spiritual Practices</label>
                <div className="space-y-2">
                  {['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'].map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="spiritual-frequency"
                        value={option.toLowerCase()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label className="ml-3 text-sm text-gray-700">{option}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Spiritual Goals</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your spiritual goals..."
                />
              </div>
            </div>
          </div>
        )
      case 'mental':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">🧠 Mental Spoke</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mental Health Status</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Needs Attention</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stress Management Techniques</label>
                <div className="space-y-2">
                  {['Meditation', 'Exercise', 'Reading', 'Music', 'Therapy', 'Other'].map((technique) => (
                    <div key={technique} className="flex items-center">
                      <input
                        type="checkbox"
                        value={technique.toLowerCase()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">{technique}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 'physical':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">💪 Physical Spoke</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Exercise Frequency</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Daily</option>
                  <option>3-4 times a week</option>
                  <option>1-2 times a week</option>
                  <option>Rarely</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Exercise Types</label>
                <div className="space-y-2">
                  {['Running', 'Weightlifting', 'Yoga', 'Swimming', 'Cycling', 'Team Sports', 'Other'].map((exercise) => (
                    <div key={exercise} className="flex items-center">
                      <input
                        type="checkbox"
                        value={exercise.toLowerCase()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">{exercise}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 'personal':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">👤 Personal Spoke</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Personal Goals</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your personal goals..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Life Values</label>
                <div className="space-y-2">
                  {['Family', 'Health', 'Career', 'Education', 'Relationships', 'Other'].map((value) => (
                    <div key={value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={value.toLowerCase()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">{value}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 'professional':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">💼 Professional Spoke</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Profession</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                <div className="space-y-2">
                  {['Leadership', 'Communication', 'Technical', 'Creative', 'Analytical', 'Other'].map((skill) => (
                    <div key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        value={skill.toLowerCase()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">{skill}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 'financial':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">💰 Financial Spoke</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Financial Goals</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your financial goals..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Investment Preferences</label>
                <div className="space-y-2">
                  {['Stocks', 'Bonds', 'Real Estate', 'Cryptocurrency', 'Mutual Funds', 'Other'].map((investment) => (
                    <div key={investment} className="flex items-center">
                      <input
                        type="checkbox"
                        value={investment.toLowerCase()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">{investment}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 'social':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">👥 Social Spoke</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Social Activities</label>
                <div className="space-y-2">
                  {['Networking Events', 'Community Service', 'Social Clubs', 'Sports Teams', 'Other'].map((activity) => (
                    <div key={activity} className="flex items-center">
                      <input
                        type="checkbox"
                        value={activity.toLowerCase()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">{activity}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Communication Style</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Extroverted</option>
                  <option>Introverted</option>
                  <option>Balanced</option>
                </select>
              </div>
            </div>
          </div>
        )
      case 'interests':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">🎯 Interests</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Hobbies</label>
                <div className="space-y-2">
                  {['Reading', 'Traveling', 'Cooking', 'Gardening', 'Painting', 'Photography', 'Writing', 'DIY Crafts', 'Other'].map((hobby) => (
                    <div key={hobby} className="flex items-center">
                      <input
                        type="checkbox"
                        value={hobby.toLowerCase()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-3 text-sm text-gray-700">{hobby}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 rounded-full bg-gray-300">
                {user?.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={`${firstName} ${lastName}`}
                    className="w-32 h-32 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/128?text=U';
                    }}
                  />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{firstName} {lastName}</h1>
                <p className="text-gray-600">Member since January 2024</p>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <HeartIcon className="h-5 w-5 text-red-500" />
                    <span>1,234 Karma Points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    <span>12 Achievements</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex -mb-px">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                    activeTab === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-3 space-y-6">
              {/* Seven Spokes Health Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Seven Spokes Health</h2>
                <div className="space-y-4">
                  {spokes.map((spoke) => (
                    <div key={spoke.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{spoke.name}</span>
                        <span>{spoke.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${spoke.color}`}
                          style={{ width: `${spoke.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {spoke.activities} activities completed
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood Tracker */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Mood Tracker</h2>
                <div className="space-y-4">
                  {moodHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {entry.mood === 'happy' && '😊'}
                        {entry.mood === 'calm' && '😌'}
                        {entry.mood === 'energetic' && '💪'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{entry.date}</p>
                        <p className="text-xs text-gray-500">{entry.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-6 space-y-6">
              {/* Activity Feed */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <ClockIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-sm text-gray-500">
                          {activity.spoke} • {activity.duration} • {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Goals & Progress</h2>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{goal.title}</span>
                        <span>{goal.progress}/{goal.target}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-3 space-y-6">
              {/* Achievements */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Achievements</h2>
                <div className="grid grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <span className="text-2xl mb-2">{achievement.icon}</span>
                      <p className="text-sm text-center">{achievement.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help Exchange Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Help Exchange</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Helped Others</span>
                    <span className="font-medium">24 times</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Received Help</span>
                    <span className="font-medium">12 times</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Karma Points</span>
                    <span className="font-medium">1,234</span>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">AI Recommendations</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      "Based on your activity, we recommend focusing on your Personal spoke. Try journaling for 10 minutes daily."
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm">
                      "You're doing great with Physical activities! Consider joining a group workout session."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="flex gap-6">
            {/* Left Sidebar */}
            <div className="w-64 bg-white rounded-lg shadow p-4">
              <nav className="space-y-1">
                {aboutSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <section.icon className="h-5 w-5 mr-3" />
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right Content */}
            <div className="flex-1 bg-white rounded-lg shadow p-6">
              {renderAboutContent()}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-6">
              <p className="text-gray-600">Your activity timeline will appear here.</p>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Friends</h2>
            <div className="space-y-6">
              <p className="text-gray-600">Your friends list will appear here.</p>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            <div className="space-y-6">
              <p className="text-gray-600">Your photos will appear here.</p>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Videos</h2>
            <div className="space-y-6">
              <p className="text-gray-600">Your videos will appear here.</p>
            </div>
          </div>
        )}

        {activeTab === 'more' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">More</h2>
            <div className="space-y-6">
              <p className="text-gray-600">Additional options will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 