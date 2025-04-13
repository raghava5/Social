'use client'

import { useState } from 'react'
import Layout from '../components/Layout'
import SearchBar from '../components/SearchBar'

// Dummy data for search results
const dummyResults = {
  users: [
    { id: 1, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', bio: 'Tech enthusiast and mindfulness practitioner' },
    { id: 2, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2', bio: 'Health and wellness coach' },
  ],
  groups: [
    { id: 1, name: 'Tech Enthusiasts', members: 1250, description: 'A community for technology lovers' },
    { id: 2, name: 'Mindfulness Group', members: 856, description: 'Daily meditation and mindfulness practices' },
  ],
  posts: [
    { id: 1, title: 'Morning Meditation Tips', author: 'John Doe', content: 'Start your day with these simple meditation techniques...' },
    { id: 2, title: 'Healthy Eating Guide', author: 'Jane Smith', content: 'Learn how to maintain a balanced diet...' },
  ],
}

export default function Search() {
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'groups' | 'posts'>('all')

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              People
            </button>
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
              onClick={() => setActiveTab('posts')}
              className={`${
                activeTab === 'posts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Posts
            </button>
          </nav>
        </div>

        {/* Results */}
        <div className="space-y-8">
          {/* Users */}
          {(activeTab === 'all' || activeTab === 'users') && (
            <div>
              <h2 className="text-lg font-semibold mb-4">People</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dummyResults.users.map((user) => (
                  <div
                    key={user.id}
                    className="card p-4 flex items-center space-x-4"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Groups */}
          {(activeTab === 'all' || activeTab === 'groups') && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Groups</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dummyResults.groups.map((group) => (
                  <div
                    key={group.id}
                    className="card p-4"
                  >
                    <h3 className="font-medium mb-2">{group.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{group.description}</p>
                    <p className="text-sm text-gray-500">{group.members} members</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts */}
          {(activeTab === 'all' || activeTab === 'posts') && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Posts</h2>
              <div className="space-y-4">
                {dummyResults.posts.map((post) => (
                  <div
                    key={post.id}
                    className="card p-4"
                  >
                    <h3 className="font-medium mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">by {post.author}</p>
                    <p className="text-gray-600">{post.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
} 