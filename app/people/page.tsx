'use client'

import { useState } from 'react'
import TopNav from '../components/TopNav'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  UsersIcon,
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

// Dummy data for people
const peopleData = [
  {
    id: 1,
    name: 'John Smith',
    avatar: '/avatars/john.jpg',
    bio: 'Software Engineer | Meditation Enthusiast',
    mutualConnections: 12,
    spokes: ['Spiritual', 'Professional'],
    isConnected: false,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    bio: 'Yoga Teacher | Mindfulness Coach',
    mutualConnections: 8,
    spokes: ['Physical', 'Spiritual'],
    isConnected: true,
  },
  // Add more people...
]

// Dummy data for groups
const channelsData = [
  {
    id: 1,
    name: 'Mindful Living',
    image: '/groups/mindful.jpg',
    members: 1234,
    description: 'A community focused on mindfulness and meditation practices',
    category: 'Spiritual',
    isJoined: true,
  },
  {
    id: 2,
    name: 'Tech Professionals',
    image: '/groups/tech.jpg',
    members: 5678,
    description: 'Network and share knowledge with fellow tech professionals',
    category: 'Professional',
    isJoined: false,
  },
  // Add more channels...
]

// Dummy data for events
const eventsData = [
  {
    id: 1,
    title: 'Mindfulness Meditation Workshop',
    date: '2024-03-15',
    time: '10:00 AM',
    location: 'Virtual',
    category: 'Spiritual',
    attendees: 45,
    maxAttendees: 100,
    description: 'Join us for a guided meditation session focused on mindfulness and inner peace.',
    isRegistered: false,
  },
  {
    id: 2,
    title: 'Tech Networking Mixer',
    date: '2024-03-20',
    time: '6:00 PM',
    location: 'Innovation Hub',
    category: 'Professional',
    attendees: 78,
    maxAttendees: 150,
    description: 'Connect with fellow tech professionals and expand your network.',
    isRegistered: true,
  },
  // Add more events...
]

export default function PeoplePage() {
  const [activeTab, setActiveTab] = useState('people')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpokes, setSelectedSpokes] = useState<string[]>([])

  const spokes = ['Spiritual', 'Mental', 'Physical', 'Personal', 'Professional', 'Financial', 'Social']

  const filteredPeople = peopleData.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.bio.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpokes = selectedSpokes.length === 0 || 
      person.spokes.some(spoke => selectedSpokes.includes(spoke))
    return matchesSearch && matchesSpokes
  })

  const filteredChannels = channelsData.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpokes = selectedSpokes.length === 0 || selectedSpokes.includes(channel.category)
    return matchesSearch && matchesSpokes
  })

  const filteredEvents = eventsData.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpokes = selectedSpokes.length === 0 || selectedSpokes.includes(event.category)
    return matchesSearch && matchesSpokes
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">People & Community</h1>
          {activeTab === 'channels' && (
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Channel
            </button>
          )}
          {activeTab === 'events' && (
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Event
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('people')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'people'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            People
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'channels'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Channels
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Events
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          </div>
          <div className="relative">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <FunnelIcon className="h-5 w-5 mr-2 text-gray-400" />
              Filter by Spoke
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              {spokes.map((spoke) => (
                <label key={spoke} className="flex items-center px-4 py-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedSpokes.includes(spoke)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSpokes([...selectedSpokes, spoke])
                      } else {
                        setSelectedSpokes(selectedSpokes.filter(s => s !== spoke))
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{spoke}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'people' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeople.map((person) => (
              <div key={person.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <h3 className="font-medium">{person.name}</h3>
                    <p className="text-sm text-gray-500">{person.bio}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      {person.mutualConnections} mutual connections
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {person.spokes.map((spoke) => (
                        <span
                          key={spoke}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {spoke}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  {person.isConnected ? (
                    <button className="flex-1 flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                      Message
                    </button>
                  ) : (
                    <button className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      <UserPlusIcon className="h-5 w-5 mr-2" />
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'channels' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChannels.map((channel) => (
              <div key={channel.id} className="bg-white rounded-lg shadow">
                <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                <div className="p-6">
                  <h3 className="font-medium">{channel.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{channel.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    {channel.members.toLocaleString()} members
                  </div>
                  <div className="mt-2">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {channel.category}
                    </span>
                  </div>
                  <button
                    className={`mt-4 w-full flex justify-center items-center px-4 py-2 border rounded-md text-sm font-medium ${
                      channel.isJoined
                        ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        : 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {channel.isJoined ? 'Joined' : 'Join Channel'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {event.category}
                    </span>
                    <div className="text-sm text-gray-500">
                      {event.attendees}/{event.maxAttendees} attendees
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{event.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      {event.location}
                    </div>
                  </div>
                  <button
                    className={`w-full flex justify-center items-center px-4 py-2 border rounded-md text-sm font-medium ${
                      event.isRegistered
                        ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        : 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {event.isRegistered ? 'Registered' : 'Register Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 