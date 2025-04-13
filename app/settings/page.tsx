'use client'

import { useState } from 'react'
import Layout from '../components/Layout'
import {
  Cog6ToothIcon,
  BellIcon,
  EyeIcon,
  GlobeAltIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    activity: true,
    messages: true,
  })

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg w-full ${
                  activeTab === 'general'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Cog6ToothIcon className="h-5 w-5" />
                <span>General</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg w-full ${
                  activeTab === 'notifications'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BellIcon className="h-5 w-5" />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg w-full ${
                  activeTab === 'privacy'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <EyeIcon className="h-5 w-5" />
                <span>Privacy</span>
              </button>
              <button
                onClick={() => setActiveTab('language')}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg w-full ${
                  activeTab === 'language'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <GlobeAltIcon className="h-5 w-5" />
                <span>Language</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg w-full ${
                  activeTab === 'account'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Account</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg w-full ${
                  activeTab === 'security'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveTab('help')}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg w-full ${
                  activeTab === 'help'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
                <span>Help & Support</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'general' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">General Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Theme</h3>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                          theme === 'light'
                            ? 'bg-primary-50 text-primary-600'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        <SunIcon className="h-5 w-5" />
                        <span>Light</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-primary-50 text-primary-600'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        <MoonIcon className="h-5 w-5" />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('email')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        notifications.email
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {notifications.email ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Push Notifications</h3>
                      <p className="text-sm text-gray-500">
                        Receive push notifications
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('push')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        notifications.push
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {notifications.push ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Activity Notifications</h3>
                      <p className="text-sm text-gray-500">
                        Get notified about activities
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('activity')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        notifications.activity
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {notifications.activity ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Message Notifications</h3>
                      <p className="text-sm text-gray-500">
                        Get notified about new messages
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('messages')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        notifications.messages
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {notifications.messages ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Profile Visibility</h3>
                    <select className="input-field">
                      <option>Public</option>
                      <option>Friends Only</option>
                      <option>Private</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Activity Visibility</h3>
                    <select className="input-field">
                      <option>Show All</option>
                      <option>Show Basic</option>
                      <option>Show Minimal</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'language' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">Language Settings</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Preferred Language</h3>
                    <select className="input-field">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Email Address</h3>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Password</h3>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Change password"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Account Deletion</h3>
                    <button className="text-red-600 hover:text-red-700">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                    <button className="btn-primary">Enable 2FA</button>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Login History</h3>
                    <p className="text-sm text-gray-500">
                      View your recent login activity
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-6">Help & Support</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">FAQ</h3>
                    <p className="text-sm text-gray-500">
                      Browse frequently asked questions
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Contact Support</h3>
                    <p className="text-sm text-gray-500">
                      Get in touch with our support team
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
} 