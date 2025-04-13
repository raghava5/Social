'use client'

import { useState } from 'react'
import TopNav from '../components/TopNav'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  StarIcon,
  LightBulbIcon,
  HeartIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

// Dummy data for demonstration
const people = [
  {
    id: 1,
    name: 'Sarah Wilson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Meditation enthusiast and yoga instructor',
    distance: '2.5 km away',
    spokeRanking: {
      spiritual: 95,
      physical: 90,
      mental: 85,
      personal: 80,
      professional: 75,
      financial: 70,
      social: 85,
    },
    expertise: ['Meditation', 'Yoga', 'Mindfulness'],
    interests: ['Wellness', 'Spirituality', 'Fitness'],
    mutualConnections: 12,
    spokeTags: ['Spiritual', 'Physical', 'Mental'],
    connectionStatus: 'not_connected',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    bio: 'Mental health expert and meditation guide',
    distance: '5 km away',
    spokeRanking: {
      spiritual: 90,
      physical: 80,
      mental: 95,
      personal: 85,
      professional: 90,
      financial: 75,
      social: 80,
    },
    expertise: ['Mental Health', 'Meditation', 'Psychology'],
    interests: ['Wellness', 'Research', 'Teaching'],
    mutualConnections: 8,
    spokeTags: ['Mental', 'Professional', 'Spiritual'],
    connectionStatus: 'expert',
  },
  {
    id: 3,
    name: 'Emma Thompson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    bio: 'Financial advisor and wellness coach',
    distance: '3 km away',
    spokeRanking: {
      spiritual: 80,
      physical: 85,
      mental: 80,
      personal: 90,
      professional: 95,
      financial: 95,
      social: 85,
    },
    expertise: ['Financial Planning', 'Wellness', 'Career Coaching'],
    interests: ['Finance', 'Personal Development', 'Fitness'],
    mutualConnections: 15,
    spokeTags: ['Financial', 'Professional', 'Physical'],
    connectionStatus: 'not_connected',
  },
]

const spokeFilters = [
  { id: 'spiritual', name: 'Spiritual', icon: HeartIcon },
  { id: 'mental', name: 'Mental', icon: LightBulbIcon },
  { id: 'physical', name: 'Physical', icon: BookOpenIcon },
  { id: 'personal', name: 'Personal', icon: UserCircleIcon },
  { id: 'professional', name: 'Professional', icon: BriefcaseIcon },
  { id: 'financial', name: 'Financial', icon: CurrencyDollarIcon },
  { id: 'social', name: 'Social', icon: UserGroupIcon },
]

export default function People() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpoke, setSelectedSpoke] = useState('all')
  const [sortBy, setSortBy] = useState('distance')

  const filteredPeople = people
    .filter((person) => {
      const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.bio.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSpoke = selectedSpoke === 'all' ||
        person.spokeTags.includes(selectedSpoke)
      return matchesSearch && matchesSpoke
    })
    .sort((a, b) => {
      if (sortBy === 'distance') {
        return parseFloat(a.distance) - parseFloat(b.distance)
      }
      if (sortBy === 'spokeRanking') {
        return b.spokeRanking[selectedSpoke] - a.spokeRanking[selectedSpoke]
      }
      return 0
    })

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="distance">Sort by Distance</option>
                <option value="spokeRanking">Sort by Spoke Ranking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Spoke Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedSpoke === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedSpoke('all')}
            >
              All
            </button>
            {spokeFilters.map((spoke) => (
              <button
                key={spoke.id}
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                  selectedSpoke === spoke.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedSpoke(spoke.id)}
              >
                <spoke.icon className="h-4 w-4" />
                {spoke.name}
              </button>
            ))}
          </div>
        </div>

        {/* People Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="h-16 w-16 rounded-full"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{person.name}</h3>
                      <span className="text-sm text-gray-500 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {person.distance}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{person.bio}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {person.spokeTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expertise and Interests */}
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <StarIcon className="h-4 w-4 mr-1" />
                    Expertise
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {person.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <LightBulbIcon className="h-4 w-4 mr-1" />
                    Interests
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {person.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connection Status and Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {person.mutualConnections} mutual connections
                  </span>
                  <div className="flex space-x-2">
                    {person.connectionStatus === 'not_connected' && (
                      <button className="btn-primary text-sm">
                        <UserPlusIcon className="h-4 w-4 mr-1" />
                        Connect
                      </button>
                    )}
                    <button className="btn-secondary text-sm">
                      <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                      Message
                    </button>
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