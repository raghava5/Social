'use client'

import { useState } from 'react'
import {
  UserGroupIcon,
  // Icons for spokes - will add specific ones as needed or pass them
  SparklesIcon, // Example for Spiritual
  HeartIcon, // Example for Physical
  AcademicCapIcon, // Example for Mental
  BanknotesIcon, // Example for Financial
  UsersIcon, // Example for Social
  BriefcaseIcon, // Example for Career
  // ... add other spoke icons as used in app/activities/page.tsx
  ClipboardDocumentListIcon,
  ChartBarIcon,
  TrophyIcon,
  CalendarIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  BoltIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'

// Re-defining types from app/activities/page.tsx
type Activity = {
  id: number
  name: string
  completed: boolean
  level: 'Beginner' | 'Intermediate' | 'Professional'
}

type Subcategory = {
  id: string
  name: string
  activities: Activity[]
}

type Spoke = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  progress: number // Assuming progress is still relevant here
  subcategories: Subcategory[]
}

// --- Data from app/activities/page.tsx (Partial for brevity, focusing on structure) ---
// It's better to have this data passed as props or fetched, but for now, let's use a sample.

const activitiesData: Spoke[] = [
  {
    id: 'spiritual',
    name: 'Spiritual',
    icon: SparklesIcon,
    progress: 75,
    subcategories: [
      {
        id: 'meditation',
        name: 'Meditation & Mindfulness',
        activities: [
          { id: 1, name: 'Sit quietly for 1 minute focusing on your breath', completed: false, level: 'Beginner' },
          { id: 2, name: 'Practice 3-minute mindful breathing', completed: false, level: 'Beginner' },
          { id: 3, name: 'Follow a 5-minute guided meditation', completed: false, level: 'Beginner' },
          { id: 4, name: 'Journal thoughts after meditation', completed: false, level: 'Beginner' },
          { id: 5, name: 'Try body scan meditation', completed: false, level: 'Beginner' },
        ],
      },
      {
        id: 'prayer',
        name: 'Prayer & Rituals',
        activities: [
          { id: 1, name: 'Set a daily prayer intention', completed: false, level: 'Beginner' },
          { id: 2, name: 'Light a candle in silence', completed: false, level: 'Beginner' },
          { id: 3, name: 'Practice morning or evening prayers', completed: false, level: 'Beginner' },
          { id: 4, name: 'Learn a traditional prayer from your faith', completed: false, level: 'Beginner' },
          { id: 5, name: 'Create a peaceful prayer corner', completed: false, level: 'Beginner' },
        ],
      },
    ],
  },
  {
    id: 'physical',
    name: 'Physical',
    icon: HeartIcon,
    progress: 60,
    subcategories: [
      {
        id: 'exercise',
        name: 'Exercise & Movement',
        activities: [
          { id: 1, name: 'Go for a 10-minute walk', completed: false, level: 'Beginner' },
          { id: 2, name: 'Do 5 push-ups', completed: false, level: 'Beginner' },
          { id: 3, name: 'Try a basic stretching routine', completed: false, level: 'Beginner' },
          { id: 4, name: 'Practice proper breathing during exercise', completed: false, level: 'Beginner' },
          { id: 5, name: 'Complete a beginner workout video', completed: false, level: 'Beginner' },
        ],
      },
      {
        id: 'nutrition',
        name: 'Nutrition & Diet',
        activities: [
          { id: 1, name: 'Track water intake for a day', completed: false, level: 'Beginner' },
          { id: 2, name: 'Plan a healthy meal', completed: false, level: 'Beginner' },
          { id: 3, name: 'Learn about portion sizes', completed: false, level: 'Beginner' },
          { id: 4, name: 'Try a new healthy recipe', completed: false, level: 'Beginner' },
          { id: 5, name: 'Keep a food diary for a day', completed: false, level: 'Beginner' },
        ],
      },
    ],
  },
  {
    id: 'mental',
    name: 'Mental',
    icon: AcademicCapIcon,
    progress: 45,
    subcategories: [
      {
        id: 'learning',
        name: 'Learning & Growth',
        activities: [
          { id: 1, name: 'Read an educational article', completed: false, level: 'Beginner' },
          { id: 2, name: 'Watch a documentary', completed: false, level: 'Beginner' },
          { id: 3, name: 'Practice a new skill for 15 minutes', completed: false, level: 'Beginner' },
          { id: 4, name: 'Take notes on something you learned', completed: false, level: 'Beginner' },
          { id: 5, name: 'Teach someone something new', completed: false, level: 'Beginner' },
        ],
      },
      {
        id: 'mindfulness',
        name: 'Mental Wellness',
        activities: [
          { id: 1, name: 'Practice deep breathing exercises', completed: false, level: 'Beginner' },
          { id: 2, name: 'Write down your thoughts', completed: false, level: 'Beginner' },
          { id: 3, name: 'Try a mindfulness exercise', completed: false, level: 'Beginner' },
          { id: 4, name: 'Set a daily intention', completed: false, level: 'Beginner' },
          { id: 5, name: 'Practice positive self-talk', completed: false, level: 'Beginner' },
        ],
      },
    ],
  },
  {
    id: 'emotional',
    name: 'Emotional',
    icon: SparklesIcon,
    progress: 30,
    subcategories: [
      {
        id: 'awareness',
        name: 'Emotional Awareness',
        activities: [
          { id: 1, name: 'Journal about your feelings', completed: false, level: 'Beginner' },
          { id: 2, name: 'Identify your emotional triggers', completed: false, level: 'Beginner' },
          { id: 3, name: 'Practice emotional labeling', completed: false, level: 'Beginner' },
          { id: 4, name: 'Share feelings with a trusted friend', completed: false, level: 'Beginner' },
          { id: 5, name: 'Create an emotion wheel', completed: false, level: 'Beginner' },
        ],
      },
    ],
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: BanknotesIcon,
    progress: 55,
    subcategories: [
      {
        id: 'budgeting',
        name: 'Budgeting & Planning',
        activities: [
          { id: 1, name: 'Track expenses for a day', completed: false, level: 'Beginner' },
          { id: 2, name: 'Create a basic budget', completed: false, level: 'Beginner' },
          { id: 3, name: 'Set a financial goal', completed: false, level: 'Beginner' },
          { id: 4, name: 'Learn about investment basics', completed: false, level: 'Beginner' },
          { id: 5, name: 'Review your subscriptions', completed: false, level: 'Beginner' },
        ],
      },
    ],
  },
  {
    id: 'social',
    name: 'Social',
    icon: UsersIcon,
    progress: 70,
    subcategories: [
      {
        id: 'connections',
        name: 'Building Connections',
        activities: [
          { id: 1, name: 'Reach out to an old friend', completed: false, level: 'Beginner' },
          { id: 2, name: 'Practice active listening', completed: false, level: 'Beginner' },
          { id: 3, name: 'Join a social group or club', completed: false, level: 'Beginner' },
          { id: 4, name: 'Have a meaningful conversation', completed: false, level: 'Beginner' },
          { id: 5, name: 'Volunteer in your community', completed: false, level: 'Beginner' },
        ],
      },
    ],
  },
  {
    id: 'career',
    name: 'Career',
    icon: BriefcaseIcon,
    progress: 40,
    subcategories: [
      {
        id: 'development',
        name: 'Career Development',
        activities: [
          { id: 1, name: 'Update your resume', completed: false, level: 'Beginner' },
          { id: 2, name: 'Learn a new work skill', completed: false, level: 'Beginner' },
          { id: 3, name: 'Network with professionals', completed: false, level: 'Beginner' },
          { id: 4, name: 'Set career goals', completed: false, level: 'Beginner' },
          { id: 5, name: 'Research industry trends', completed: false, level: 'Beginner' },
        ],
      },
    ],
  },
  {
    id: 'intellectual',
    name: 'Intellectual',
    icon: BookOpenIcon,
    progress: 65,
    subcategories: [
      {
        id: 'growth',
        name: 'Intellectual Growth',
        activities: [
          { id: 1, name: 'Read a challenging book', completed: false, level: 'Beginner' },
          { id: 2, name: 'Solve a puzzle', completed: false, level: 'Beginner' },
          { id: 3, name: 'Learn a new language', completed: false, level: 'Beginner' },
          { id: 4, name: 'Write a thoughtful essay', completed: false, level: 'Beginner' },
          { id: 5, name: 'Engage in intellectual discussion', completed: false, level: 'Beginner' },
        ],
      },
    ],
  },
  {
    id: 'family',
    name: 'Family',
    icon: HomeIcon,
    progress: 80,
    subcategories: [
      {
        id: 'relationships',
        name: 'Family Relationships',
        activities: [
          { id: 1, name: 'Plan family activity', completed: false, level: 'Beginner' },
          { id: 2, name: 'Have a family meal', completed: false, level: 'Beginner' },
          { id: 3, name: 'Create family traditions', completed: false, level: 'Beginner' },
          { id: 4, name: 'Share family stories', completed: false, level: 'Beginner' },
          { id: 5, name: 'Express gratitude to family', completed: false, level: 'Beginner' },
        ],
      },
    ],
  },
];


