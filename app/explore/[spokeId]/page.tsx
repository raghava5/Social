'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import TopNav from '../../components/TopNav'
import LearningModule from '../../components/knowledge-hub/LearningModule'
import ExpertInsights from '../../components/knowledge-hub/ExpertInsights'
import ProgressDashboard from '../../components/knowledge-hub/ProgressDashboard'
import CommunityWisdom from '../../components/knowledge-hub/CommunityWisdom'
import MicroTip from '../../components/knowledge-hub/MicroTip'
import {
  HeartIcon,
  AcademicCapIcon,
  SparklesIcon,
  BriefcaseIcon,
  BanknotesIcon,
  UsersIcon,
  UserIcon,
  HomeIcon,
  BookOpenIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

// Mock data - Replace with actual data from your backend
const mockLearningModules = [
  {
    id: '1',
    title: 'Introduction to Physical Well-being',
    description: 'Learn the fundamentals of maintaining good physical health',
    difficulty: 'Beginner' as const,
    estimatedTime: '2 hours',
    category: 'Physical',
    progress: 60,
    lessons: [
      {
        id: '1.1',
        title: 'Understanding Physical Health',
        type: 'video' as const,
        completed: true,
      },
      {
        id: '1.2',
        title: 'Basics of Nutrition',
        type: 'text' as const,
        completed: true,
      },
      {
        id: '1.3',
        title: 'Exercise Fundamentals',
        type: 'video' as const,
        completed: false,
      },
    ],
  },
  // Add more modules...
]

const mockExpertContent = [
  {
    id: '1',
    title: 'The Science of Physical Well-being',
    description: 'Dr. Smith explains the key components of physical health',
    type: 'video' as const,
    duration: '15 min',
    expert: {
      id: '1',
      name: 'Dr. Jane Smith',
      title: 'Physical Health Expert',
    },
    thumbnail: '/experts/video1.jpg',
  },
  // Add more content...
]

const mockProgressData = {
  spokeProgress: 45,
  totalLessonsCompleted: 8,
  streakDays: 5,
  timeSpent: '12h',
  badges: [
    {
      id: '1',
      name: 'Quick Start',
      description: 'Complete your first lesson',
      icon: '/badges/quick-start.png',
      earned: true,
      earnedAt: '2 days ago',
    },
    // Add more badges...
  ],
  milestones: [
    {
      id: '1',
      name: 'Foundation Builder',
      description: 'Complete all beginner modules',
      progress: 2,
      target: 5,
    },
    // Add more milestones...
  ],
}

const mockCommunityPosts = [
  {
    id: '1',
    title: 'My journey to better physical health',
    content:
      'I wanted to share my experience of improving my physical health over the last 6 months. Here are the key lessons I learned...',
    author: {
      id: '1',
      name: 'John Doe',
      avatar: '/avatars/john.jpg',
    },
    createdAt: '2 days ago',
    tags: ['Success Story', 'Physical Health', 'Fitness'],
    upvotes: 24,
    downvotes: 2,
    comments: [
      {
        id: '1',
        content: 'This is really inspiring! Thanks for sharing your journey.',
        author: {
          id: '2',
          name: 'Jane Smith',
        },
        createdAt: '1 day ago',
        upvotes: 5,
        downvotes: 0,
      },
    ],
  },
  // Add more posts...
]

const mockMicroTips = [
  {
    id: '1',
    title: 'Quick Exercise Tip',
    content:
      'Take a 5-minute break every hour to stretch and move around. This improves circulation and reduces muscle tension.',
    category: 'Physical Health',
    isBookmarked: false,
  },
  {
    id: '2',
    title: 'Mindful Moment',
    content:
      'Practice the 4-7-8 breathing technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.',
    category: 'Mental Health',
    isBookmarked: true,
  },
  // Add more tips...
]

const spokes = {
  physical: {
    id: 'physical',
    name: 'Physical',
    icon: HeartIcon,
    description: 'Health, fitness, nutrition, and overall physical well-being',
    categories: [
      {
        name: 'Exercise & Movement',
        description: 'Regular physical activity and structured exercise routines',
        activities: [
          { name: 'Daily Walking', level: 'Beginner' },
          { name: 'Basic Stretching', level: 'Beginner' },
          { name: 'Home Workouts', level: 'Intermediate' },
          { name: 'Strength Training', level: 'Advanced' },
        ],
      },
      {
        name: 'Nutrition',
        description: 'Healthy eating habits and balanced diet',
        activities: [
          { name: 'Meal Planning', level: 'Beginner' },
          { name: 'Portion Control', level: 'Beginner' },
          { name: 'Macro Tracking', level: 'Intermediate' },
          { name: 'Meal Prep', level: 'Advanced' },
        ],
      },
      {
        name: 'Sleep',
        description: 'Quality rest and sleep hygiene',
        activities: [
          { name: 'Sleep Schedule', level: 'Beginner' },
          { name: 'Bedtime Routine', level: 'Beginner' },
          { name: 'Sleep Tracking', level: 'Intermediate' },
          { name: 'Sleep Optimization', level: 'Advanced' },
        ],
      },
    ],
  },
  mental: {
    id: 'mental',
    name: 'Mental',
    icon: AcademicCapIcon,
    description: 'Cognitive development, learning, and mental clarity',
    categories: [
      {
        name: 'Focus & Concentration',
        description: 'Improving attention span and mental focus',
        activities: [
          { name: 'Mindful Breathing', level: 'Beginner' },
          { name: 'Pomodoro Technique', level: 'Beginner' },
          { name: 'Deep Work Sessions', level: 'Intermediate' },
          { name: 'Flow State Training', level: 'Advanced' },
        ],
      },
      {
        name: 'Memory',
        description: 'Enhancing memory and recall abilities',
        activities: [
          { name: 'Memory Games', level: 'Beginner' },
          { name: 'Mnemonics Practice', level: 'Beginner' },
          { name: 'Memory Palace', level: 'Intermediate' },
          { name: 'Speed Memory', level: 'Advanced' },
        ],
      },
      {
        name: 'Problem Solving',
        description: 'Developing critical thinking and problem-solving skills',
        activities: [
          { name: 'Logic Puzzles', level: 'Beginner' },
          { name: 'Brain Teasers', level: 'Beginner' },
          { name: 'Strategic Games', level: 'Intermediate' },
          { name: 'Complex Problem Sets', level: 'Advanced' },
        ],
      },
    ],
  },
  // Add other spokes with their categories and activities...
}

export default function SpokePage() {
  const params = useParams()
  const spokeId = params.spokeId as string
  const spoke = spokes[spokeId as keyof typeof spokes]
  const [activeTab, setActiveTab] = useState('learning')

  if (!spoke) {
    return <div>Spoke not found</div>
  }

  const Icon = spoke.icon

  const handleUpvote = (postId: string) => {
    // Implement upvote logic
    console.log('Upvoted post:', postId)
  }

  const handleDownvote = (postId: string) => {
    // Implement downvote logic
    console.log('Downvoted post:', postId)
  }

  const handleReport = (postId: string) => {
    // Implement report logic
    console.log('Reported post:', postId)
  }

  const handleAddComment = (postId: string, comment: string) => {
    // Implement add comment logic
    console.log('Added comment to post:', postId, comment)
  }

  const handleBookmarkTip = (tipId: string) => {
    // Implement bookmark logic
    console.log('Bookmarked tip:', tipId)
  }

  const handleShareTip = (tipId: string) => {
    // Implement share logic
    console.log('Shared tip:', tipId)
  }

  const handleDismissTip = (tipId: string) => {
    // Implement dismiss logic
    console.log('Dismissed tip:', tipId)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-primary-100">
              <Icon className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{spoke.name}</h1>
              <p className="mt-1 text-gray-600">{spoke.description}</p>
            </div>
          </div>
        </div>

        {/* Daily Tips */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockMicroTips.map((tip) => (
              <MicroTip
                key={tip.id}
                {...tip}
                onBookmark={handleBookmarkTip}
                onShare={handleShareTip}
                onDismiss={handleDismissTip}
              />
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('learning')}
              className={`px-3 py-2 rounded-md ${
                activeTab === 'learning'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Learning Modules
            </button>
            <button
              onClick={() => setActiveTab('experts')}
              className={`px-3 py-2 rounded-md ${
                activeTab === 'experts'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Expert Insights
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-3 py-2 rounded-md ${
                activeTab === 'progress'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-2 rounded-md ${
                activeTab === 'community'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Community
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {activeTab === 'learning' && (
            <div className="space-y-6">
              {mockLearningModules.map((module) => (
                <LearningModule key={module.id} module={module} />
              ))}
            </div>
          )}

          {activeTab === 'experts' && (
            <ExpertInsights content={mockExpertContent} />
          )}

          {activeTab === 'progress' && (
            <ProgressDashboard {...mockProgressData} />
          )}

          {activeTab === 'community' && (
            <CommunityWisdom
              posts={mockCommunityPosts}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onReport={handleReport}
              onAddComment={handleAddComment}
            />
          )}
        </div>
      </div>
    </div>
  )
} 