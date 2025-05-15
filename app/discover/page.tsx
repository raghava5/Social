'use client'

import { useState } from 'react'
import { PuzzlePieceIcon, ChartBarIcon, CalendarIcon } from '@heroicons/react/solid'
import TopNav from '../components/TopNav'
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  TrophyIcon,
  BookOpenIcon,
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
  GlobeAltIcon,
  LightBulbIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

// Define types for the new Knowledge Sharing content
type LearningModule = {
  id: string;
  title: string;
  type: 'course' | 'article';
  content: string; // Placeholder, could be a path or actual content
  quiz?: Quiz;
};

type Quiz = {
  id: string;
  title: string;
  questions: any[]; // Define a proper type for questions later
};

type ExpertInsight = {
  id: string;
  title: string;
  type: 'video' | 'podcast' | 'qa';
  url: string; // URL to the content
};

type Challenge = {
  id: string;
  title: string;
  description: string;
  duration: number; // e.g., 30 days
  dailyTasks: string[];
};

type SpokeContent = {
  learningModules: LearningModule[];
  expertInsights: ExpertInsight[];
  challenges: Challenge[];
  // Add fields for Personalized Content Recommendations, Progress Tracking, Community Wisdom, Microlearning later
};

// Updated Spoke type to include Knowledge Sharing content
type Spoke = {
  id: string;
  name: string;
  icon: any;
  description: string;
  content: SpokeContent; // New field for knowledge sharing content
  // Keep existing fields if needed for other views, or remove if replaced
  progress?: number; 
  subcategories?: any[]; 
};

