'use client'

import { useState } from 'react'
import Layout from '../components/Layout'
import {
  HandRaisedIcon,
  HeartIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

// Dummy data for help offers and requests
const dummyData = {
  offers: [
    {
      id: 1,
      user: {
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      category: 'Spiritual',
      title: 'Guided Meditation',
      description: 'I can guide you through a 15-minute meditation session',
      duration: '15 min',
      karmaPoints: 10,
    },
    {
      id: 2,
      user: {
        name: 'Jane Smith',
        avatar: 'https://i.pravatar.cc/150?img=2',
      },
      category: 'Professional',
      title: 'Career Advice',
      description: 'I can help with resume review and career planning',
      duration: '30 min',
      karmaPoints: 15,
    },
  ],
  requests: [
    {
      id: 1,
      user: {
        name: 'Mike Johnson',
        avatar: 'https://i.pravatar.cc/150?img=3',
      },
      category: 'Mental',
      title: 'Study Partner',
      description: 'Looking for someone to study with for upcoming exam',
      duration: '1 hour',
      karmaPoints: 20,
    },
    {
      id: 2,
      user: {
        name: 'Sarah Wilson',
        avatar: 'https://i.pravatar.cc/150?img=4',
      },
      category: 'Physical',
      title: 'Workout Buddy',
      description: 'Need a partner for morning workouts',
      duration: '45 min',
      karmaPoints: 15,
    },
  ],
}

export default function Help() {
  const [activeTab, setActiveTab] = useState<'offers' | 'requests'>('offers')
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'offer' | 'request'>('offer')

  const handleOfferHelp = () => {
    setFormType('offer')
    setShowForm(true)
  }

  const handleRequestHelp = () => {
    setFormType('request')
    setShowForm(true)
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Help & Support Exchange</h1>
          <div className="space-x-4">
            <button
              onClick={handleOfferHelp}
              className="btn-primary flex items-center space-x-2"
            >
              <HandRaisedIcon className="h-5 w-5" />
              <span>Offer Help</span>
            </button>
            <button
              onClick={handleRequestHelp}
              className="btn-secondary flex items-center space-x-2"
            >
              <HeartIcon className="h-5 w-5" />
              <span>Request Help</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('offers')}
              className={`${
                activeTab === 'offers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Help Offers
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`${
                activeTab === 'requests'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Help Requests
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'offers' ? dummyData.offers : dummyData.requests).map(
            (item) => (
              <div key={item.id} className="card p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={item.user.avatar}
                    alt={item.user.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{item.user.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                </div>
                <h4 className="font-medium mb-2">{item.title}</h4>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    <span>{item.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-primary-600">
                    <UserGroupIcon className="h-4 w-4" />
                    <span>{item.karmaPoints} Karma Points</span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">
                {formType === 'offer' ? 'Offer Help' : 'Request Help'}
              </h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select className="input-field mt-1">
                    <option>Spiritual</option>
                    <option>Mental</option>
                    <option>Physical</option>
                    <option>Personal</option>
                    <option>Professional</option>
                    <option>Financial</option>
                    <option>Social</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input type="text" className="input-field mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea className="input-field mt-1" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Duration
                  </label>
                  <input type="text" className="input-field mt-1" />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
} 