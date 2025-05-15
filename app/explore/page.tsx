'use client'

import { useState } from 'react'
import TopNav from '../components/TopNav'
import {
  HeartIcon,
  AcademicCapIcon,
  SparklesIcon,
  BriefcaseIcon,
  BanknotesIcon,
  UsersIcon,
  UserIcon,
  HomeIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import ActivitiesTabContent from '../components/explore/ActivitiesTabContent'

const spokes = [
  {
    id: 'physical',
    name: 'Physical',
    icon: HeartIcon,
    description: 'Health, fitness, nutrition, and overall physical well-being',
  },
  {
    id: 'mental',
    name: 'Mental',
    icon: AcademicCapIcon,
    description: 'Cognitive development, learning, and mental clarity',
  },
  {
    id: 'emotional',
    name: 'Emotional',
    icon: SparklesIcon,
    description: 'Emotional intelligence, resilience, and self-awareness',
  },
  {
    id: 'spiritual',
    name: 'Spiritual',
    icon: BookOpenIcon,
    description: 'Inner growth, mindfulness, and connection to purpose',
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: BanknotesIcon,
    description: 'Money management, investments, and financial security',
  },
  {
    id: 'social',
    name: 'Social',
    icon: UsersIcon,
    description: 'Relationships, communication, and community engagement',
  },
  {
    id: 'career',
    name: 'Career',
    icon: BriefcaseIcon,
    description: 'Professional growth, skills development, and work fulfillment',
  },
  {
    id: 'intellectual',
    name: 'Intellectual',
    icon: AcademicCapIcon,
    description: 'Knowledge expansion, creativity, and continuous learning',
  },
  {
    id: 'family',
    name: 'Family',
    icon: HomeIcon,
    description: 'Family relationships, parenting, and home life balance',
  },
]

const tools = [
  {
    id: 'assessment',
    name: 'Life Balance Assessment',
    icon: PuzzlePieceIcon,
    description: 'Evaluate your current status across all life spokes',
  },
  {
    id: 'planner',
    name: 'Growth Planner',
    icon: WrenchScrewdriverIcon,
    description: 'Create personalized development plans for each spoke',
  },
  {
    id: 'tracker',
    name: 'Progress Tracker',
    icon: ChartBarIcon,
    description: 'Monitor your growth journey with detailed analytics',
  },
]

const games = [
  {
    id: 'daily-quest',
    name: 'Daily Quest',
    description: 'Complete daily challenges across different spokes',
  },
  {
    id: 'habit-builder',
    name: 'Habit Builder',
    description: 'Build lasting habits through gamified challenges',
  },
  {
    id: 'skill-tree',
    name: 'Skill Tree',
    description: 'Level up your life skills RPG-style',
  },
]

export default function ExplorePage() {
  const [activeSection, setActiveSection] = useState('activities')

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Your Growth</h1>
          <p className="mt-2 text-gray-600">
            Discover tools and resources for holistic personal development
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex space-x-2 sm:space-x-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveSection('activities')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg whitespace-nowrap ${
              activeSection === 'activities'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveSection('spokes')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg whitespace-nowrap ${
              activeSection === 'spokes'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            9 Spokes of Life
          </button>
          <button
            onClick={() => setActiveSection('tools')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg whitespace-nowrap ${
              activeSection === 'tools'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Practical Tools
          </button>
          <button
            onClick={() => setActiveSection('games')}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg whitespace-nowrap ${
              activeSection === 'games'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Mini Games
          </button>
        </div>

        {/* Activities Tab Content */}
        {activeSection === 'activities' && (
          <ActivitiesTabContent />
        )}

        {/* Spokes Grid */}
        {activeSection === 'spokes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spokes.map((spoke) => {
              const Icon = spoke.icon
              return (
                <Link
                  key={spoke.id}
                  href={`/explore/${spoke.id}`}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {spoke.name}
                      </h3>
                      <p className="text-sm text-gray-500">{spoke.description}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Tools Grid */}
        {activeSection === 'tools' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <div
                  key={tool.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-500">{tool.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Games Grid */}
        {activeSection === 'games' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {game.name}
                </h3>
                <p className="text-sm text-gray-500">{game.description}</p>
                <button className="mt-4 btn-primary w-full">Start Playing</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 