const helpRequests = [
  {
    id: 1,
    title: 'Need help with meditation practice',
    category: 'Spiritual',
    description: 'Looking for a meditation buddy to practice together',
    karmaPoints: 50,
    status: 'Open',
  },
  {
    id: 2,
    title: 'Seeking financial advice',
    category: 'Financial',
    description: 'Need guidance on investment strategies',
    karmaPoints: 100,
    status: 'Open',
  },
  {
    id: 3,
    title: 'Exercise accountability partner',
    category: 'Physical',
    description: 'Looking for someone to work out with 3 times a week',
    karmaPoints: 75,
    status: 'Open',
  },
  {
    id: 4,
    title: 'Career mentorship needed',
    category: 'Career',
    description: 'Seeking guidance in software development career path',
    karmaPoints: 150,
    status: 'Open',
  },
  {
    id: 5,
    title: 'Language exchange partner',
    category: 'Intellectual',
    description: 'Looking to practice Spanish conversation',
    karmaPoints: 60,
    status: 'Open',
  },
];

const helpOffers = [
  {
    id: 1,
    title: 'Offering fitness coaching',
    category: 'Physical',
    description: 'Free personal training sessions for beginners',
    karmaPoints: 75,
    status: 'Available',
  },
  {
    id: 2,
    title: 'Meditation guidance',
    category: 'Spiritual',
    description: 'Can help beginners start their meditation journey',
    karmaPoints: 50,
    status: 'Available',
  },
  {
    id: 3,
    title: 'Financial planning assistance',
    category: 'Financial',
    description: 'Help with basic budgeting and saving strategies',
    karmaPoints: 100,
    status: 'Available',
  },
  {
    id: 4,
    title: 'Career resume review',
    category: 'Career',
    description: 'Professional resume feedback and optimization',
    karmaPoints: 80,
    status: 'Available',
  },
  {
    id: 5,
    title: 'Mental wellness support',
    category: 'Mental',
    description: 'Offering listening ear and coping strategies',
    karmaPoints: 90,
    status: 'Available',
  },
];
// --- End of Data ---