// Define the 10 Spokes with placeholder content structure
const spokes: Spoke[] = [
  {
    id: 'physical',
    name: 'Physical',
    icon: HeartIcon,
    description: 'Health, fitness, nutrition, and overall physical well-being',
    content: {
      learningModules: [],
      expertInsights: [],
      challenges: [],
    },
  },
  {
    id: 'mental',
    name: 'Mental',
    icon: AcademicCapIcon,
    description: 'Cognitive development, learning, and mental clarity',
    content: {
      learningModules: [],
      expertInsights: [],
      challenges: [],
    },
  },
  {
    id: 'emotional',
    name: 'Emotional',
    icon: SparklesIcon,
    description: 'Emotional intelligence, resilience, and self-awareness',
    content: {
      learningModules: [],
      expertInsights: [],
      challenges: [],
    },
  },
  {
    id: 'spiritual',
    name: 'Spiritual',
    icon: BookOpenIcon,
    description: 'Inner growth, mindfulness, and connection to purpose',
    content: {
      learningModules: [],
      expertInsights: [],
      challenges: [],
    },
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: BanknotesIcon,
    description: 'Money management, investments, and financial security',
    content: {
      learningModules: [],
      expertInsights: [],
      challenges: [],
    },
  },
  {
    id: 'social',
    name: 'Social',
    icon: UsersIcon,
    description: 'Relationships, communication, and community engagement',
    content: {
      learningModules: [],
      expertInsights: [],
      challenges: [],
    },
  },
  {
    id: 'career',
    name: 'Career',
    icon: BriefcaseIcon,
    description: 'Professional growth, skills development, and work fulfillment',
    content: {
      learningModules: [],
      expertInsights: [],
      challenges: [],
    },
  },
  {
    id: 'intellectual',
    name: 'Intellectual',
    icon: AcademicCapIcon,
    description: 'Knowledge expansion, creativity, and continuous learning',
    content: {
      learningModules: [],
      expertInsights: [],
      challenges: [],
    },
  },
  {
    id: 'family',
    name: 'Family',
    icon: HomeIcon,
    description: 'Family relationships, parenting, and home life balance',
    content: {
      learningModules: [],
      expertInsights: [],
      challenges: [],
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: LightBulbIcon,
    description: 'Artistic expression, innovation, and imagination',
    content: {
      learningModules: [],
      expertInsights: [],
      challenges: [],
    },
  },
];

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState('activities')
  const [selectedSpoke, setSelectedSpoke] = useState<Spoke | null>(spokes[0]) // Select the first spoke by default

  // Filter out subcategory and activity states if they are no longer needed in the Explore tab
  // const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Discover</h1>
          <p className="mt-2 text-gray-600">
            Find new activities, communities, and resources
          </p>
        </div>
        
        {/* Main Tabs */}
        <div className="mb-6 bg-white inline-flex rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'activities'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'explore'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-6 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'tools'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`px-6 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'games'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600'
            }`}
          >
            Mini Games
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'activities' ? (
          // Explore Tab Content (Knowledge Sharing)
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Explore - Knowledge Sharing</h2>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Pane - Spoke Navigation */}
              <div className="md:w-1/4">
                <h3 className="text-xl font-semibold mb-4">Life Spokes</h3>
                <div className="space-y-2">
                  {spokes.map((spoke) => (
                    <button
                      key={spoke.id}
                      onClick={() => setSelectedSpoke(spoke)}
                      className={`w-full text-left px-4 py-2 rounded ${ selectedSpoke?.id === spoke.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <div className="flex items-center">
                         <spoke.icon className="h-5 w-5 mr-2" />
                        <span>{spoke.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Pane - Spoke Content */}
              <div className="md:w-3/4">
                {selectedSpoke ? (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedSpoke.name}</h3>
                    <p className="text-gray-600 mb-6">{selectedSpoke.description}</p>

                    {/* Placeholder for Knowledge Sharing Content */}
                    <div className="space-y-8">
                      {/* Interactive Learning Modules */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3">Interactive Learning Modules</h4>
                         {selectedSpoke.content.learningModules.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedSpoke.content.learningModules.map(module => (
                              <div key={module.id} className="bg-gray-50 p-4 rounded-lg border">
                                <h5 className="font-semibold">{module.title}</h5>
                                <p className="text-sm text-gray-600">Type: {module.type}</p>
                                {/* Add link/button to access module */}                             
                                <button className="mt-2 text-sm text-blue-600 hover:underline">Start {module.type === 'course' ? 'Course' : 'Reading'}</button>
                              </div>
                            ))}
                          </div>
                         ) : (
                           <p className="text-gray-500 text-sm">No learning modules available yet.</p>
                         )}
                      </div>

                       {/* Expert Insights */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3">Expert Insights</h4>
                         {selectedSpoke.content.expertInsights.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedSpoke.content.expertInsights.map(insight => (
                              <div key={insight.id} className="bg-gray-50 p-4 rounded-lg border">
                                <h5 className="font-semibold">{insight.title}</h5>
                                <p className="text-sm text-gray-600">Type: {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}</p>
                                {/* Add link/button to access insight */}                             
                                <a href={insight.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-blue-600 hover:underline">Watch/Listen/Read</a>
                              </div>
                            ))}
                          </div>
                         ) : (
                           <p className="text-gray-500 text-sm">No expert insights available yet.</p>
                         )}
                      </div>

                       {/* Spoke-Specific Challenges */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3">Spoke-Specific Challenges</h4>
                         {selectedSpoke.content.challenges.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedSpoke.content.challenges.map(challenge => (
                              <div key={challenge.id} className="bg-gray-50 p-4 rounded-lg border">
                                <h5 className="font-semibold">{challenge.title}</h5>
                                <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                                 {/* Add start button and potentially streak tracking UI */}                             
                                <button className="mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Start Challenge</button>
                              </div>
                            ))}
                          </div>
                         ) : (
                           <p className="text-gray-500 text-sm">No challenges available yet.</p>
                         )}
                      </div>

                      {/* Placeholders for other sections */} {/* Add sections for Personalized Recommendations, Progress Tracking, Community Wisdom, Microlearning here */}
                       <div>
                         <h4 className="text-lg font-semibold mb-3">Personalized Recommendations</h4>
                         <p className="text-gray-500 text-sm">Recommendations will appear here.</p>
                       </div>
                        <div>
                         <h4 className="text-lg font-semibold mb-3">Progress Tracking</h4>
                         <p className="text-gray-500 text-sm">Your progress will be shown here.</p>
                       </div>
                       <div>
                         <h4 className="text-lg font-semibold mb-3">Community Wisdom</h4>
                         <p className="text-gray-500 text-sm">Community tips and discussions will be available here.</p>
                       </div>
                        <div>
                         <h4 className="text-lg font-semibold mb-3">Microlearning</h4>
                         <p className="text-gray-500 text-sm">Daily bite-sized content will appear here.</p>
                       </div>

                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Select a life spoke to explore knowledge sharing resources.</p>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'explore' ? (
          // Activities Tab Content (Original Activities Content)
           <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Activities</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        ) : activeTab === 'tools' ? (
          // Tools Tab Content
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <PuzzlePieceIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold">Life Balance Assessment</h3>
                </div>
                <p className="text-gray-600 text-sm">Evaluate your current status across all life spokes</p>
                <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Start Assessment
                </button>
              </div>
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold">Progress Tracker</h3>
                </div>
                <p className="text-gray-600 text-sm">Monitor your growth journey with detailed analytics</p>
                <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Progress
                </button>
              </div>
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold">Goal Planner</h3>
                </div>
                <p className="text-gray-600 text-sm">Set and track your personal development goals</p>
                <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Plan Goals
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Mini Games Tab Content
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mini Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-3">Daily Quest</h3>
                <p className="text-gray-600 text-sm mb-4">Complete daily challenges across different life spokes</p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Start Quest
                </button>
              </div>
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-3">Habit Builder</h3>
                <p className="text-gray-600 text-sm mb-4">Build lasting habits through gamified challenges</p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Build Habits
                </button>
              </div>
              <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-3">Skill Tree</h3>
                <p className="text-gray-600 text-sm mb-4">Level up your life skills RPG-style</p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View Tree
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}