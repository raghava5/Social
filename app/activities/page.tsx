'use client'

import { useState } from 'react'
import TopNav from '../components/TopNav'
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  HeartIcon,
  ChartBarIcon,
  TrophyIcon,
  CalendarIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  BoltIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

// Dummy data for demonstration
const spokes = [
  {
    id: 'spiritual',
    name: 'Spiritual',
    icon: BookOpenIcon,
    progress: 75,
    activities: [
      { id: 1, name: 'Guided Meditation', completed: true },
      { id: 2, name: 'Gratitude Journal', completed: true },
      { id: 3, name: 'Nature Walk', completed: false },
    ],
  },
  {
    id: 'mental',
    name: 'Mental',
    icon: PuzzlePieceIcon,
    progress: 60,
    activities: [
      { id: 1, name: 'Daily Puzzle', completed: true },
      { id: 2, name: 'Reading Challenge', completed: false },
      { id: 3, name: 'Mindfulness Exercise', completed: true },
    ],
  },
  {
    id: 'physical',
    name: 'Physical',
    icon: BoltIcon,
    progress: 85,
    activities: [
      { id: 1, name: 'Morning Workout', completed: true },
      { id: 2, name: 'Water Intake', completed: true },
      { id: 3, name: 'Sleep Tracking', completed: false },
    ],
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: UserCircleIcon,
    progress: 45,
    activities: [
      { id: 1, name: 'Self-Reflection', completed: false },
      { id: 2, name: 'Boundary Setting', completed: true },
      { id: 3, name: 'Family Time', completed: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: BriefcaseIcon,
    progress: 70,
    activities: [
      { id: 1, name: 'Skill Development', completed: true },
      { id: 2, name: 'Networking', completed: false },
      { id: 3, name: 'Goal Setting', completed: true },
    ],
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: CurrencyDollarIcon,
    progress: 55,
    activities: [
      { id: 1, name: 'Budget Review', completed: true },
      { id: 2, name: 'Investment Research', completed: false },
      { id: 3, name: 'Savings Goal', completed: false },
    ],
  },
  {
    id: 'social',
    name: 'Social',
    icon: UserGroupIcon,
    progress: 65,
    activities: [
      { id: 1, name: 'Community Service', completed: true },
      { id: 2, name: 'Group Activity', completed: false },
      { id: 3, name: 'Kindness Challenge', completed: true },
    ],
  },
]

const helpRequests = [
  {
    id: 1,
    title: 'Need help with meditation practice',
    category: 'Spiritual',
    description: 'Looking for a meditation buddy to practice together',
    karmaPoints: 50,
    status: 'Open',
  },
  {
    id: 2,
    title: 'Seeking financial advice',
    category: 'Financial',
    description: 'Need guidance on investment strategies',
    karmaPoints: 100,
    status: 'Open',
  },
]

const helpOffers = [
  {
    id: 1,
    title: 'Offering fitness coaching',
    category: 'Physical',
    description: 'Free personal training sessions for beginners',
    karmaPoints: 75,
    status: 'Available',
  },
  {
    id: 2,
    title: 'Professional mentoring',
    category: 'Professional',
    description: 'Career guidance and resume review',
    karmaPoints: 150,
    status: 'Available',
  },
]

export default function Activities() {
  const [activeTab, setActiveTab] = useState('spokes')
  const [selectedSpoke, setSelectedSpoke] = useState(spokes[0])

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Activities</h1>
          <div className="flex space-x-4">
            <button
              className={`btn-secondary ${
                activeTab === 'spokes' ? 'bg-primary-500 text-white' : ''
              }`}
              onClick={() => setActiveTab('spokes')}
            >
              Seven Spokes
            </button>
            <button
              className={`btn-secondary ${
                activeTab === 'help' ? 'bg-primary-500 text-white' : ''
              }`}
              onClick={() => setActiveTab('help')}
            >
              Help & Support
            </button>
          </div>
        </div>

        {activeTab === 'spokes' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spokes.map((spoke) => (
              <div
                key={spoke.id}
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedSpoke(spoke)}
              >
                <div className="flex items-center mb-4">
                  <spoke.icon className="h-8 w-8 text-primary-500 mr-3" />
                  <h3 className="text-xl font-semibold">{spoke.name}</h3>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{spoke.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${spoke.progress}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {spoke.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">{activity.name}</span>
                      <input
                        type="checkbox"
                        checked={activity.completed}
                        className="h-4 w-4 text-primary-500"
                        readOnly
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Help Requests */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Help Requests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {helpRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{request.title}</h3>
                      <span className="text-sm text-gray-500">
                        {request.karmaPoints} KP
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {request.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {request.category}
                      </span>
                      <button className="btn-primary text-sm">
                        Offer Help
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Offers */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Help Offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {helpOffers.map((offer) => (
                  <div key={offer.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{offer.title}</h3>
                      <span className="text-sm text-gray-500">
                        {offer.karmaPoints} KP
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {offer.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {offer.category}
                      </span>
                      <button className="btn-primary text-sm">
                        Request Help
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 