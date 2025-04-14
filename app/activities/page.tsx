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
} from '@heroicons/react/24/outline'

// Types for activities data structure
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
  icon: any
  progress: number
  subcategories: Subcategory[]
}

// Dummy data for demonstration
const spokes: Spoke[] = [
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
          { id: 6, name: 'Meditate for 10 consecutive days', completed: false, level: 'Beginner' },
          { id: 7, name: 'Meditate for 10 minutes daily', completed: false, level: 'Beginner' },
          { id: 8, name: 'Learn about different types of meditation', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Practice walking meditation', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Attend a meditation circle or class', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Meditate for 20+ minutes consistently', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Read books by spiritual teachers', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Try mantra meditation', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Practice loving-kindness (Metta) meditation', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Join a virtual meditation retreat', completed: false, level: 'Professional' },
          { id: 16, name: 'Host a meditation group', completed: false, level: 'Professional' },
          { id: 17, name: 'Learn to guide others in mindfulness', completed: false, level: 'Professional' },
          { id: 18, name: 'Study mindfulness-based stress reduction (MBSR)', completed: false, level: 'Professional' },
          { id: 19, name: 'Participate in a silent retreat', completed: false, level: 'Professional' },
          { id: 20, name: 'Become a certified mindfulness coach', completed: false, level: 'Professional' }
        ]
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
          { id: 6, name: 'Say grace before meals', completed: false, level: 'Beginner' },
          { id: 7, name: 'Attend a prayer session or service', completed: false, level: 'Beginner' },
          { id: 8, name: 'Write a personal prayer', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Recite affirmations as modern prayer', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Reflect on prayer in a journal', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Memorize a sacred text', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Learn about interfaith prayers', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Pray for others intentionally', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Join a prayer group', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create a ritual around significant days', completed: false, level: 'Professional' },
          { id: 16, name: 'Teach others your prayer ritual', completed: false, level: 'Professional' },
          { id: 17, name: 'Explore prayer beads or tools', completed: false, level: 'Professional' },
          { id: 18, name: 'Compose prayers for your community', completed: false, level: 'Professional' },
          { id: 19, name: 'Lead a community blessing', completed: false, level: 'Professional' },
          { id: 20, name: 'Create a personal or family ritual book', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'nature',
        name: 'Connection with Nature',
        activities: [
          { id: 1, name: 'Spend 5 minutes outdoors in silence', completed: false, level: 'Beginner' },
          { id: 2, name: 'Walk barefoot on grass or sand', completed: false, level: 'Beginner' },
          { id: 3, name: 'Observe a sunrise or sunset', completed: false, level: 'Beginner' },
          { id: 4, name: 'Sit under a tree and journal', completed: false, level: 'Beginner' },
          { id: 5, name: 'Photograph natural beauty', completed: false, level: 'Beginner' },
          { id: 6, name: 'Start a nature observation journal', completed: false, level: 'Beginner' },
          { id: 7, name: 'Learn about local flora and fauna', completed: false, level: 'Beginner' },
          { id: 8, name: 'Take a nature hike', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Practice grounding (earthing)', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Do yoga or meditate outside', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Stargaze and reflect', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Participate in a local clean-up', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Build a small garden', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Camp in nature for a night', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Visit sacred or natural landmarks', completed: false, level: 'Professional' },
          { id: 16, name: 'Organize a nature mindfulness walk', completed: false, level: 'Professional' },
          { id: 17, name: 'Practice eco-spirituality rituals', completed: false, level: 'Professional' },
          { id: 18, name: 'Host an outdoor gratitude ceremony', completed: false, level: 'Professional' },
          { id: 19, name: 'Volunteer in conservation efforts', completed: false, level: 'Professional' },
          { id: 20, name: 'Teach nature-connected spirituality', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'purpose',
        name: 'Purpose & Meaning',
        activities: [
          { id: 1, name: 'Write your personal values', completed: false, level: 'Beginner' },
          { id: 2, name: 'Reflect on your life\'s mission', completed: false, level: 'Beginner' },
          { id: 3, name: 'List things that bring joy and purpose', completed: false, level: 'Beginner' },
          { id: 4, name: 'Journal on "what matters most"', completed: false, level: 'Beginner' },
          { id: 5, name: 'Visualize your ideal life', completed: false, level: 'Beginner' },
          { id: 6, name: 'Read books on finding meaning', completed: false, level: 'Beginner' },
          { id: 7, name: 'Set aligned life goals', completed: false, level: 'Beginner' },
          { id: 8, name: 'Explore your calling or dharma', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Discuss purpose with a mentor', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Revisit your priorities monthly', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Create a vision board', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Take a purpose-finding course', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Record purpose-based affirmations', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Align work with purpose', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Volunteer intentionally', completed: false, level: 'Professional' },
          { id: 16, name: 'Teach others to find purpose', completed: false, level: 'Professional' },
          { id: 17, name: 'Create a life map', completed: false, level: 'Professional' },
          { id: 18, name: 'Write a purpose manifesto', completed: false, level: 'Professional' },
          { id: 19, name: 'Start a purpose-driven project', completed: false, level: 'Professional' },
          { id: 20, name: 'Guide others through purpose discovery', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'gratitude',
        name: 'Gratitude Practice',
        activities: [
          { id: 1, name: 'List 3 things you\'re grateful for daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Say thank you with intention', completed: false, level: 'Beginner' },
          { id: 3, name: 'Share one gratitude moment on social media', completed: false, level: 'Beginner' },
          { id: 4, name: 'Keep a gratitude journal', completed: false, level: 'Beginner' },
          { id: 5, name: 'Write a thank-you letter', completed: false, level: 'Beginner' },
          { id: 6, name: 'Reflect on gratitude before sleeping', completed: false, level: 'Beginner' },
          { id: 7, name: 'Make a gratitude jar', completed: false, level: 'Beginner' },
          { id: 8, name: 'Express gratitude to family/friends', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Draw something you\'re grateful for', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Practice gratitude meditation', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Host a gratitude circle', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Create a monthly gratitude wall', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Celebrate someone publicly', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Record gratitude audio messages', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Share stories of thankfulness', completed: false, level: 'Professional' },
          { id: 16, name: 'Teach a gratitude practice class', completed: false, level: 'Professional' },
          { id: 17, name: 'Publish a gratitude blog series', completed: false, level: 'Professional' },
          { id: 18, name: 'Lead a community gratitude challenge', completed: false, level: 'Professional' },
          { id: 19, name: 'Study gratitude science', completed: false, level: 'Professional' },
          { id: 20, name: 'Build a gratitude-based service program', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'reflection',
        name: 'Inner Reflection & Journaling',
        activities: [
          { id: 1, name: 'Free-write for 5 minutes daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Reflect on highs and lows of the day', completed: false, level: 'Beginner' },
          { id: 3, name: 'Use a journaling prompt guide', completed: false, level: 'Beginner' },
          { id: 4, name: 'Write about your emotions', completed: false, level: 'Beginner' },
          { id: 5, name: 'Practice stream-of-consciousness writing', completed: false, level: 'Beginner' },
          { id: 6, name: 'Reflect on decisions you\'ve made', completed: false, level: 'Beginner' },
          { id: 7, name: 'Keep a "lessons learned" log', completed: false, level: 'Beginner' },
          { id: 8, name: 'Journal during emotional events', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Review old journal entries monthly', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Write your autobiography', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Share select entries with a coach or mentor', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Create art journaling pages', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Join a journaling circle', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Journal with gratitude and intention', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create a yearly reflection template', completed: false, level: 'Professional' },
          { id: 16, name: 'Publish journal excerpts or reflections', completed: false, level: 'Professional' },
          { id: 17, name: 'Start a daily digital journaling habit', completed: false, level: 'Professional' },
          { id: 18, name: 'Journal your dreams', completed: false, level: 'Professional' },
          { id: 19, name: 'Teach reflection journaling workshops', completed: false, level: 'Professional' },
          { id: 20, name: 'Build your own journal prompts toolkit', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'forgiveness',
        name: 'Forgiveness & Letting Go',
        activities: [
          { id: 1, name: 'Identify unresolved resentment', completed: false, level: 'Beginner' },
          { id: 2, name: 'Write a forgiveness letter (unsent)', completed: false, level: 'Beginner' },
          { id: 3, name: 'Reflect on a past hurt and what it taught you', completed: false, level: 'Beginner' },
          { id: 4, name: 'Practice forgiveness affirmations', completed: false, level: 'Beginner' },
          { id: 5, name: 'Use breathwork to release tension', completed: false, level: 'Beginner' },
          { id: 6, name: 'Listen to a talk on forgiveness', completed: false, level: 'Beginner' },
          { id: 7, name: 'Forgive someone mentally', completed: false, level: 'Beginner' },
          { id: 8, name: 'Seek apology or reconciliation', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Meditate on letting go', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Share your story anonymously', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Consult a therapist about deep wounds', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Practice Ho\'oponopono', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Join a support or healing circle', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Let go of one limiting belief', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create a forgiveness ritual', completed: false, level: 'Professional' },
          { id: 16, name: 'Publicly share your growth', completed: false, level: 'Professional' },
          { id: 17, name: 'Teach forgiveness workshops', completed: false, level: 'Professional' },
          { id: 18, name: 'Reframe painful stories into strengths', completed: false, level: 'Professional' },
          { id: 19, name: 'Build forgiveness challenges or apps', completed: false, level: 'Professional' },
          { id: 20, name: 'Write or speak about your journey', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'learning',
        name: 'Spiritual Learning & Reading',
        activities: [
          { id: 1, name: 'Read one spiritual quote daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Explore one spiritual text', completed: false, level: 'Beginner' },
          { id: 3, name: 'Watch a documentary on wisdom traditions', completed: false, level: 'Beginner' },
          { id: 4, name: 'Read short stories of saints or sages', completed: false, level: 'Beginner' },
          { id: 5, name: 'Subscribe to a spiritual newsletter', completed: false, level: 'Beginner' },
          { id: 6, name: 'Study one religious philosophy', completed: false, level: 'Beginner' },
          { id: 7, name: 'Learn about mindfulness or Zen', completed: false, level: 'Beginner' },
          { id: 8, name: 'Take online spiritual courses', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Discuss spiritual books in a group', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Journal your insights from readings', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Deep dive into ancient scriptures', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Compare belief systems', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Attend spiritual book clubs', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Curate your own reading list', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Read original texts with commentary', completed: false, level: 'Professional' },
          { id: 16, name: 'Annotate a sacred book', completed: false, level: 'Professional' },
          { id: 17, name: 'Teach what you learn', completed: false, level: 'Professional' },
          { id: 18, name: 'Publish spiritual reflections', completed: false, level: 'Professional' },
          { id: 19, name: 'Interview spiritual practitioners', completed: false, level: 'Professional' },
          { id: 20, name: 'Write your own spiritual book or guide', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'belief',
        name: 'Belief System Exploration',
        activities: [
          { id: 1, name: 'Reflect on what you believe', completed: false, level: 'Beginner' },
          { id: 2, name: 'Learn about your family\'s belief system', completed: false, level: 'Beginner' },
          { id: 3, name: 'Study world religions 101', completed: false, level: 'Beginner' },
          { id: 4, name: 'Visit a new place of worship', completed: false, level: 'Beginner' },
          { id: 5, name: 'Interview someone of a different belief', completed: false, level: 'Beginner' },
          { id: 6, name: 'Explore philosophy (e.g., Stoicism)', completed: false, level: 'Beginner' },
          { id: 7, name: 'Create your spiritual values chart', completed: false, level: 'Beginner' },
          { id: 8, name: 'Explore agnosticism and theism', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Discuss beliefs with respect', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Take an interfaith dialogue course', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Compare religious texts and rituals', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Reflect on your spiritual questions', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Join an interspiritual circle', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Map your belief evolution over time', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Volunteer in diverse spiritual communities', completed: false, level: 'Professional' },
          { id: 16, name: 'Speak about coexistence', completed: false, level: 'Professional' },
          { id: 17, name: 'Host spiritual dialogue sessions', completed: false, level: 'Professional' },
          { id: 18, name: 'Curate a belief exploration blog', completed: false, level: 'Professional' },
          { id: 19, name: 'Design your own belief code', completed: false, level: 'Professional' },
          { id: 20, name: 'Lead a belief diversity campaign', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'service',
        name: 'Service & Compassion',
        activities: [
          { id: 1, name: 'Smile and greet strangers', completed: false, level: 'Beginner' },
          { id: 2, name: 'Offer help to a neighbor', completed: false, level: 'Beginner' },
          { id: 3, name: 'Write a kind note to someone', completed: false, level: 'Beginner' },
          { id: 4, name: 'Pick up litter in your neighborhood', completed: false, level: 'Beginner' },
          { id: 5, name: 'Donate unused items', completed: false, level: 'Beginner' },
          { id: 6, name: 'Support a local cause', completed: false, level: 'Beginner' },
          { id: 7, name: 'Volunteer at a shelter or kitchen', completed: false, level: 'Beginner' },
          { id: 8, name: 'Offer your time to elders', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Start a "help others" challenge', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Sponsor someone\'s education or needs', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Mentor someone in need', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Share stories of kindness', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Host a compassion drive', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a random acts of kindness plan', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Join a global compassion movement', completed: false, level: 'Professional' },
          { id: 16, name: 'Teach kids about empathy', completed: false, level: 'Professional' },
          { id: 17, name: 'Organize community kindness walks', completed: false, level: 'Professional' },
          { id: 18, name: 'Launch a pay-it-forward campaign', completed: false, level: 'Professional' },
          { id: 19, name: 'Collaborate with NGOs', completed: false, level: 'Professional' },
          { id: 20, name: 'Found your own service-based initiative', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'mental',
    name: 'Mental',
    icon: AcademicCapIcon,
    progress: 60,
    subcategories: [
      {
        id: 'critical-thinking',
        name: 'Critical Thinking & Logic',
        activities: [
          { id: 1, name: 'Solve a basic puzzle or riddle', completed: true, level: 'Beginner' },
          { id: 2, name: 'Analyze both sides of a simple issue', completed: false, level: 'Beginner' },
          { id: 3, name: 'Watch a logic-based video', completed: true, level: 'Beginner' },
          // ... more activities
        ]
      },
      // ... more subcategories
    ]
  },
  // ... remaining spokes with their subcategories and activities
]

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
]

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
    title: 'Professional mentoring',
    category: 'Professional',
    description: 'Career guidance and resume review',
    karmaPoints: 150,
    status: 'Available',
  },
]

export default function Activities() {
  const [activeTab, setActiveTab] = useState('spokes')
  const [selectedSpoke, setSelectedSpoke] = useState<typeof spokes[0] | null>(spokes[0])
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(
    spokes[0]?.subcategories[0] || null
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Activities</h1>
        </div>

        {/* Horizontal Menu Bar */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="flex overflow-x-auto">
            {[
              'Help Others',
              'Spiritual',
              'Mental',
              'Physical',
              'Personal',
              'Professional',
              'Financial',
              'Social',
            ].map((item) => (
              <button
                key={item}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                  selectedSpoke?.name === item || (item === 'Help Others' && selectedSpoke === null)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => {
                  if (item === 'Help Others') {
                    setSelectedSpoke(null)
                    setSelectedSubcategory(null)
                  } else {
                    const spoke = spokes.find(s => s.name === item)
                    setSelectedSpoke(spoke || spokes[0])
                    setSelectedSubcategory(spoke?.subcategories[0] || null)
                  }
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {selectedSpoke === null ? (
          <div className="space-y-8">
            {/* Help Requests */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Help Requests</h2>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Create Request
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {helpRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium">{request.title}</h3>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {request.karmaPoints} KP
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {request.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                        {request.category}
                      </span>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Offer Help
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Offers */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Help Offers</h2>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Create Offer
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {helpOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium">{offer.title}</h3>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {offer.karmaPoints} KP
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {offer.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                        {offer.category}
                      </span>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Request Help
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Subcategories Sidebar */}
            <div className="col-span-3 bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                {selectedSpoke.subcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedSubcategory?.id === subcategory.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSubcategory(subcategory)}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities List */}
            <div className="col-span-9 bg-white rounded-lg shadow-sm p-6">
              {selectedSubcategory && (
                <>
                  <h2 className="text-2xl font-semibold mb-6">{selectedSubcategory.name}</h2>
                  <div className="space-y-6">
                    {['Beginner', 'Intermediate', 'Professional'].map((level) => (
                      <div key={level}>
                        <h3 className="text-lg font-medium mb-4">{level}</h3>
                        <div className="grid gap-4">
                          {selectedSubcategory.activities
                            .filter((activity) => activity.level === level)
                            .map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center space-x-4">
                                  <input
                                    type="checkbox"
                                    checked={activity.completed}
                                    className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    onChange={() => {
                                      // TODO: Implement activity completion logic
                                    }}
                                  />
                                  <span className="text-gray-700">{activity.name}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 