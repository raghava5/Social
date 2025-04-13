'use client'

import Layout from '../components/Layout'
import { useState } from 'react'
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline'

// Dummy data
const groups = [
  {
    id: 1,
    name: 'Tech Enthusiasts',
    description: 'A community for technology lovers and developers',
    members: 1250,
    image: 'https://source.unsplash.com/random/800x600?tech',
    isMember: true,
  },
  {
    id: 2,
    name: 'Photography Club',
    description: 'Share your photos and learn from other photographers',
    members: 856,
    image: 'https://source.unsplash.com/random/800x600?photography',
    isMember: false,
  },
  {
    id: 3,
    name: 'Fitness Community',
    description: 'Get fit together and share workout tips',
    members: 2345,
    image: 'https://source.unsplash.com/random/800x600?fitness',
    isMember: true,
  },
  {
    id: 4,
    name: 'Book Lovers',
    description: 'Discuss your favorite books and discover new ones',
    members: 987,
    image: 'https://source.unsplash.com/random/800x600?books',
    isMember: false,
  },
]

const communities = [
  {
    id: 1,
    name: 'Local Tech Meetup',
    description: 'Monthly meetups for tech professionals in the area',
    members: 150,
    image: 'https://source.unsplash.com/random/800x600?meetup',
    isMember: true,
  },
  {
    id: 2,
    name: 'Startup Founders',
    description: 'Network with other startup founders and share experiences',
    members: 320,
    image: 'https://source.unsplash.com/random/800x600?startup',
    isMember: false,
  },
]

export default function Groups() {
  const [activeTab, setActiveTab] = useState<'groups' | 'communities'>('groups')

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Groups & Communities</h1>
          <button className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Group
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('groups')}
              className={`${
                activeTab === 'groups'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveTab('communities')}
              className={`${
                activeTab === 'communities'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Communities
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'groups' ? groups : communities).map((item) => (
            <div key={item.id} className="card overflow-hidden">
              <div className="relative h-48">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.isMember && (
                  <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                    Member
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <UserGroupIcon className="h-5 w-5 mr-1" />
                    {item.members} members
                  </div>
                  <button
                    className={`${
                      item.isMember ? 'btn-secondary' : 'btn-primary'
                    } text-sm`}
                  >
                    {item.isMember ? 'Leave' : 'Join'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
} 