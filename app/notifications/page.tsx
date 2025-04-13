'use client'

import { useState } from 'react'
import Layout from '../components/Layout'
import {
  BellIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

// Dummy data for notifications
const dummyNotifications = {
  all: [
    {
      id: 1,
      type: 'like',
      message: 'John Doe liked your post',
      timestamp: '2 minutes ago',
      read: false,
      icon: HeartIcon,
    },
    {
      id: 2,
      type: 'comment',
      message: 'Jane Smith commented on your post',
      timestamp: '5 minutes ago',
      read: false,
      icon: ChatBubbleLeftIcon,
    },
    {
      id: 3,
      type: 'follow',
      message: 'Mike Johnson started following you',
      timestamp: '1 hour ago',
      read: true,
      icon: UserGroupIcon,
    },
    {
      id: 4,
      type: 'event',
      message: 'Meditation session starting in 30 minutes',
      timestamp: '2 hours ago',
      read: false,
      icon: CalendarIcon,
    },
    {
      id: 5,
      type: 'task',
      message: 'Daily meditation task completed',
      timestamp: '1 day ago',
      read: true,
      icon: CheckCircleIcon,
    },
  ],
  unread: [
    {
      id: 1,
      type: 'like',
      message: 'John Doe liked your post',
      timestamp: '2 minutes ago',
      read: false,
      icon: HeartIcon,
    },
    {
      id: 2,
      type: 'comment',
      message: 'Jane Smith commented on your post',
      timestamp: '5 minutes ago',
      read: false,
      icon: ChatBubbleLeftIcon,
    },
    {
      id: 4,
      type: 'event',
      message: 'Meditation session starting in 30 minutes',
      timestamp: '2 hours ago',
      read: false,
      icon: CalendarIcon,
    },
  ],
}

export default function Notifications() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [notifications, setNotifications] = useState(dummyNotifications.all)

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })))
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Mark all as read
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('all')
                setNotifications(dummyNotifications.all)
              }}
              className={`${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All
            </button>
            <button
              onClick={() => {
                setActiveTab('unread')
                setNotifications(dummyNotifications.unread)
              }}
              className={`${
                activeTab === 'unread'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Unread
            </button>
          </nav>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = notification.icon
            return (
              <div
                key={notification.id}
                className={`card p-4 flex items-start space-x-4 ${
                  !notification.read ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.timestamp}
                  </p>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      New
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
} 