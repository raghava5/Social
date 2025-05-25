'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  useEffect(() => {
    if (user?.id) {
      // Redirect to the user's specific profile page
      router.replace(`/profile/${user.id}`)
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to your profile...</p>
        </div>
      </div>
    </div>
  )
} 