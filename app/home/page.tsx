'use client'

import { useState } from 'react'
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
} from '@heroicons/react/24/outline'
import TopNav from '../components/TopNav'

// Dummy data for demonstration
const spokes = [
  { id: 1, name: 'Spiritual', progress: 75, color: 'bg-purple-500' },
  { id: 2, name: 'Mental', progress: 60, color: 'bg-blue-500' },
  { id: 3, name: 'Physical', progress: 85, color: 'bg-green-500' },
  { id: 4, name: 'Personal', progress: 45, color: 'bg-pink-500' },
  { id: 5, name: 'Professional', progress: 70, color: 'bg-yellow-500' },
  { id: 6, name: 'Financial', progress: 55, color: 'bg-red-500' },
  { id: 7, name: 'Social', progress: 80, color: 'bg-indigo-500' },
]

const prompts = [
  { id: 1, text: 'What are you grateful for today?', spoke: 'Spiritual' },
  { id: 2, text: 'Take 5 minutes to practice mindfulness', spoke: 'Mental' },
  { id: 3, text: 'Go for a 15-minute walk', spoke: 'Physical' },
]

const liveEvents = [
  { id: 1, title: 'Morning Meditation', time: '8:00 AM', participants: 45 },
  { id: 2, title: 'Financial Planning Workshop', time: '2:00 PM', participants: 23 },
]

const trendingItems = [
  { id: 1, title: 'Mindful Living Challenge', type: 'challenge', participants: 120 },
  { id: 2, title: 'Financial Freedom Group', type: 'group', members: 89 },
  { id: 3, title: 'Daily Wisdom Quotes', type: 'content', likes: 256 },
]

const recommendations = [
  { id: 1, title: 'The Power of Now', type: 'book', author: 'Eckhart Tolle' },
  { id: 2, title: 'Meditation for Beginners', type: 'course', duration: '30 mins' },
]

export default function Home() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: 'John Doe',
        avatar: '/avatar1.jpg',
      },
      content: 'Just completed my morning meditation! Feeling refreshed and ready for the day. #Spiritual #Mindfulness',
      image: '/post1.jpg',
      likes: 24,
      comments: 5,
      shares: 2,
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      user: {
        name: 'Jane Smith',
        avatar: '/avatar2.jpg',
      },
      content: 'Started a new fitness routine today. Day 1 of 30! 💪 #Physical #Wellness',
      image: '/post2.jpg',
      likes: 45,
      comments: 12,
      shares: 3,
      timestamp: '4 hours ago',
    },
  ])

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="grid grid-cols-12 gap-4 p-4">
        {/* Left Panel */}
        <div className="col-span-3 space-y-4">
          {/* Seven Spokes Health Summary */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Seven Spokes Health</h2>
            <div className="space-y-3">
              {spokes.map((spoke) => (
                <div key={spoke.id} className="space-y-1">
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
                </div>
              ))}
            </div>
          </div>

          {/* Prompts of the Day */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Prompts of the Day</h2>
            <div className="space-y-3">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{prompt.text}</p>
                  <span className="text-xs text-gray-500">{prompt.spoke}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="col-span-6 space-y-4">
          {/* Create Post */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              <input
                type="text"
                placeholder="What's on your mind?"
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none"
              />
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t">
              <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-green-500" />
                <span>Photo/Video</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
                <VideoCameraIcon className="h-6 w-6 text-red-500" />
                <span>Live Video</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
                <FaceSmileIcon className="h-6 w-6 text-yellow-500" />
                <span>Feeling/Activity</span>
              </button>
            </div>
          </div>

          {/* Posts */}
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                  <div>
                    <p className="font-medium">{post.user.name}</p>
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-4">{post.content}</p>
              {post.image && (
                <div className="mt-4">
                  <div className="w-full h-64 bg-gray-300 rounded-lg"></div>
                </div>
              )}
              <div className="flex justify-between mt-4 pt-4 border-t">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                  <HeartIcon className="h-5 w-5" />
                  <span>{post.likes} Likes</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                  <ChatBubbleOvalLeftIcon className="h-5 w-5" />
                  <span>{post.comments} Comments</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
                  <ShareIcon className="h-5 w-5" />
                  <span>{post.shares} Shares</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel */}
        <div className="col-span-3 space-y-4">
          {/* Live Events */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Live Events</h2>
            <div className="space-y-3">
              {liveEvents.map((event) => (
                <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{event.title}</span>
                    <span className="text-sm text-gray-500">{event.time}</span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {event.participants} participants
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help Exchange */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Help Exchange</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Offer Help
              </button>
              <button className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200">
                Request Help
              </button>
            </div>
          </div>

          {/* Trending */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Trending</h2>
            <div className="space-y-3">
              {trendingItems.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FireIcon className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {item.type === 'challenge' && `${item.participants} participants`}
                    {item.type === 'group' && `${item.members} members`}
                    {item.type === 'content' && `${item.likes} likes`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* You May Also Like */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">You May Also Like</h2>
            <div className="space-y-3">
              {recommendations.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {item.type === 'book' && `by ${item.author}`}
                    {item.type === 'course' && `${item.duration} course`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 