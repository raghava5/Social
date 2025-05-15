'use client'

import {
  TrophyIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt?: string
}

interface Milestone {
  id: string
  name: string
  description: string
  progress: number
  target: number
}

interface ProgressDashboardProps {
  spokeProgress: number
  totalLessonsCompleted: number
  streakDays: number
  timeSpent: string
  badges: Badge[]
  milestones: Milestone[]
}

export default function ProgressDashboard({
  spokeProgress,
  totalLessonsCompleted,
  streakDays,
  timeSpent,
  badges,
  milestones,
}: ProgressDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Spoke Progress</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {spokeProgress}%
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Lessons Completed
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {totalLessonsCompleted}
              </p>
            </div>
            <TrophyIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {streakDays} days
              </p>
            </div>
            <FireIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Invested</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {timeSpent}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Earned Badges
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center p-4 rounded-lg ${
                badge.earned ? 'bg-primary-50' : 'bg-gray-50'
              }`}
            >
              <img
                src={badge.icon}
                alt={badge.name}
                className={`w-12 h-12 mb-2 ${
                  !badge.earned && 'opacity-50 grayscale'
                }`}
              />
              <p
                className={`text-sm font-medium text-center ${
                  badge.earned ? 'text-primary-600' : 'text-gray-500'
                }`}
              >
                {badge.name}
              </p>
              {badge.earned && (
                <p className="text-xs text-gray-500 mt-1">
                  Earned {badge.earnedAt}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {milestone.name}
                </span>
                <span className="text-sm text-gray-600">
                  {milestone.progress}/{milestone.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{
                    width: `${(milestone.progress / milestone.target) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {milestone.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 