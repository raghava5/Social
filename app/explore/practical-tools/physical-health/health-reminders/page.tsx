import { Suspense } from 'react'
import { Metadata } from 'next'
import {
  BellIcon,
  PlusIcon,
  ClockIcon,
  CalendarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Health Reminders | Practical Tools',
  description: 'Set up personalized reminders for your health and wellness activities.',
}

interface Reminder {
  id: string
  title: string
  description: string
  frequency: 'daily' | 'weekly' | 'custom'
  time: string
  days?: string[]
  category: string
  isActive: boolean
  lastCompleted?: string
}

const SAMPLE_REMINDERS: Reminder[] = [
  {
    id: '1',
    title: 'Drink Water',
    description: 'Stay hydrated! Drink a glass of water.',
    frequency: 'daily',
    time: '09:00',
    category: 'Hydration',
    isActive: true,
    lastCompleted: '2024-03-20T09:00:00Z'
  },
  {
    id: '2',
    title: 'Posture Check',
    description: 'Check and correct your posture while working.',
    frequency: 'daily',
    time: '11:00',
    category: 'Ergonomics',
    isActive: true
  },
  {
    id: '3',
    title: 'Weekly Weigh-In',
    description: 'Track your weight progress.',
    frequency: 'weekly',
    time: '08:00',
    days: ['Monday'],
    category: 'Tracking',
    isActive: true,
    lastCompleted: '2024-03-18T08:00:00Z'
  }
]

const REMINDER_CATEGORIES = [
  'Hydration',
  'Exercise',
  'Medication',
  'Sleep',
  'Ergonomics',
  'Tracking',
  'Appointments',
  'Other'
]

function ReminderCard({ reminder }: { reminder: Reminder }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-primary-50 rounded-lg">
            <BellIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">{reminder.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{reminder.description}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={reminder.isActive}
            onChange={() => {}}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 mr-1" />
          <span>{reminder.time}</span>
        </div>
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 mr-1" />
          <span className="capitalize">{reminder.frequency}</span>
          {reminder.days && (
            <span className="ml-1">({reminder.days.join(', ')})</span>
          )}
        </div>
        {reminder.lastCompleted && (
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-1" />
            <span>Last completed: {new Date(reminder.lastCompleted).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          {reminder.category}
        </span>
      </div>
    </div>
  )
}

function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary-50 rounded-lg">
            <BellIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Active Reminders</h3>
            <p className="text-2xl font-semibold text-gray-900">8</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary-50 rounded-lg">
            <CheckCircleIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
            <p className="text-2xl font-semibold text-gray-900">3/5</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary-50 rounded-lg">
            <ArrowPathIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Streak</h3>
            <p className="text-2xl font-semibold text-gray-900">5 days</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReminderFilters() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
            <option value="">All Categories</option>
            {REMINDER_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Frequency
          </label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
            <option value="">All Frequencies</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default function HealthReminders() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Reminders</h1>
          <p className="mt-2 text-lg text-gray-600">
            Stay on track with personalized health and wellness reminders.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            New Reminder
          </button>
        </div>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div>Loading stats...</div>}>
          <QuickStats />
        </Suspense>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-1">
          <Suspense fallback={<div>Loading filters...</div>}>
            <ReminderFilters />
          </Suspense>
        </div>

        <div className="mt-8 lg:mt-0 lg:col-span-3">
          <div className="space-y-6">
            <Suspense fallback={<div>Loading reminders...</div>}>
              {SAMPLE_REMINDERS.map(reminder => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
} 