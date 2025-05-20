'use client'

import { UserGroupIcon, GlobeAltIcon, FireIcon } from '@heroicons/react/24/outline'

const trendingTopics = [
  { name: 'Mental Health Awareness', posts: 1234, category: 'Mental' },
  { name: 'Mindful Living', posts: 890, category: 'Spiritual' },
  { name: 'Career Growth', posts: 567, category: 'Professional' },
  { name: 'Financial Freedom', posts: 432, category: 'Financial' },
]

const suggestedConnections = [
  {
    name: 'Sarah Johnson',
    role: 'Mindfulness Coach',
    avatar: '/avatars/sarah.jpg',
    mutualConnections: 12,
  },
  {
    name: 'David Chen',
    role: 'Life Coach',
    avatar: '/avatars/david.jpg',
    mutualConnections: 8,
  },
  {
    name: 'Emma Wilson',
    role: 'Wellness Expert',
    avatar: '/avatars/emma.jpg',
    mutualConnections: 15,
  },
]

export default function RightSidebar() {
  return (
    <div className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 lg:right-0 lg:border-l lg:border-gray-200 lg:bg-white lg:pt-16">
      <div className="flex flex-col flex-grow overflow-y-auto">
        <div className="px-4 py-6">
          {/* Trending Topics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trending Topics</h2>
            <div className="space-y-4">
              {trendingTopics.map((topic) => (
                <div key={topic.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{topic.name}</p>
                      <p className="text-xs text-gray-500">{topic.posts} posts</p>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {topic.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Connections */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Suggested Connections</h2>
            <div className="space-y-4">
              {suggestedConnections.map((person) => (
                <div key={person.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0">
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="h-10 w-10 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/40';
                        }}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{person.name}</p>
                      <p className="text-xs text-gray-500">{person.role}</p>
                      <p className="text-xs text-gray-400">
                        {person.mutualConnections} mutual connections
                      </p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 