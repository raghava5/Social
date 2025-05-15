import { Suspense } from 'react'
import { Metadata } from 'next'
import { 
  PlayIcon, 
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Fitness Planner | Practical Tools',
  description: 'Plan and track your workouts with video guidance and progress tracking.',
}

interface Workout {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  bodyFocus: string[]
  videoUrl: string
  thumbnailUrl: string
}

const SAMPLE_WORKOUTS: Workout[] = [
  {
    id: '1',
    title: '30-Min Full Body HIIT',
    description: 'High-intensity interval training targeting all major muscle groups',
    difficulty: 'Intermediate',
    duration: '30 min',
    bodyFocus: ['Full Body', 'Cardio'],
    videoUrl: '/videos/full-body-hiit.mp4',
    thumbnailUrl: '/images/workouts/full-body-hiit.jpg'
  },
  // Add more sample workouts...
]

function WorkoutFilters() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button className="text-sm text-primary-600 hover:text-primary-700">
          Reset
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Difficulty
          </label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Duration
          </label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
            <option value="">Any Duration</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Body Focus
          </label>
          <div className="mt-2 space-y-2">
            {['Full Body', 'Upper Body', 'Lower Body', 'Core', 'Cardio'].map(focus => (
              <label key={focus} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  value={focus}
                />
                <span className="ml-2 text-sm text-gray-600">{focus}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkoutCard({ workout }: { workout: Workout }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="relative aspect-video">
        <img
          src={workout.thumbnailUrl}
          alt={workout.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <PlayIcon className="h-12 w-12 text-white" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{workout.title}</h3>
        <p className="mt-1 text-sm text-gray-600">{workout.description}</p>
        
        <div className="mt-4 flex items-center space-x-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {workout.difficulty}
          </span>
          <span className="text-sm text-gray-500">{workout.duration}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {workout.bodyFocus.map(focus => (
            <span
              key={focus}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {focus}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function WorkoutGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SAMPLE_WORKOUTS.map(workout => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  )
}

function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary-50 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">This Week</h3>
            <p className="text-2xl font-semibold text-gray-900">3 Workouts</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary-50 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Total Time</h3>
            <p className="text-2xl font-semibold text-gray-900">90 mins</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary-50 rounded-lg">
            <AdjustmentsHorizontalIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Current Streak</h3>
            <p className="text-2xl font-semibold text-gray-900">5 Days</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FitnessPlanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fitness Planner</h1>
          <p className="mt-2 text-lg text-gray-600">
            Find and track workouts that match your goals and fitness level.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="btn-primary">
            Connect Fitness Device
          </button>
        </div>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <QuickStats />
      </Suspense>

      <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-1">
          <Suspense fallback={<div>Loading filters...</div>}>
            <WorkoutFilters />
          </Suspense>
        </div>

        <div className="mt-8 lg:mt-0 lg:col-span-3">
          <Suspense fallback={<div>Loading workouts...</div>}>
            <WorkoutGrid />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 