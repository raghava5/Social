'use client'

import { useState, useEffect } from 'react'
import TopNav from '../components/TopNav'
import NewUserPrompt from '../components/NewUserPrompt'
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
  MegaphoneIcon,
  GlobeAltIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  HeartIcon,
  HandRaisedIcon,
  AcademicCapIcon,
  ShareIcon,
  UserGroupIcon as UserGroupIconSolid,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import {
  shouldHideDummyContent,
  toggleDummyContent,
  hasCompletedOnboarding
} from '@/lib/userPreferences'

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

// Dummy data for campaigns
const campaignsData = [
  {
    id: 1,
    title: 'Mental Health Awareness Month',
    summary: 'Join our campaign to raise awareness about mental health issues.',
    coverImage: '/campaigns/mental-health.jpg',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    tags: ['MentalHealthAwareness', 'SelfCare', 'Wellness'],
    category: 'Mental',
    creator: 'Mental Health Foundation',
    attendees: 1245,
    peopleReached: 15000,
    actionsCount: 4567,
    isJoined: false,
    callToAction: 'Join',
    activeDiscussions: 23,
    upcomingEvents: 5,
    impact: {
      spread: 'Global',
      regions: ['North America', 'Europe', 'Asia', 'Australia'],
      donations: 7890,
      sharesCount: 4500,
      storiesCount: 350
    },
  },
  {
    id: 2,
    title: 'Financial Literacy Workshop Series',
    summary: 'Empower yourself with knowledge about personal finance and investments.',
    coverImage: '/campaigns/financial-literacy.jpg',
    startDate: '2024-04-15',
    endDate: '2024-06-15',
    tags: ['FinancialLiteracy', 'Investing', 'PersonalFinance'],
    category: 'Financial',
    creator: 'Global Finance Academy',
    attendees: 780,
    peopleReached: 9500,
    actionsCount: 2310,
    isJoined: true,
    callToAction: 'Attend',
    activeDiscussions: 15,
    upcomingEvents: 3,
    impact: {
      spread: 'Regional',
      regions: ['North America', 'Europe'],
      donations: 3400,
      sharesCount: 2200,
      storiesCount: 175
    },
  },
  {
    id: 3,
    title: 'Clean Ocean Initiative',
    summary: 'Help protect our oceans and marine life from pollution.',
    coverImage: '/campaigns/clean-ocean.jpg',
    startDate: '2024-04-01',
    endDate: '2024-08-31',
    tags: ['OceanConservation', 'Sustainability', 'ClimateAction'],
    category: 'Social',
    creator: 'Ocean Conservation Alliance',
    attendees: 3500,
    peopleReached: 45000,
    actionsCount: 12450,
    isJoined: false,
    callToAction: 'Volunteer',
    activeDiscussions: 42,
    upcomingEvents: 8,
    impact: {
      spread: 'Global',
      regions: ['North America', 'Europe', 'Asia', 'Africa', 'Australia'],
      donations: 25600,
      sharesCount: 18700,
      storiesCount: 890
    },
  },
]

