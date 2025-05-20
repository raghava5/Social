'use client'

import { useState } from 'react'
import TopNav from '../components/TopNav'
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  TrophyIcon,
  CalendarIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  BoltIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  SparklesIcon,
  AcademicCapIcon,
  HeartIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  UsersIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

export default function ActivitiesPage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-6">
        <ClipboardDocumentListIcon className="h-8 w-8 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">
          Track and manage your activities here. This section will show your ongoing and upcoming activities.
        </p>
        
        {/* Placeholder for activities list */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">Activities coming soon!</p>
        </div>
      </div>
    </div>
  )
} 