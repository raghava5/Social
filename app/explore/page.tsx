'use client'

import { useState } from 'react'
import Layout from '../components/Layout'
import {
  BookOpenIcon,
  VideoCameraIcon,
  ChartBarIcon,
  AcademicCapIcon,
  SparklesIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

// Define types for our data
type TrendingItem = {
  id: number
  type: string
  title: string
  description: string
  participants: number
  icon: any
}

type ResourceItem = {
  id: number
  type: string
  title: string
  description: string
  duration: string
  level: string
  icon: any
}

type Spoke = {
  id: string
  name: string
}

// Dummy data for trending content and resources
const dummyData = {
  trending: [
    {
      id: 1,
      type: 'ritual',
      title: 'Morning Meditation Challenge',
      description: 'Join 1000+ people in a 30-day meditation challenge',
      participants: 1250,
      icon: SparklesIcon,
    },
    {
      id: 2,
      type: 'group',
      title: 'Mindful Living Community',
      description: 'A supportive community for mindfulness practices',
      participants: 856,
      icon: UserGroupIcon,
    },
    {
      id: 3,
      type: 'quote',
      title: 'Daily Wisdom',
      description: 'Start your day with inspiring quotes',
      participants: 2500,
      icon: BookOpenIcon,
    },
  ] as TrendingItem[],
  resources: [
    {
      id: 1,
      type: 'course',
      title: 'Introduction to Mindfulness',
      description: 'Learn the basics of mindfulness meditation',
      duration: '2 hours',
      level: 'Beginner',
      icon: AcademicCapIcon,
    },
    {
      id: 2,
      type: 'video',
      title: 'Guided Meditation Series',
      description: '10-minute guided meditation sessions',
      duration: '10 min each',
      level: 'All Levels',
      icon: VideoCameraIcon,
    },
    {
      id: 3,
      type: 'article',
      title: 'The Science of Meditation',
      description: 'Understanding the benefits of meditation',
      duration: '15 min read',
      level: 'Intermediate',
      icon: BookOpenIcon,
    },
  ] as ResourceItem[],
}

// Dummy data for spokes
const spokes: Spoke[] = [
  { id: 'spiritual', name: 'Spiritual' },
  { id: 'mental', name: 'Mental' },
  { id: 'physical', name: 'Physical' },
  { id: 'personal', name: 'Personal' },
  { id: 'professional', name: 'Professional' },
  { id: 'financial', name: 'Financial' },
  { id: 'social', name: 'Social' },
]

export default function Explore() {
  const [activeTab, setActiveTab] = useState<'trending' | 'resources'>('trending')

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">Explore</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('trending')}
              className={`${
                activeTab === 'trending'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`${
                activeTab === 'resources'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Learning Resources
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'trending' ? dummyData.trending : dummyData.resources).map(
            (item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className="card p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 rounded-full bg-primary-100">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-500">
                        {activeTab === 'trending'
                          ? `Participants: ${(item as TrendingItem).participants}`
                          : `Level: ${(item as ResourceItem).level}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        {activeTab === 'trending'
                          ? 'Ongoing'
                          : (item as ResourceItem).duration}
                      </span>
                    </div>
                    <button className="text-sm text-primary-600 hover:text-primary-700">
                      {activeTab === 'trending' ? 'Join Now' : 'Start Learning'}
                    </button>
                  </div>
                </div>
              )
            }
          )}
        </div>

        {/* Featured Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Featured Content</h2>
          <div className="card p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-full bg-primary-100">
                <ChartBarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Weekly Progress Report</h3>
                <p className="text-gray-600">
                  Track your progress across all seven spokes and get personalized
                  recommendations
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {spokes.map((spoke) => (
                <div
                  key={spoke.id}
                  className="p-4 rounded-lg border text-center"
                >
                  <h4 className="font-medium mb-2">{spoke.name}</h4>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 rounded-full bg-primary-600"
                      style={{ width: '75%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 