'use client'

import { useState } from 'react'
import Layout from '../components/Layout'
import {
  HeartIcon,
  AcademicCapIcon,
  BoltIcon,
  UserIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

// Dummy data for activities
const spokes = [
  {
    id: 'spiritual',
    name: 'Spiritual',
    icon: HeartIcon,
    color: 'purple',
    activities: [
      { id: 1, name: 'Morning Meditation', duration: '15 min', completed: true },
      { id: 2, name: 'Gratitude Journal', duration: '10 min', completed: false },
      { id: 3, name: 'Nature Walk', duration: '30 min', completed: false },
    ],
  },
  {
    id: 'mental',
    name: 'Mental',
    icon: AcademicCapIcon,
    color: 'blue',
    activities: [
      { id: 1, name: 'Reading', duration: '30 min', completed: true },
      { id: 2, name: 'Puzzle Solving', duration: '15 min', completed: false },
      { id: 3, name: 'Learning New Skill', duration: '1 hour', completed: false },
    ],
  },
  {
    id: 'physical',
    name: 'Physical',
    icon: BoltIcon,
    color: 'green',
    activities: [
      { id: 1, name: 'Morning Exercise', duration: '30 min', completed: true },
      { id: 2, name: 'Yoga', duration: '20 min', completed: false },
      { id: 3, name: 'Healthy Meal Prep', duration: '1 hour', completed: false },
    ],
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: UserIcon,
    color: 'pink',
    activities: [
      { id: 1, name: 'Self-Reflection', duration: '15 min', completed: true },
      { id: 2, name: 'Journaling', duration: '20 min', completed: false },
      { id: 3, name: 'Personal Goal Setting', duration: '30 min', completed: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: BriefcaseIcon,
    color: 'orange',
    activities: [
      { id: 1, name: 'Skill Development', duration: '1 hour', completed: true },
      { id: 2, name: 'Networking', duration: '30 min', completed: false },
      { id: 3, name: 'Career Planning', duration: '45 min', completed: false },
    ],
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: CurrencyDollarIcon,
    color: 'yellow',
    activities: [
      { id: 1, name: 'Budget Review', duration: '20 min', completed: true },
      { id: 2, name: 'Investment Research', duration: '30 min', completed: false },
      { id: 3, name: 'Financial Planning', duration: '1 hour', completed: false },
    ],
  },
  {
    id: 'social',
    name: 'Social',
    icon: UserGroupIcon,
    color: 'red',
    activities: [
      { id: 1, name: 'Community Service', duration: '2 hours', completed: true },
      { id: 2, name: 'Social Connection', duration: '1 hour', completed: false },
      { id: 3, name: 'Group Activity', duration: '1.5 hours', completed: false },
    ],
  },
]

export default function Activities() {
  const [selectedSpoke, setSelectedSpoke] = useState(spokes[0])

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">Seven Spokes of Life</h1>

        {/* Spokes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {spokes.map((spoke) => {
            const Icon = spoke.icon
            return (
              <div
                key={spoke.id}
                onClick={() => setSelectedSpoke(spoke)}
                className={`card p-6 cursor-pointer transition-all ${
                  selectedSpoke.id === spoke.id
                    ? 'ring-2 ring-primary-500'
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full bg-${spoke.color}-100`}>
                    <Icon className={`h-6 w-6 text-${spoke.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-medium">{spoke.name}</h3>
                    <p className="text-sm text-gray-500">
                      {spoke.activities.filter((a) => a.completed).length} /{' '}
                      {spoke.activities.length} completed
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Spoke Activities */}
        <div className="card p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div
              className={`p-3 rounded-full bg-${selectedSpoke.color}-100`}
            >
              <selectedSpoke.icon
                className={`h-6 w-6 text-${selectedSpoke.color}-600`}
              />
            </div>
            <h2 className="text-xl font-semibold">{selectedSpoke.name} Activities</h2>
          </div>

          <div className="space-y-4">
            {selectedSpoke.activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{activity.name}</h3>
                  <p className="text-sm text-gray-500">{activity.duration}</p>
                </div>
                <button
                  className={`px-3 py-1 rounded-full text-sm ${
                    activity.completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {activity.completed ? 'Completed' : 'Pending'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
} 