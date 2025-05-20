'use client'

import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

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
          { id: 1, name: 'Solve a basic puzzle or riddle', completed: false, level: 'Beginner' },
          { id: 2, name: 'Analyze both sides of a simple issue', completed: false, level: 'Beginner' },
          { id: 3, name: 'Watch a logic-based video', completed: false, level: 'Beginner' },
          { id: 4, name: 'Read a short article critically', completed: false, level: 'Beginner' },
          { id: 5, name: 'Learn about logical fallacies', completed: false, level: 'Beginner' },
          { id: 6, name: 'Debate a light topic with a friend', completed: false, level: 'Beginner' },
          { id: 7, name: 'Join an online logic quiz', completed: false, level: 'Beginner' },
          { id: 8, name: 'Complete a Sudoku or logic puzzle', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Analyze pros and cons of a decision', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Take a free logic or reasoning course', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Participate in structured debates', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Practice scenario planning', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Play strategic games like chess', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a decision-making matrix', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Read books on logic and reason', completed: false, level: 'Professional' },
          { id: 16, name: 'Solve daily brain teasers', completed: false, level: 'Professional' },
          { id: 17, name: 'Review historical decisions for insight', completed: false, level: 'Professional' },
          { id: 18, name: 'Build a logic-based decision tree', completed: false, level: 'Professional' },
          { id: 19, name: 'Teach critical thinking skills', completed: false, level: 'Professional' },
          { id: 20, name: 'Publish articles on reasoning', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'emotional-intelligence',
        name: 'Emotional Intelligence',
        activities: [
          { id: 1, name: 'Identify your current mood daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Name the emotions you felt each day', completed: false, level: 'Beginner' },
          { id: 3, name: 'Practice deep breathing during tension', completed: false, level: 'Beginner' },
          { id: 4, name: 'Reflect on emotional triggers', completed: false, level: 'Beginner' },
          { id: 5, name: 'Read about emotional intelligence basics', completed: false, level: 'Beginner' },
          { id: 6, name: 'Express feelings using "I" statements', completed: false, level: 'Beginner' },
          { id: 7, name: 'Watch a TED Talk on empathy', completed: false, level: 'Beginner' },
          { id: 8, name: 'Apologize sincerely when needed', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Practice perspective-taking', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Recognize emotions in others', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Journal about emotional reactions', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Join an EI improvement course', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Listen actively in conversations', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Track and manage emotional highs/lows', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Teach kids about emotions', completed: false, level: 'Professional' },
          { id: 16, name: 'Mediate peer conflicts calmly', completed: false, level: 'Professional' },
          { id: 17, name: 'Understand emotional regulation theories', completed: false, level: 'Professional' },
          { id: 18, name: 'Build your emotional vocabulary', completed: false, level: 'Professional' },
          { id: 19, name: 'Facilitate emotional support groups', completed: false, level: 'Professional' },
          { id: 20, name: 'Train others in emotional coaching', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'stress-management',
        name: 'Stress Management',
        activities: [
          { id: 1, name: 'List top 5 stressors in your life', completed: false, level: 'Beginner' },
          { id: 2, name: 'Do a 5-minute calming breath session', completed: false, level: 'Beginner' },
          { id: 3, name: 'Write in a stress journal', completed: false, level: 'Beginner' },
          { id: 4, name: 'Take short nature breaks', completed: false, level: 'Beginner' },
          { id: 5, name: 'Learn about the stress cycle', completed: false, level: 'Beginner' },
          { id: 6, name: 'Reduce screen time by 30 minutes', completed: false, level: 'Beginner' },
          { id: 7, name: 'Drink herbal tea instead of caffeine', completed: false, level: 'Beginner' },
          { id: 8, name: 'Practice progressive muscle relaxation', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Set healthy boundaries', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Use a guided stress meditation', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Follow a 7-day stress detox', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Create a personal calm-down plan', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Attend a stress management webinar', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Reduce commitments for a week', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Practice laughter therapy', completed: false, level: 'Professional' },
          { id: 16, name: 'Learn cortisol triggers and hacks', completed: false, level: 'Professional' },
          { id: 17, name: 'Do expressive writing after stress', completed: false, level: 'Professional' },
          { id: 18, name: 'Lead stress relief circles', completed: false, level: 'Professional' },
          { id: 19, name: 'Track stress levels via app', completed: false, level: 'Professional' },
          { id: 20, name: 'Build your own resilience workbook', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'positive-self-talk',
        name: 'Positive Self-Talk & Affirmations',
        activities: [
          { id: 1, name: 'Write down 3 positive affirmations', completed: false, level: 'Beginner' },
          { id: 2, name: 'Say affirmations in the mirror', completed: false, level: 'Beginner' },
          { id: 3, name: 'Replace one negative thought daily', completed: false, level: 'Beginner' },
          { id: 4, name: 'Listen to positive self-talk audio', completed: false, level: 'Beginner' },
          { id: 5, name: 'Create a daily self-talk journal', completed: false, level: 'Beginner' },
          { id: 6, name: 'Repeat affirmations before sleep', completed: false, level: 'Beginner' },
          { id: 7, name: 'Read a book on self-esteem', completed: false, level: 'Beginner' },
          { id: 8, name: 'Develop an affirmation script', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Record your own affirmations', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Practice daily gratitude & self-worth', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Join a positive mindset group', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Teach affirmations to kids', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Personalize affirmations to goals', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Pair affirmations with breathwork', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Post affirmation reminders around home', completed: false, level: 'Professional' },
          { id: 16, name: 'Use affirmation apps', completed: false, level: 'Professional' },
          { id: 17, name: 'Study cognitive behavioral therapy basics', completed: false, level: 'Professional' },
          { id: 18, name: 'Create affirmation art or posters', completed: false, level: 'Professional' },
          { id: 19, name: 'Guide others in affirmations practice', completed: false, level: 'Professional' },
          { id: 20, name: 'Create a self-talk training program', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'focus-concentration',
        name: 'Focus & Concentration',
        activities: [
          { id: 1, name: 'Eliminate one distraction for 30 mins', completed: false, level: 'Beginner' },
          { id: 2, name: 'Use a Pomodoro timer for a task', completed: false, level: 'Beginner' },
          { id: 3, name: 'Read a short article without pausing', completed: false, level: 'Beginner' },
          { id: 4, name: 'Practice single-tasking', completed: false, level: 'Beginner' },
          { id: 5, name: 'Write down 3 priority tasks', completed: false, level: 'Beginner' },
          { id: 6, name: 'Minimize app notifications', completed: false, level: 'Beginner' },
          { id: 7, name: 'Do a 5-minute candle stare drill', completed: false, level: 'Beginner' },
          { id: 8, name: 'Create a focus-friendly environment', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Complete a task list mindfully', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Listen to binaural beats', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Join a deep work challenge', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Journal on distractions', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Read books on focus (e.g., Deep Work)', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Practice meditation for focus', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Track your focus peaks and dips', completed: false, level: 'Professional' },
          { id: 16, name: 'Use the Eisenhower Matrix', completed: false, level: 'Professional' },
          { id: 17, name: 'Teach focused work principles', completed: false, level: 'Professional' },
          { id: 18, name: 'Limit multitasking over a week', completed: false, level: 'Professional' },
          { id: 19, name: 'Study attentional control research', completed: false, level: 'Professional' },
          { id: 20, name: 'Build a focus-boosting community plan', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'problem-solving',
        name: 'Problem Solving',
        activities: [
          { id: 1, name: 'Solve a brain teaser daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Identify daily problems and ideas to fix them', completed: false, level: 'Beginner' },
          { id: 3, name: 'Map out a simple challenge', completed: false, level: 'Beginner' },
          { id: 4, name: 'Apply 5 Whys to an issue', completed: false, level: 'Beginner' },
          { id: 5, name: 'Study common problem-solving models', completed: false, level: 'Beginner' },
          { id: 6, name: 'Join a problem-solving workshop', completed: false, level: 'Beginner' },
          { id: 7, name: 'Brainstorm without judgment', completed: false, level: 'Beginner' },
          { id: 8, name: 'Test one small solution', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Use mind-mapping software', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Build pros/cons lists for choices', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Evaluate solution success rates', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Collaborate on solving team issues', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Solve case studies or simulations', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create decision trees', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Learn systems thinking basics', completed: false, level: 'Professional' },
          { id: 16, name: 'Take a design thinking course', completed: false, level: 'Professional' },
          { id: 17, name: 'Prototype a solution model', completed: false, level: 'Professional' },
          { id: 18, name: 'Teach problem-solving in groups', completed: false, level: 'Professional' },
          { id: 19, name: 'Write a personal case study', completed: false, level: 'Professional' },
          { id: 20, name: 'Launch your own problem-solving blog/podcast', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'continuous-learning',
        name: 'Continuous Learning',
        activities: [
          { id: 1, name: 'Read one article daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Subscribe to a learning podcast', completed: false, level: 'Beginner' },
          { id: 3, name: 'Complete a short online course', completed: false, level: 'Beginner' },
          { id: 4, name: 'Watch an educational documentary', completed: false, level: 'Beginner' },
          { id: 5, name: 'Keep a learning journal', completed: false, level: 'Beginner' },
          { id: 6, name: 'Learn a new word each day', completed: false, level: 'Beginner' },
          { id: 7, name: 'Follow experts in your interests', completed: false, level: 'Beginner' },
          { id: 8, name: 'Schedule 30 mins for daily reading', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Learn a new hobby monthly', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Set a 30-day learning goal', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Join a lifelong learning platform', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Revisit high school or college topics', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Enroll in MOOCs (Coursera, edX, etc.)', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Present what you\'ve learned to others', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create visual notes from a lecture', completed: false, level: 'Professional' },
          { id: 16, name: 'Start a "Book a Month" challenge', completed: false, level: 'Professional' },
          { id: 17, name: 'Study spaced repetition techniques', completed: false, level: 'Professional' },
          { id: 18, name: 'Take a certification exam', completed: false, level: 'Professional' },
          { id: 19, name: 'Mentor someone in your learning', completed: false, level: 'Professional' },
          { id: 20, name: 'Design your own course', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'resilience-building',
        name: 'Resilience Building',
        activities: [
          { id: 1, name: 'Identify a past hardship and its lessons', completed: false, level: 'Beginner' },
          { id: 2, name: 'Start a "bounce-back" journal', completed: false, level: 'Beginner' },
          { id: 3, name: 'Write about failures and growth', completed: false, level: 'Beginner' },
          { id: 4, name: 'Practice gratitude after setbacks', completed: false, level: 'Beginner' },
          { id: 5, name: 'Join a peer resilience circle', completed: false, level: 'Beginner' },
          { id: 6, name: 'Learn about growth mindset', completed: false, level: 'Beginner' },
          { id: 7, name: 'Review role models who bounced back', completed: false, level: 'Beginner' },
          { id: 8, name: 'Read books on resilience', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Follow inspiring recovery stories', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Challenge yourself physically (e.g., cold shower)', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Build adversity simulations', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Teach kids about bouncing back', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Visualize overcoming adversity', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Join a coaching or therapy session', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Accept constructive criticism', completed: false, level: 'Professional' },
          { id: 16, name: 'Track recovery time from challenges', completed: false, level: 'Professional' },
          { id: 17, name: 'Speak publicly about bouncing back', completed: false, level: 'Professional' },
          { id: 18, name: 'Create resilience quotes art', completed: false, level: 'Professional' },
          { id: 19, name: 'Build a "Resilience Toolkit"', completed: false, level: 'Professional' },
          { id: 20, name: 'Start a community resilience project', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'time-management',
        name: 'Time Management & Discipline',
        activities: [
          { id: 1, name: 'Track your day in 15-minute chunks', completed: false, level: 'Beginner' },
          { id: 2, name: 'Use a calendar app for a week', completed: false, level: 'Beginner' },
          { id: 3, name: 'Set 3 clear goals daily', completed: false, level: 'Beginner' },
          { id: 4, name: 'Say "no" to one distraction', completed: false, level: 'Beginner' },
          { id: 5, name: 'Use a time-blocking schedule', completed: false, level: 'Beginner' },
          { id: 6, name: 'Follow a "Do Not Disturb" routine', completed: false, level: 'Beginner' },
          { id: 7, name: 'Set deadlines and rewards', completed: false, level: 'Beginner' },
          { id: 8, name: 'Identify your productivity peak hours', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Do weekly reviews on how you spend time', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Batch similar tasks', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Automate simple tasks', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Create a habit tracker', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Study time management techniques', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Follow the 80/20 rule', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Plan your week on Sunday', completed: false, level: 'Professional' },
          { id: 16, name: 'Learn about atomic habits', completed: false, level: 'Professional' },
          { id: 17, name: 'Avoid time leaks for 5 days', completed: false, level: 'Professional' },
          { id: 18, name: 'Run time audits monthly', completed: false, level: 'Professional' },
          { id: 19, name: 'Teach time management to others', completed: false, level: 'Professional' },
          { id: 20, name: 'Publish a discipline-building guide', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'mental-health',
        name: 'Mental Health Awareness',
        activities: [
          { id: 1, name: 'Learn signs of stress and anxiety', completed: false, level: 'Beginner' },
          { id: 2, name: 'Practice self-compassion daily', completed: false, level: 'Beginner' },
          { id: 3, name: 'Track your mood for a week', completed: false, level: 'Beginner' },
          { id: 4, name: 'Follow mental health creators online', completed: false, level: 'Beginner' },
          { id: 5, name: 'Join an awareness webinar', completed: false, level: 'Beginner' },
          { id: 6, name: 'Read about anxiety, depression, burnout', completed: false, level: 'Beginner' },
          { id: 7, name: 'Reduce stigma by talking openly', completed: false, level: 'Beginner' },
          { id: 8, name: 'Use affirmations for mental wellness', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Volunteer for mental health causes', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Maintain a mental health journal', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Share stories of healing', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Support someone seeking therapy', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Attend a support group', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Participate in mental health campaigns', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Learn about trauma healing', completed: false, level: 'Professional' },
          { id: 16, name: 'Practice mental health first aid', completed: false, level: 'Professional' },
          { id: 17, name: 'Promote mental health at work', completed: false, level: 'Professional' },
          { id: 18, name: 'Take a certified MH course', completed: false, level: 'Professional' },
          { id: 19, name: 'Mentor youth on awareness', completed: false, level: 'Professional' },
          { id: 20, name: 'Launch your own awareness campaign', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'physical',
    name: 'Physical',
    icon: HeartIcon,
    progress: 60,
    subcategories: [
      {
        id: 'exercise-movement',
        name: 'Exercise & Movement',
        activities: [
          { id: 1, name: 'Stretch for 5 minutes after waking up', completed: false, level: 'Beginner' },
          { id: 2, name: 'Walk for 10 minutes', completed: false, level: 'Beginner' },
          { id: 3, name: 'Do 10 bodyweight squats', completed: false, level: 'Beginner' },
          { id: 4, name: 'Follow a 15-minute home workout video', completed: false, level: 'Beginner' },
          { id: 5, name: 'Walk 5,000 steps in a day', completed: false, level: 'Beginner' },
          { id: 6, name: 'Do 15 push-ups and 20 sit-ups', completed: false, level: 'Beginner' },
          { id: 7, name: 'Try basic yoga poses', completed: false, level: 'Beginner' },
          { id: 8, name: 'Attend a group fitness class', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Complete a 30-minute cardio session', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Try interval training (HIIT)', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Do a 5km jog or walk', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Learn proper warm-up and cool-down routines', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Follow a structured beginner workout program', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Incorporate resistance bands', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Join a local gym or online fitness program', completed: false, level: 'Professional' },
          { id: 16, name: 'Perform bodyweight circuits', completed: false, level: 'Professional' },
          { id: 17, name: 'Learn compound lifts (deadlift, squat, bench press)', completed: false, level: 'Professional' },
          { id: 18, name: 'Track personal records (PRs)', completed: false, level: 'Professional' },
          { id: 19, name: 'Compete in a local fitness challenge', completed: false, level: 'Professional' },
          { id: 20, name: 'Become a certified personal trainer or fitness coach', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'nutrition',
        name: 'Nutrition & Healthy Eating',
        activities: [
          { id: 1, name: 'Drink 6–8 glasses of water daily', completed: false, level: 'Beginner' },
          { id: 2, name: 'Replace one sugary snack with a fruit', completed: false, level: 'Beginner' },
          { id: 3, name: 'Eat a home-cooked meal', completed: false, level: 'Beginner' },
          { id: 4, name: 'Track one day of eating in a journal', completed: false, level: 'Beginner' },
          { id: 5, name: 'Eat a balanced breakfast for a week', completed: false, level: 'Beginner' },
          { id: 6, name: 'Avoid fast food for a week', completed: false, level: 'Beginner' },
          { id: 7, name: 'Try a new vegetable', completed: false, level: 'Beginner' },
          { id: 8, name: 'Read a nutrition label', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Prepare a healthy meal with proteins, carbs, and fats', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Reduce processed food intake for a week', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Plan your meals for three days', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Avoid sugary drinks for one week', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Calculate your daily caloric needs', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Follow a 7-day meal prep plan', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Study macronutrients and micronutrients', completed: false, level: 'Professional' },
          { id: 16, name: 'Balance your plate using the MyPlate method', completed: false, level: 'Professional' },
          { id: 17, name: 'Cook from a nutrition-focused recipe book', completed: false, level: 'Professional' },
          { id: 18, name: 'Meet with a dietitian', completed: false, level: 'Professional' },
          { id: 19, name: 'Track your macros using an app', completed: false, level: 'Professional' },
          { id: 20, name: 'Build a personalized nutrition strategy', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'sleep-hygiene',
        name: 'Sleep Hygiene',
        activities: [
          { id: 1, name: 'Go to bed at the same time for 3 days', completed: false, level: 'Beginner' },
          { id: 2, name: 'Wake up without an alarm on weekends', completed: false, level: 'Beginner' },
          { id: 3, name: 'Avoid screens 30 minutes before bed', completed: false, level: 'Beginner' },
          { id: 4, name: 'Use a sleep tracking app', completed: false, level: 'Beginner' },
          { id: 5, name: 'Create a wind-down routine (e.g., journaling, stretching)', completed: false, level: 'Beginner' },
          { id: 6, name: 'Limit caffeine after noon', completed: false, level: 'Beginner' },
          { id: 7, name: 'Maintain a dark, cool sleeping environment', completed: false, level: 'Beginner' },
          { id: 8, name: 'Reduce noise using white noise or earplugs', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Sleep 7+ hours for one week', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Avoid large meals before bedtime', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Read before bed instead of watching TV', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Remove electronic devices from the bedroom', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Take a warm shower before sleeping', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Limit naps to 20 minutes', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Track sleep trends weekly', completed: false, level: 'Professional' },
          { id: 16, name: 'Follow a 21-day sleep improvement challenge', completed: false, level: 'Professional' },
          { id: 17, name: 'Study the stages of sleep', completed: false, level: 'Professional' },
          { id: 18, name: 'Understand circadian rhythm cycles', completed: false, level: 'Professional' },
          { id: 19, name: 'Consult a sleep specialist if needed', completed: false, level: 'Professional' },
          { id: 20, name: 'Maintain consistent sleep patterns year-round', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'hydration',
        name: 'Hydration',
        activities: [
          { id: 1, name: 'Drink one full glass of water upon waking', completed: false, level: 'Beginner' },
          { id: 2, name: 'Carry a reusable water bottle', completed: false, level: 'Beginner' },
          { id: 3, name: 'Drink a glass of water before each meal', completed: false, level: 'Beginner' },
          { id: 4, name: 'Track water intake with an app', completed: false, level: 'Beginner' },
          { id: 5, name: 'Set a daily water goal (e.g., 2 liters)', completed: false, level: 'Beginner' },
          { id: 6, name: 'Add natural flavor (lemon, cucumber) to water', completed: false, level: 'Beginner' },
          { id: 7, name: 'Replace one soda per day with water', completed: false, level: 'Beginner' },
          { id: 8, name: 'Use a hydration reminder app', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Drink 8+ glasses of water consistently for a week', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Avoid alcohol for three consecutive days', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Observe effects of hydration on energy levels', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Educate yourself on dehydration symptoms', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Balance electrolytes with food and hydration', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Learn about water intake and physical activity', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Monitor urine color for hydration indicators', completed: false, level: 'Professional' },
          { id: 16, name: 'Hydrate during workouts', completed: false, level: 'Professional' },
          { id: 17, name: 'Compare water needs in different climates', completed: false, level: 'Professional' },
          { id: 18, name: 'Track water intake for a month', completed: false, level: 'Professional' },
          { id: 19, name: 'Understand hydration in athletic performance', completed: false, level: 'Professional' },
          { id: 20, name: 'Educate others on hydration best practices', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'preventive-health',
        name: 'Preventive Health Checkups',
        activities: [
          { id: 1, name: 'Schedule a routine dental check-up', completed: false, level: 'Beginner' },
          { id: 2, name: 'Get a general physical exam', completed: false, level: 'Beginner' },
          { id: 3, name: 'Check blood pressure at a pharmacy', completed: false, level: 'Beginner' },
          { id: 4, name: 'Research age-appropriate health screenings', completed: false, level: 'Beginner' },
          { id: 5, name: 'Visit an eye doctor for a vision check', completed: false, level: 'Beginner' },
          { id: 6, name: 'Track your BMI and understand the result', completed: false, level: 'Beginner' },
          { id: 7, name: 'Schedule an annual health exam', completed: false, level: 'Beginner' },
          { id: 8, name: 'Discuss family medical history with your doctor', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Perform monthly self-checks (breast/testicular)', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Maintain vaccination records', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Get a cholesterol test', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Track blood sugar once', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Keep a health journal', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Understand results from a blood panel', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Visit a specialist (e.g., dermatologist)', completed: false, level: 'Professional' },
          { id: 16, name: 'Ask about early cancer screenings', completed: false, level: 'Professional' },
          { id: 17, name: 'Educate yourself on insurance coverage for checkups', completed: false, level: 'Professional' },
          { id: 18, name: 'Compare your current vitals to past records', completed: false, level: 'Professional' },
          { id: 19, name: 'Set a yearly preventive health calendar', completed: false, level: 'Professional' },
          { id: 20, name: 'Organize a health screening camp in your community', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'posture-ergonomics',
        name: 'Posture & Ergonomics',
        activities: [
          { id: 1, name: 'Check your sitting posture at work', completed: false, level: 'Beginner' },
          { id: 2, name: 'Adjust screen height to eye level', completed: false, level: 'Beginner' },
          { id: 3, name: 'Use a lumbar support pillow', completed: false, level: 'Beginner' },
          { id: 4, name: 'Practice standing every 30 minutes', completed: false, level: 'Beginner' },
          { id: 5, name: 'Try seated core exercises', completed: false, level: 'Beginner' },
          { id: 6, name: 'Watch a posture correction video', completed: false, level: 'Beginner' },
          { id: 7, name: 'Adjust your chair for back support', completed: false, level: 'Beginner' },
          { id: 8, name: 'Use an anti-fatigue mat when standing', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Practice wall posture drills', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Do neck stretches daily', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Use a standing desk for 1 hour', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Perform shoulder blade pinches', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Assess posture with a mirror check', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Set daily ergonomic reminders', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create a posture improvement plan', completed: false, level: 'Professional' },
          { id: 16, name: 'Attend a workplace ergonomics workshop', completed: false, level: 'Professional' },
          { id: 17, name: 'Learn about workstation design', completed: false, level: 'Professional' },
          { id: 18, name: 'Do foam rolling for spine health', completed: false, level: 'Professional' },
          { id: 19, name: 'Use ergonomic accessories (mouse, keyboard)', completed: false, level: 'Professional' },
          { id: 20, name: 'Build an ergonomic workstation setup', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'strength-flexibility',
        name: 'Strength & Flexibility',
        activities: [
          { id: 1, name: 'Perform static stretching after a walk', completed: false, level: 'Beginner' },
          { id: 2, name: 'Learn dynamic stretches', completed: false, level: 'Beginner' },
          { id: 3, name: 'Hold a basic plank for 15 seconds', completed: false, level: 'Beginner' },
          { id: 4, name: 'Try a yoga stretch session on YouTube', completed: false, level: 'Beginner' },
          { id: 5, name: 'Increase push-up count over 7 days', completed: false, level: 'Beginner' },
          { id: 6, name: 'Perform resistance band exercises', completed: false, level: 'Beginner' },
          { id: 7, name: 'Use light dumbbells for curls and presses', completed: false, level: 'Beginner' },
          { id: 8, name: 'Try bodyweight lunges', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Hold a 1-minute plank', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Stretch hamstrings and shoulders daily', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Follow a flexibility challenge (e.g., 14 days)', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Improve full-body mobility through mobility drills', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Perform compound strength exercises weekly', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Increase squat and deadlift weights', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Learn gymnastic movements (pull-up, handstand)', completed: false, level: 'Professional' },
          { id: 16, name: 'Follow a hypertrophy program', completed: false, level: 'Professional' },
          { id: 17, name: 'Integrate powerlifting techniques', completed: false, level: 'Professional' },
          { id: 18, name: 'Track flexibility improvements with measurements', completed: false, level: 'Professional' },
          { id: 19, name: 'Teach strength/flexibility classes', completed: false, level: 'Professional' },
          { id: 20, name: 'Train others professionally', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'breathing-practices',
        name: 'Breathing Practices',
        activities: [
          { id: 1, name: 'Practice deep belly breathing', completed: false, level: 'Beginner' },
          { id: 2, name: 'Do a 4-7-8 breathing cycle', completed: false, level: 'Beginner' },
          { id: 3, name: 'Watch a breathing technique video', completed: false, level: 'Beginner' },
          { id: 4, name: 'Do breathwork before bed', completed: false, level: 'Beginner' },
          { id: 5, name: 'Learn alternate nostril breathing (Nadi Shodhana)', completed: false, level: 'Beginner' },
          { id: 6, name: 'Practice morning energizing breath routines', completed: false, level: 'Beginner' },
          { id: 7, name: 'Use breathing to manage anxiety', completed: false, level: 'Beginner' },
          { id: 8, name: 'Combine breathing with guided meditation', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Track breath holding capacity', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Attend a breathwork workshop', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Learn Wim Hof breathing method', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Sync breathing with exercise', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Log breath rate changes during rest vs activity', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Learn to regulate breath during cardio', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Integrate breathwork into yoga practice', completed: false, level: 'Professional' },
          { id: 16, name: 'Monitor breath awareness throughout the day', completed: false, level: 'Professional' },
          { id: 17, name: 'Understand oxygen-CO2 balance', completed: false, level: 'Professional' },
          { id: 18, name: 'Study breath science and its effects on the nervous system', completed: false, level: 'Professional' },
          { id: 19, name: 'Guide others in group breathing sessions', completed: false, level: 'Professional' },
          { id: 20, name: 'Certify as a breath coach', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'body-weight-management',
        name: 'Body Weight Management',
        activities: [
          { id: 1, name: 'Record your current weight', completed: false, level: 'Beginner' },
          { id: 2, name: 'Set a realistic goal weight', completed: false, level: 'Beginner' },
          { id: 3, name: 'Take body measurements (waist, hips)', completed: false, level: 'Beginner' },
          { id: 4, name: 'Track calories for a week', completed: false, level: 'Beginner' },
          { id: 5, name: 'Avoid late-night snacking', completed: false, level: 'Beginner' },
          { id: 6, name: 'Reduce portion sizes', completed: false, level: 'Beginner' },
          { id: 7, name: 'Take stairs instead of elevators', completed: false, level: 'Beginner' },
          { id: 8, name: 'Practice mindful eating', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Walk daily after meals', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Replace sugary drinks with water', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Increase fiber intake', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Measure progress biweekly', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Join a group weight loss challenge', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Follow a balanced meal plan', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Work with a personal trainer', completed: false, level: 'Professional' },
          { id: 16, name: 'Address emotional eating patterns', completed: false, level: 'Professional' },
          { id: 17, name: 'Combine cardio + resistance workouts', completed: false, level: 'Professional' },
          { id: 18, name: 'Monitor body fat % (bioelectrical impedance)', completed: false, level: 'Professional' },
          { id: 19, name: 'Maintain a healthy weight for 6+ months', completed: false, level: 'Professional' },
          { id: 20, name: 'Mentor others on sustainable body management', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'physical-recreation',
        name: 'Physical Recreation',
        activities: [
          { id: 1, name: 'Take a nature walk', completed: false, level: 'Beginner' },
          { id: 2, name: 'Go for a bicycle ride', completed: false, level: 'Beginner' },
          { id: 3, name: 'Play a casual sport with friends (e.g., badminton)', completed: false, level: 'Beginner' },
          { id: 4, name: 'Try jump rope for 5 minutes', completed: false, level: 'Beginner' },
          { id: 5, name: 'Join a dance class', completed: false, level: 'Beginner' },
          { id: 6, name: 'Do a weekend hike', completed: false, level: 'Beginner' },
          { id: 7, name: 'Try indoor rock climbing', completed: false, level: 'Beginner' },
          { id: 8, name: 'Take a martial arts or boxing intro class', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Attend a fitness bootcamp', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Join a recreational sports league', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Participate in a charity run', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Train for a 5K or 10K', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Learn kayaking or paddleboarding', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Take parkour or obstacle training', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Play competitive team sports', completed: false, level: 'Professional' },
          { id: 16, name: 'Train in advanced dance or gymnastics', completed: false, level: 'Professional' },
          { id: 17, name: 'Enter a recreational competition', completed: false, level: 'Professional' },
          { id: 18, name: 'Plan a fitness vacation or retreat', completed: false, level: 'Professional' },
          { id: 19, name: 'Host a community sports event', completed: false, level: 'Professional' },
          { id: 20, name: 'Lead a local fitness group or camp', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: UserCircleIcon,
    progress: 60,
    subcategories: [
      {
        id: 'family-bonding',
        name: 'Family Bonding',
        activities: [
          { id: 1, name: 'Call a family member just to talk', completed: false, level: 'Beginner' },
          { id: 2, name: 'Share a meal with family', completed: false, level: 'Beginner' },
          { id: 3, name: 'Ask about a family story', completed: false, level: 'Beginner' },
          { id: 4, name: 'Write a note of appreciation', completed: false, level: 'Beginner' },
          { id: 5, name: 'Watch a family movie together', completed: false, level: 'Beginner' },
          { id: 6, name: 'Schedule weekly family time', completed: false, level: 'Beginner' },
          { id: 7, name: 'Create a family group chat', completed: false, level: 'Beginner' },
          { id: 8, name: 'Take a family photo', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Plan a small family outing', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Cook a meal with a family member', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Start a shared hobby or game', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Host a family gratitude circle', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Organize a mini family reunion', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a family vision board', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Learn your family tree', completed: false, level: 'Professional' },
          { id: 16, name: 'Plan a surprise for a relative', completed: false, level: 'Professional' },
          { id: 17, name: 'Have a tech-free family day', completed: false, level: 'Professional' },
          { id: 18, name: 'Address a long-standing issue with empathy', completed: false, level: 'Professional' },
          { id: 19, name: 'Write a family newsletter', completed: false, level: 'Professional' },
          { id: 20, name: 'Facilitate a family traditions revival', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'romantic-relationships',
        name: 'Romantic Relationships',
        activities: [
          { id: 1, name: 'Send a thoughtful message or compliment', completed: false, level: 'Beginner' },
          { id: 2, name: 'Have a no-device dinner', completed: false, level: 'Beginner' },
          { id: 3, name: 'Express appreciation daily', completed: false, level: 'Beginner' },
          { id: 4, name: 'Go on a walk together', completed: false, level: 'Beginner' },
          { id: 5, name: 'Share your love languages', completed: false, level: 'Beginner' },
          { id: 6, name: 'Write a handwritten note', completed: false, level: 'Beginner' },
          { id: 7, name: 'Plan a simple surprise date', completed: false, level: 'Beginner' },
          { id: 8, name: 'Share a personal story', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Do a relationship check-in', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Explore a new hobby as a couple', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Cook or build something together', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Read a relationship book', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Set shared relationship goals', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Resolve a conflict calmly', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Try couple meditation', completed: false, level: 'Professional' },
          { id: 16, name: 'Attend a relationship workshop', completed: false, level: 'Professional' },
          { id: 17, name: 'Volunteer together', completed: false, level: 'Professional' },
          { id: 18, name: 'Celebrate milestones creatively', completed: false, level: 'Professional' },
          { id: 19, name: 'Create a shared vision board', completed: false, level: 'Professional' },
          { id: 20, name: 'Mentor younger couples together', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'parenting-childcare',
        name: 'Parenting & Childcare',
        activities: [
          { id: 1, name: 'Spend 10 uninterrupted minutes playing', completed: false, level: 'Beginner' },
          { id: 2, name: 'Read a story to your child', completed: false, level: 'Beginner' },
          { id: 3, name: 'Learn about their favorite interests', completed: false, level: 'Beginner' },
          { id: 4, name: 'Create a daily routine chart', completed: false, level: 'Beginner' },
          { id: 5, name: 'Pack a lunch with a loving note', completed: false, level: 'Beginner' },
          { id: 6, name: 'Use positive reinforcement', completed: false, level: 'Beginner' },
          { id: 7, name: 'Introduce a gratitude ritual', completed: false, level: 'Beginner' },
          { id: 8, name: 'Teach them one life skill', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Take them on a one-on-one outing', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Limit screen time together', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Journal your parenting wins and challenges', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Attend a parenting seminar or webinar', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Involve them in family decisions', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Encourage curiosity and questions', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Establish healthy boundaries', completed: false, level: 'Professional' },
          { id: 16, name: 'Share childhood stories with them', completed: false, level: 'Professional' },
          { id: 17, name: 'Teach emotional expression', completed: false, level: 'Professional' },
          { id: 18, name: 'Practice conscious/intentional parenting', completed: false, level: 'Professional' },
          { id: 19, name: 'Create a legacy scrapbook together', completed: false, level: 'Professional' },
          { id: 20, name: 'Mentor other parents', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: BriefcaseIcon,
    progress: 0,
    subcategories: [
      {
        id: 'career-development',
        name: 'Career Development',
        activities: [
          { id: 1, name: 'Update your resume', completed: false, level: 'Beginner' },
          { id: 2, name: 'Set SMART career goals', completed: false, level: 'Beginner' },
          { id: 3, name: 'Join a professional network', completed: false, level: 'Beginner' },
          { id: 4, name: 'Create a LinkedIn profile', completed: false, level: 'Beginner' },
          { id: 5, name: 'Research industry trends', completed: false, level: 'Beginner' },
          { id: 6, name: 'Attend a career workshop', completed: false, level: 'Beginner' },
          { id: 7, name: 'Find a career mentor', completed: false, level: 'Beginner' },
          { id: 8, name: 'Take an online course in your field', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Get a professional certification', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Present at a work meeting', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Lead a project team', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Write industry articles', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Develop a side project', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a career development plan', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Speak at a conference', completed: false, level: 'Professional' },
          { id: 16, name: 'Start a mentoring program', completed: false, level: 'Professional' },
          { id: 17, name: 'Build a personal brand', completed: false, level: 'Professional' },
          { id: 18, name: 'Write a book or whitepaper', completed: false, level: 'Professional' },
          { id: 19, name: 'Create an online course', completed: false, level: 'Professional' },
          { id: 20, name: 'Start a consulting practice', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'leadership-skills',
        name: 'Leadership Skills',
        activities: [
          { id: 1, name: 'Read leadership books', completed: false, level: 'Beginner' },
          { id: 2, name: 'Practice active listening', completed: false, level: 'Beginner' },
          { id: 3, name: 'Give constructive feedback', completed: false, level: 'Beginner' },
          { id: 4, name: 'Learn delegation skills', completed: false, level: 'Beginner' },
          { id: 5, name: 'Study different leadership styles', completed: false, level: 'Beginner' },
          { id: 6, name: 'Take initiative in meetings', completed: false, level: 'Beginner' },
          { id: 7, name: 'Volunteer to lead small tasks', completed: false, level: 'Beginner' },
          { id: 8, name: 'Develop conflict resolution skills', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Create team building activities', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Practice public speaking', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Mentor junior colleagues', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Lead cross-functional projects', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Develop strategic thinking', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Build high-performing teams', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Lead organizational change', completed: false, level: 'Professional' },
          { id: 16, name: 'Create leadership workshops', completed: false, level: 'Professional' },
          { id: 17, name: 'Develop executive presence', completed: false, level: 'Professional' },
          { id: 18, name: 'Coach other leaders', completed: false, level: 'Professional' },
          { id: 19, name: 'Build strategic partnerships', completed: false, level: 'Professional' },
          { id: 20, name: 'Lead company initiatives', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'business-acumen',
        name: 'Business Acumen',
        activities: [
          { id: 1, name: 'Learn basic business terms', completed: false, level: 'Beginner' },
          { id: 2, name: 'Study company financials', completed: false, level: 'Beginner' },
          { id: 3, name: 'Understand market analysis', completed: false, level: 'Beginner' },
          { id: 4, name: 'Research competitors', completed: false, level: 'Beginner' },
          { id: 5, name: 'Learn about business models', completed: false, level: 'Beginner' },
          { id: 6, name: 'Study industry metrics', completed: false, level: 'Beginner' },
          { id: 7, name: 'Take business courses', completed: false, level: 'Beginner' },
          { id: 8, name: 'Analyze business cases', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Create business proposals', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Develop pricing strategies', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Study market trends', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Learn project management', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Understand risk management', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create business plans', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Lead business strategy', completed: false, level: 'Professional' },
          { id: 16, name: 'Develop new business models', completed: false, level: 'Professional' },
          { id: 17, name: 'Create growth strategies', completed: false, level: 'Professional' },
          { id: 18, name: 'Lead market expansion', completed: false, level: 'Professional' },
          { id: 19, name: 'Drive innovation initiatives', completed: false, level: 'Professional' },
          { id: 20, name: 'Build strategic alliances', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'innovation-creativity',
        name: 'Innovation & Creativity',
        activities: [
          { id: 1, name: 'Practice brainstorming', completed: false, level: 'Beginner' },
          { id: 2, name: 'Learn design thinking', completed: false, level: 'Beginner' },
          { id: 3, name: 'Study innovation methods', completed: false, level: 'Beginner' },
          { id: 4, name: 'Keep an idea journal', completed: false, level: 'Beginner' },
          { id: 5, name: 'Try mind mapping', completed: false, level: 'Beginner' },
          { id: 6, name: 'Explore creative tools', completed: false, level: 'Beginner' },
          { id: 7, name: 'Join innovation groups', completed: false, level: 'Beginner' },
          { id: 8, name: 'Lead ideation sessions', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Prototype new ideas', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Solve complex problems', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Create innovative solutions', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Develop new processes', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Lead innovation projects', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Build creative teams', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Drive organizational innovation', completed: false, level: 'Professional' },
          { id: 16, name: 'Create innovation programs', completed: false, level: 'Professional' },
          { id: 17, name: 'Lead R&D initiatives', completed: false, level: 'Professional' },
          { id: 18, name: 'Develop patents', completed: false, level: 'Professional' },
          { id: 19, name: 'Build innovation culture', completed: false, level: 'Professional' },
          { id: 20, name: 'Lead digital transformation', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'networking',
        name: 'Professional Networking',
        activities: [
          { id: 1, name: 'Join professional groups', completed: false, level: 'Beginner' },
          { id: 2, name: 'Attend industry events', completed: false, level: 'Beginner' },
          { id: 3, name: 'Create networking goals', completed: false, level: 'Beginner' },
          { id: 4, name: 'Practice elevator pitch', completed: false, level: 'Beginner' },
          { id: 5, name: 'Connect with colleagues', completed: false, level: 'Beginner' },
          { id: 6, name: 'Use networking platforms', completed: false, level: 'Beginner' },
          { id: 7, name: 'Follow industry leaders', completed: false, level: 'Beginner' },
          { id: 8, name: 'Organize networking events', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Build strategic relationships', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Join professional boards', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Speak at industry events', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Create content networks', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Build online presence', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Lead industry groups', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Create industry partnerships', completed: false, level: 'Professional' },
          { id: 16, name: 'Build global networks', completed: false, level: 'Professional' },
          { id: 17, name: 'Develop thought leadership', completed: false, level: 'Professional' },
          { id: 18, name: 'Create networking platforms', completed: false, level: 'Professional' },
          { id: 19, name: 'Lead industry associations', completed: false, level: 'Professional' },
          { id: 20, name: 'Build business ecosystems', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: CurrencyDollarIcon,
    progress: 40,
    subcategories: [
      {
        id: 'budgeting',
        name: 'Budgeting & Expense Tracking',
        activities: [
          { id: 1, name: 'List monthly income and expenses', completed: false, level: 'Beginner' },
          { id: 2, name: 'Track daily spending for a week', completed: false, level: 'Beginner' },
          { id: 3, name: 'Categorize your expenses (needs vs. wants)', completed: false, level: 'Beginner' },
          { id: 4, name: 'Use a basic spreadsheet for budgeting', completed: false, level: 'Beginner' },
          { id: 5, name: 'Create a monthly budget plan', completed: false, level: 'Beginner' },
          { id: 6, name: 'Identify one area to cut spending', completed: false, level: 'Beginner' },
          { id: 7, name: 'Track all subscriptions and memberships', completed: false, level: 'Beginner' },
          { id: 8, name: 'Set a weekly grocery budget', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Install and explore a budgeting app', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Evaluate your spending patterns', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Practice envelope budgeting for cash', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Join a 30-day no-spend challenge', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Review and revise your budget monthly', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Use percentage-based budgeting (50/30/20 rule)', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Automate bills and savings', completed: false, level: 'Professional' },
          { id: 16, name: 'Compare budget vs. actuals', completed: false, level: 'Professional' },
          { id: 17, name: 'Plan for irregular expenses', completed: false, level: 'Professional' },
          { id: 18, name: 'Track ROI on large purchases', completed: false, level: 'Professional' },
          { id: 19, name: 'Present your budget strategy to a group', completed: false, level: 'Professional' },
          { id: 20, name: 'Build a personal finance budget planner', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'saving',
        name: 'Saving Habits',
        activities: [
          { id: 1, name: 'Save a small amount weekly ($1–$5)', completed: false, level: 'Beginner' },
          { id: 2, name: 'Open a savings account', completed: false, level: 'Beginner' },
          { id: 3, name: 'Set a savings goal (e.g., $100 in 1 month)', completed: false, level: 'Beginner' },
          { id: 4, name: 'Skip one purchase and save instead', completed: false, level: 'Beginner' },
          { id: 5, name: 'Track savings in a journal or app', completed: false, level: 'Beginner' },
          { id: 6, name: 'Learn about emergency funds', completed: false, level: 'Beginner' },
          { id: 7, name: 'Automate recurring transfers to savings', completed: false, level: 'Beginner' },
          { id: 8, name: 'Create a visual savings tracker', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Save 10% of all income for one month', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Join a savings challenge (e.g., 52-week)', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Research high-interest savings options', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Create a multi-goal savings plan', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Build a 1-month expense reserve', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Open a high-yield savings account', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Save for a specific purchase or trip', completed: false, level: 'Professional' },
          { id: 16, name: 'Build a 3-month emergency fund', completed: false, level: 'Professional' },
          { id: 17, name: 'Teach saving habits to others', completed: false, level: 'Professional' },
          { id: 18, name: 'Compare savings products from banks', completed: false, level: 'Professional' },
          { id: 19, name: 'Share a savings success story', completed: false, level: 'Professional' },
          { id: 20, name: 'Reach 6–12 months in emergency reserves', completed: false, level: 'Professional' }
        ]
      },
      {
        id: 'debt',
        name: 'Debt Management',
        activities: [
          { id: 1, name: 'List all current debts', completed: false, level: 'Beginner' },
          { id: 2, name: 'Identify interest rates and due dates', completed: false, level: 'Beginner' },
          { id: 3, name: 'Pay more than the minimum on one debt', completed: false, level: 'Beginner' },
          { id: 4, name: 'Read about snowball vs. avalanche methods', completed: false, level: 'Beginner' },
          { id: 5, name: 'Make one extra payment this month', completed: false, level: 'Beginner' },
          { id: 6, name: 'Negotiate a lower rate or deferment', completed: false, level: 'Beginner' },
          { id: 7, name: 'Track monthly debt payments', completed: false, level: 'Beginner' },
          { id: 8, name: 'Consolidate small debts', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Cancel unused credit lines', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Avoid new debt for 30 days', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Use a debt payoff calculator', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Automate debt payments', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Build a debt-free payoff timeline', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Find an accountability partner', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Attend a debt management workshop', completed: false, level: 'Professional' },
          { id: 16, name: 'Join a debt-free community', completed: false, level: 'Professional' },
          { id: 17, name: 'Write about your debt-free journey', completed: false, level: 'Professional' },
          { id: 18, name: 'Help a friend organize their debt', completed: false, level: 'Professional' },
          { id: 19, name: 'Celebrate each payoff milestone', completed: false, level: 'Professional' },
          { id: 20, name: 'Become 100% debt-free', completed: false, level: 'Professional' }
        ]
      }
    ]
  },
  {
    id: 'social',
    name: 'Social',
    icon: UsersIcon,
    progress: 65,
    subcategories: [
      {
        id: 'relationships',
        name: 'Relationships & Community',
        activities: [
          { id: 1, name: 'Call a friend or family member', completed: false, level: 'Beginner' },
          { id: 2, name: 'Join a social group', completed: false, level: 'Beginner' },
          { id: 3, name: 'Practice active listening', completed: false, level: 'Beginner' },
          { id: 4, name: 'Attend a community event', completed: false, level: 'Beginner' },
          { id: 5, name: 'Volunteer for a cause', completed: false, level: 'Beginner' },
          { id: 6, name: 'Practice gratitude in relationships', completed: false, level: 'Beginner' },
          { id: 7, name: 'Set healthy boundaries', completed: false, level: 'Beginner' },
          { id: 8, name: 'Develop communication skills', completed: false, level: 'Intermediate' },
          { id: 9, name: 'Join a support group', completed: false, level: 'Intermediate' },
          { id: 10, name: 'Practice conflict resolution', completed: false, level: 'Intermediate' },
          { id: 11, name: 'Build a professional network', completed: false, level: 'Intermediate' },
          { id: 12, name: 'Learn about different cultures', completed: false, level: 'Intermediate' },
          { id: 13, name: 'Develop empathy skills', completed: false, level: 'Intermediate' },
          { id: 14, name: 'Create a social support plan', completed: false, level: 'Intermediate' },
          { id: 15, name: 'Become a community leader', completed: false, level: 'Professional' },
          { id: 16, name: 'Start a social initiative', completed: false, level: 'Professional' },
          { id: 17, name: 'Lead social workshops', completed: false, level: 'Professional' },
          { id: 18, name: 'Create community programs', completed: false, level: 'Professional' },
          { id: 19, name: 'Develop social skills curriculum', completed: false, level: 'Professional' },
          { id: 20, name: 'Build a social enterprise', completed: false, level: 'Professional' }
        ]
      }
    ]
  }
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

export default function ActivitiesPage() {
  const [activeTab, setActiveTab] = useState('explore') // 'explore' or 'activities'
  const [selectedSpoke, setSelectedSpoke] = useState<Spoke | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [activities, setActivities] = useState<Spoke[]>(spokes)
  const [showHelpSupport, setShowHelpSupport] = useState(false)
  const [showHelpRequests, setShowHelpRequests] = useState(false)
  const [showHelpOffers, setShowHelpOffers] = useState(false)

  const handleSpokeClick = (spoke: Spoke) => {
    setSelectedSpoke(spoke)
    setSelectedSubcategory(null)
    setShowHelpSupport(false)
    setShowHelpRequests(false)
    setShowHelpOffers(false)
  }

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory)
    setShowHelpSupport(false)
    setShowHelpRequests(false)
    setShowHelpOffers(false)
  }

  const handleHelpSupportClick = () => {
    setShowHelpSupport(true)
    setShowHelpRequests(false)
    setShowHelpOffers(false)
    setSelectedSpoke(null)
    setSelectedSubcategory(null)
  }

  const handleHelpRequestsClick = () => {
    setShowHelpRequests(true)
    setShowHelpOffers(false)
    setShowHelpSupport(false)
    setSelectedSpoke(null)
    setSelectedSubcategory(null)
  }

  const handleHelpOffersClick = () => {
    setShowHelpOffers(true)
    setShowHelpRequests(false)
    setShowHelpSupport(false)
    setSelectedSpoke(null)
    setSelectedSubcategory(null)
  }

  const handleActivityClick = (activity: Activity) => {
    if (!selectedSpoke || !selectedSubcategory) return

    const updatedActivities = activities.map(spoke => {
      if (spoke.id === selectedSpoke.id) {
        const updatedSubcategories = spoke.subcategories.map(subcat => {
          if (subcat.id === selectedSubcategory.id) {
            const updatedActivities = subcat.activities.map(act => 
              act.id === activity.id ? { ...act, completed: !act.completed } : act
            )
            return { ...subcat, activities: updatedActivities }
          }
          return subcat
        })
        return { ...spoke, subcategories: updatedSubcategories }
      }
      return spoke
    })

    setActivities(updatedActivities)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Tabs */}
        <div className="flex space-x-4 mb-8">
            <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'explore'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
          >
            Explore
            </button>
              <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'activities'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
          >
            Activities
              </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'explore' ? (
            <div>
            {/* Existing Activities Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Spokes */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Life Spokes</h2>
                <div className="space-y-2">
                  {spokes.map((spoke) => (
                    <button
                      key={spoke.id}
                      onClick={() => {
                        setSelectedSpoke(spoke)
                        setSelectedSubcategory(null)
                      }}
                      className={`w-full text-left px-4 py-2 rounded ${
                        selectedSpoke?.id === spoke.id
                          ? 'bg-primary-50 text-primary-600'
                          : 'hover:bg-gray-50'
                      }`}
                  >
                      <div className="flex items-center">
                        <spoke.icon className="h-5 w-5 mr-2" />
                        <span>{spoke.name}</span>
                    </div>
                      </button>
                ))}
              </div>
            </div>

              {/* Middle Column - Subcategories */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                {selectedSpoke ? (
                <div className="space-y-2">
                  {selectedSpoke.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                        onClick={() => setSelectedSubcategory(subcategory)}
                        className={`w-full text-left px-4 py-2 rounded ${
                        selectedSubcategory?.id === subcategory.id
                            ? 'bg-primary-50 text-primary-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
                ) : (
                  <p className="text-gray-500">Select a life spoke to view categories</p>
                )}
            </div>

              {/* Right Column - Activities */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Activities</h2>
                {selectedSubcategory ? (
                  <div className="space-y-2">
                    {selectedSubcategory.activities.map((activity) => (
                              <div
                                key={activity.id}
                        className="p-3 rounded border hover:bg-gray-50 cursor-pointer"
                              >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{activity.name}</span>
                          <span className="text-xs text-gray-500">{activity.level}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                ) : (
                  <p className="text-gray-500">Select a category to view activities</p>
                )}
                      </div>
                  </div>
            </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Activities</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
} 