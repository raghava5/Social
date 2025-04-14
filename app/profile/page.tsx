'use client'

import { useState } from 'react'
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
  const [activeTab, setActiveTab] = useState('about')

  const navigationItems = [
    { id: 'about', name: 'About', icon: UserIcon },
    { id: 'timeline', name: 'Timeline', icon: ClockIcon },
    { id: 'friends', name: 'Friends', icon: UserGroupIcon },
    { id: 'photos', name: 'Photos', icon: PhotoIcon },
    { id: 'videos', name: 'Videos', icon: VideoCameraIcon },
    { id: 'more', name: 'More', icon: ChartBarIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      {/* Profile Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32 rounded-full bg-gray-300"></div>
            <div>
              <h1 className="text-3xl font-bold">John Doe</h1>
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
        {activeTab === 'about' && (
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

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            {/* Timeline content */}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Friends</h2>
            {/* Friends content */}
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            {/* Photos content */}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Videos</h2>
            {/* Videos content */}
          </div>
        )}

        {activeTab === 'more' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">More</h2>
            {/* More content */}
          </div>
        )}
      </div>
    </div>
  )
} 