export default function ActivitiesTabContent() {
  const [selectedSpoke, setSelectedSpoke] = useState<Spoke | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [showHelpSupport, setShowHelpSupport] = useState(false)
  const [showHelpRequests, setShowHelpRequests] = useState(false)
  const [showHelpOffers, setShowHelpOffers] = useState(false)

  const handleSpokeClick = (spoke: Spoke) => {
    setSelectedSpoke(spoke)
    setSelectedSubcategory(null) // Reset subcategory when a new spoke is clicked
    setShowHelpSupport(false)
    setShowHelpRequests(false)
    setShowHelpOffers(false)
  }

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory)
  }

  const handleHelpSupportClick = () => {
    setShowHelpSupport(true)
    setShowHelpRequests(false) // Default to requests, or add another state for sub-tabs
    setShowHelpOffers(false)
    setSelectedSpoke(null)
    setSelectedSubcategory(null)
  }
  
  const handleToggleActivity = (spokeId: string, subcategoryId: string, activityId: number) => {
    // This is a placeholder for actual state update logic
    // In a real app, you'd update the state and likely persist this change
    console.log("Toggle activity:", spokeId, subcategoryId, activityId);
    alert(`Toggled activity ${activityId} in ${subcategoryId} of ${spokeId}`);
  };


  return (
    <div>
      {/* Combined Menu - adapted from app/activities/page.tsx */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {/* Help Others Button */}
          <button
            className={`flex flex-col items-center p-3 md:p-4 rounded-lg transition-colors text-center ${
              showHelpSupport
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
            onClick={handleHelpSupportClick}
          >
            <UserGroupIcon className="h-7 w-7 md:h-8 md:w-8 mb-1 md:mb-2" />
            <span className="text-xs md:text-sm font-medium">Help Others</span>
          </button>

          {/* Spokes Buttons */}
          {activitiesData.map((spoke) => (
            <button
              key={spoke.id}
              className={`flex flex-col items-center p-3 md:p-4 rounded-lg transition-colors text-center ${
                selectedSpoke?.id === spoke.id && !showHelpSupport
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
              }`}
              onClick={() => handleSpokeClick(spoke)}
            >
              <spoke.icon className="h-7 w-7 md:h-8 md:w-8 mb-1 md:mb-2" />
              <span className="text-xs md:text-sm font-medium">{spoke.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Display Area */}
      {showHelpSupport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Help & Support</h2>
          <div className="flex space-x-4 mb-6 border-b pb-4">
            <button 
              onClick={() => { setShowHelpRequests(true); setShowHelpOffers(false); }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${showHelpRequests && !showHelpOffers ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Requests
            </button>
            <button 
              onClick={() => { setShowHelpRequests(false); setShowHelpOffers(true); }}
              className={`px-4 py-2 rounded-md text-sm font-medium ${showHelpOffers ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Offers
            </button>
          </div>

          {showHelpRequests && !showHelpOffers && (
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Help Requests</h3>
              {helpRequests.length > 0 ? (
                <ul className="space-y-4">
                  {helpRequests.map(req => (
                    <li key={req.id} className="p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-semibold text-gray-700">{req.title}</h4>
                      <p className="text-sm text-gray-600">Category: {req.category}</p>
                      <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs font-medium text-primary-600">Karma: {req.karmaPoints}</span>
                        <button className="btn-secondary btn-sm">Offer Help</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500">No active help requests.</p>}
            </div>
          )}

          {showHelpOffers && (
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Help Offers</h3>
              {helpOffers.length > 0 ? (
                <ul className="space-y-4">
                  {helpOffers.map(offer => (
                    <li key={offer.id} className="p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-semibold text-gray-700">{offer.title}</h4>
                      <p className="text-sm text-gray-600">Category: {offer.category}</p>
                      <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs font-medium text-green-600">Karma: {offer.karmaPoints}</span>
                        <button className="btn-secondary btn-sm">Request Help</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500">No active help offers.</p>}
            </div>
          )}
        </div>
      )}

      {/* Selected Spoke Content */}
      {selectedSpoke && !showHelpSupport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              <selectedSpoke.icon className="h-8 w-8 inline-block mr-2 text-primary-600" />
              {selectedSpoke.name} Activities
            </h2>
            <div className="flex items-center">
              <div className="w-48 bg-gray-200 rounded-full h-2 mr-3">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${selectedSpoke.progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{selectedSpoke.progress}%</span>
            </div>
          </div>

          {/* Subcategories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedSpoke.subcategories.map((subcategory) => (
              <div
                key={subcategory.id}
                className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                  selectedSubcategory?.id === subcategory.id
                    ? 'bg-primary-50 border-primary-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => handleSubcategoryClick(subcategory)}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{subcategory.name}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {subcategory.activities.length} activities available
                </p>
                {selectedSubcategory?.id === subcategory.id && (
                  <div className="mt-4 space-y-3">
                    {subcategory.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-2 bg-white rounded border"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={activity.completed}
                            onChange={() => handleToggleActivity(selectedSpoke.id, subcategory.id, activity.id)}
                            className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          />
                          <span className={`text-sm ${activity.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {activity.name}
                          </span>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {activity.level}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Welcome Message when nothing is selected */}
      {!selectedSpoke && !showHelpSupport && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to Activities</h2>
          <p className="text-gray-600">
            Select a category above to explore activities or help others in their growth journey.
          </p>
        </div>
      )}
    </div>
  )
} 