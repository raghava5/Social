'use client'

import { useState } from 'react'
import TopNav from '../components/TopNav'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'

// Dummy data for demonstration
const people = [
  {
    id: 1,
    name: 'Sarah Wilson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Meditation enthusiast | Spiritual growth',
    mutualConnections: 5,
    spokeTags: ['Spiritual', 'Mental', 'Physical'],
    isConnected: false,
  },
  {
    id: 2,
    name: 'Mike Johnson',
    avatar: 'https://i.pravatar.cc/150?img=2',
    bio: 'Fitness coach | Wellness advocate',
    mutualConnections: 3,
    spokeTags: ['Physical', 'Professional'],
    isConnected: true,
  },
  {
    id: 3,
    name: 'Emma Davis',
    avatar: 'https://i.pravatar.cc/150?img=3',
    bio: 'Financial advisor | Personal growth',
    mutualConnections: 8,
    spokeTags: ['Financial', 'Professional', 'Personal'],
    isConnected: false,
  },
]

const spokeFilters = [
  'All',
  'Spiritual',
  'Mental',
  'Physical',
  'Personal',
  'Professional',
  'Financial',
  'Social',
]

export default function People() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpoke, setSelectedSpoke] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const filteredPeople = people.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.bio.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpoke = selectedSpoke === 'All' || person.spokeTags.includes(selectedSpoke)
    return matchesSearch && matchesSpoke
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">People</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search people..."
                className="input-field pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Spoke Filters */}
        {showFilters && (
          <div className="mb-8 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Filter by Spoke</h3>
            <div className="flex flex-wrap gap-2">
              {spokeFilters.map((spoke) => (
                <button
                  key={spoke}
                  onClick={() => setSelectedSpoke(spoke)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedSpoke === spoke
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {spoke}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* People Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((person) => (
            <div key={person.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="h-16 w-16 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{person.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{person.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {person.spokeTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {person.mutualConnections} mutual connections
                  </p>
                  <div className="flex space-x-2">
                    {!person.isConnected ? (
                      <button className="btn-primary flex items-center">
                        <UserPlusIcon className="h-5 w-5 mr-2" />
                        Connect
                      </button>
                    ) : (
                      <button className="btn-secondary flex items-center">
                        <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 