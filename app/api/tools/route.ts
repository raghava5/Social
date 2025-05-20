import { NextResponse } from 'next/server'

// Mock tools data - replace with actual data from your database
const tools = [
  {
    id: 1,
    name: 'Meditation Timer',
    description: 'A simple timer with ambient sounds for meditation',
    spoke: 'Spiritual',
    category: 'Meditation'
  },
  {
    id: 2,
    name: 'Mood Tracker',
    description: 'Track your daily moods and emotions',
    spoke: 'Mental',
    category: 'Self-Awareness'
  },
  {
    id: 3,
    name: 'Workout Planner',
    description: 'Plan and track your workouts',
    spoke: 'Physical',
    category: 'Exercise'
  },
  {
    id: 4,
    name: 'Goal Setting Assistant',
    description: 'Set and track personal development goals',
    spoke: 'Personal',
    category: 'Planning'
  },
  {
    id: 5,
    name: 'Career Path Explorer',
    description: 'Explore different career paths and opportunities',
    spoke: 'Professional',
    category: 'Career'
  },
  {
    id: 6,
    name: 'Budget Calculator',
    description: 'Track income, expenses, and savings goals',
    spoke: 'Financial',
    category: 'Finance'
  },
  {
    id: 7,
    name: 'Social Network Analyzer',
    description: 'Analyze and improve your social connections',
    spoke: 'Social',
    category: 'Relationships'
  },
  {
    id: 8,
    name: 'Mindfulness Journal',
    description: 'Digital journal for mindfulness practice',
    spoke: 'Mindfulness',
    category: 'Reflection'
  },
  {
    id: 9,
    name: 'Leadership Skills Assessment',
    description: 'Assess and develop leadership capabilities',
    spoke: 'Leadership',
    category: 'Development'
  }
]

export async function GET() {
  try {
    return NextResponse.json(tools)
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 })
  }
} 