export default function PeoplePage() {
  const [activeTab, setActiveTab] = useState('people')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpokes, setSelectedSpokes] = useState<string[]>([])
  const [hideDummyContent, setHideDummyContent] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  const spokes = ['Spiritual', 'Mental', 'Physical', 'Personal', 'Professional', 'Financial', 'Social']

  useEffect(() => {
    // Check if user is new based on onboarding status
    const completedOnboarding = hasCompletedOnboarding()
    setIsNewUser(!completedOnboarding)
    
    // Check preference for hiding dummy content
    setHideDummyContent(shouldHideDummyContent())
  }, [])

  const handleShowExampleContent = () => {
    toggleDummyContent(false)
    setHideDummyContent(false)
  }

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
  
  const filteredCampaigns = campaignsData.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSpokes = selectedSpokes.length === 0 || selectedSpokes.includes(campaign.category)
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
          {activeTab === 'campaigns' && (
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Campaign
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('people')}
            className={`px-4 py-2 rounded-md flex items-center ${
              activeTab === 'people' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserGroupIcon className="h-5 w-5 mr-1.5" />
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
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'campaigns'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MegaphoneIcon className="h-5 w-5 mr-2" />
            Campaigns
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

        {/* New user prompt or regular content */}
        {isNewUser && hideDummyContent ? (
          <NewUserPrompt type="people" onHide={handleShowExampleContent} />
        ) : (
          <>
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
            ) : activeTab === 'events' ? (
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
            ) : (
              <div>
                {/* Campaign Header - Create/Join Section */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Create or Join a Campaign</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Start New Campaign
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <div className="border border-gray-200 rounded-md p-4">
                        <div className="mb-4">
                          <label htmlFor="campaign-topic" className="block text-sm font-medium text-gray-700 mb-1">Campaign Topic or Tag</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              #
                            </span>
                            <input
                              type="text"
                              id="campaign-topic"
                              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                              placeholder="MentalHealthAwareness"
                            />
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="campaign-title" className="block text-sm font-medium text-gray-700 mb-1">Title & Summary</label>
                          <input
                            type="text"
                            id="campaign-title"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-2"
                            placeholder="Title"
                          />
                          <textarea
                            id="campaign-summary"
                            rows={3}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="A brief summary of your campaign..."
                          ></textarea>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Call to Action</label>
                          <div className="flex flex-wrap gap-2">
                            {['Join', 'Donate', 'Share', 'Attend', 'Sign Petition', 'Volunteer'].map((action) => (
                              <button
                                key={action}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="border border-gray-200 border-dashed rounded-md p-4 flex flex-col items-center justify-center h-full">
                        <div className="mb-3 text-gray-400">
                          <PhotoIcon className="h-10 w-10 mx-auto" />
                        </div>
                        <p className="text-sm text-gray-500 text-center mb-3">Drop your cover image or video here</p>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                          Upload File
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Awareness Timeline */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-6">Awareness Timeline</h2>
                  
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-1 bg-gray-200"></div>
                    
                    <div className="mb-8 relative">
                      <div className="flex items-start">
                        <div className="bg-blue-600 rounded-full h-10 w-10 flex items-center justify-center text-white z-10">
                          <CalendarIcon className="h-5 w-5" />
                        </div>
                        <div className="ml-6">
                          <span className="block text-sm text-gray-500">May 01, 2024</span>
                          <h3 className="text-lg font-medium">Mental Health Awareness Month</h3>
                          <p className="text-sm text-gray-600 mt-1">Global campaign to raise awareness about mental health issues and reducing stigma</p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Ongoing</span>
                            <span className="mx-2 text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">5.2K people participating</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-8 relative">
                      <div className="flex items-start">
                        <div className="bg-amber-500 rounded-full h-10 w-10 flex items-center justify-center text-white z-10">
                          <CalendarIcon className="h-5 w-5" />
                        </div>
                        <div className="ml-6">
                          <span className="block text-sm text-gray-500">June 14, 2024</span>
                          <h3 className="text-lg font-medium">World Blood Donor Day</h3>
                          <p className="text-sm text-gray-600 mt-1">Annual event to raise awareness about the need for blood donations</p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Upcoming</span>
                            <span className="mx-2 text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">1.8K people interested</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-8 relative">
                      <div className="flex items-start">
                        <div className="bg-green-600 rounded-full h-10 w-10 flex items-center justify-center text-white z-10">
                          <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" />
                        </div>
                        <div className="ml-6">
                          <span className="block text-sm text-gray-500">Dr. Sarah Johnson, Mental Health Specialist</span>
                          <h3 className="text-lg font-medium">Impact of Social Media on Mental Health</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            "I've seen a significant increase in anxiety and depression related to social media use among young adults..."
                          </p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Expert Insight</span>
                            <span className="mx-2 text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">3 days ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="flex items-start">
                        <div className="bg-purple-600 rounded-full h-10 w-10 flex items-center justify-center text-white z-10">
                          <HeartIcon className="h-5 w-5" />
                        </div>
                        <div className="ml-6">
                          <span className="block text-sm text-gray-500">James Wilson, Community Member</span>
                          <h3 className="text-lg font-medium">My Journey With Anxiety</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            "After years of struggling with anxiety, joining this community has given me the tools and support to manage my symptoms..."
                          </p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Personal Story</span>
                            <span className="mx-2 text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">1 week ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Campaign Cards */}
                <h2 className="text-xl font-semibold mb-4">Active Campaigns</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredCampaigns.map((campaign) => (
                    <div key={campaign.id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="h-48 bg-gray-200 relative">
                        <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full mb-2 inline-block">
                                {campaign.category}
                              </span>
                              <div className="flex space-x-2 mt-1">
                                {campaign.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 text-xs bg-black/30 text-white rounded-full">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-white">
                                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold">{campaign.title}</h3>
                          <div className="flex space-x-2">
                            <button className="p-1 text-gray-500 hover:text-blue-600">
                              <ShareIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{campaign.summary}</p>
                        
                        {/* Campaign Tabs */}
                        <div className="mb-6 border-b border-gray-200">
                          <div className="flex space-x-6">
                            <button className="px-1 py-2 border-b-2 border-blue-600 font-medium text-sm text-blue-600">
                              Overview
                            </button>
                            <button className="px-1 py-2 text-sm text-gray-500 hover:text-gray-700">
                              Discussion ({campaign.activeDiscussions})
                            </button>
                            <button className="px-1 py-2 text-sm text-gray-500 hover:text-gray-700">
                              Events ({campaign.upcomingEvents})
                            </button>
                            <button className="px-1 py-2 text-sm text-gray-500 hover:text-gray-700">
                              Toolkit
                            </button>
                          </div>
                        </div>
                        
                        {/* Impact Metrics */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                            <GlobeAltIcon className="h-6 w-6 text-blue-600 mb-1" />
                            <span className="text-sm font-medium text-gray-800">{campaign.peopleReached.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">People Reached</span>
                          </div>
                          <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                            <HandRaisedIcon className="h-6 w-6 text-green-600 mb-1" />
                            <span className="text-sm font-medium text-gray-800">{campaign.actionsCount.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">Actions Taken</span>
                          </div>
                          <div className="flex flex-col items-center p-3 bg-amber-50 rounded-lg">
                            <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-amber-600 mb-1" />
                            <span className="text-sm font-medium text-gray-800">{campaign.impact.storiesCount}</span>
                            <span className="text-xs text-gray-500">Stories Shared</span>
                          </div>
                        </div>
                        
                        {/* Call to Action */}
                        <div className="flex space-x-4">
                          <button
                            className={`flex-1 flex justify-center items-center px-4 py-3 border rounded-md text-sm font-medium ${
                              campaign.isJoined
                                ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                : 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {campaign.isJoined ? 'Joined' : campaign.callToAction}
                          </button>
                          <button className="px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
                            <AcademicCapIcon className="h-5 w-5 text-gray-600" />
                          </button>
                          <button className="px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
                            <HeartIcon className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                        
                        {/* Campaign Creator */}
                        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">{campaign.creator}</p>
                              <div className="flex items-center">
                                <CheckBadgeIcon className="h-4 w-4 text-blue-600 mr-1" />
                                <span className="text-xs text-gray-500">Verified Organization</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {campaign.impact.spread} Campaign
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 