import { NextResponse } from 'next/server'

// Mock games data - replace with actual data from your database
const games = [
  {
    id: 1,
    name: 'Mindfulness Challenge',
    description: 'Complete daily mindfulness challenges',
    spoke: 'Spiritual',
    category: 'Meditation'
  },
  {
    id: 2,
    name: 'Emotion Quest',
    description: 'Journey through emotional awareness levels',
    spoke: 'Mental',
    category: 'Self-Awareness'
  },
  {
    id: 3,
    name: 'Fitness Adventure',
    description: 'Gamified workout challenges',
    spoke: 'Physical',
    category: 'Exercise'
  },
  {
    id: 4,
    name: 'Life Goals RPG',
    description: 'Turn personal goals into a role-playing game',
    spoke: 'Personal',
    category: 'Planning'
  },
  {
    id: 5,
    name: 'Career Simulator',
    description: 'Simulate different career paths',
    spoke: 'Professional',
    category: 'Career'
  },
  {
    id: 6,
    name: 'Money Management Quest',
    description: 'Learn financial skills through gameplay',
    spoke: 'Financial',
    category: 'Finance'
  },
  {
    id: 7,
    name: 'Social Network Builder',
    description: 'Build and strengthen social connections',
    spoke: 'Social',
    category: 'Relationships'
  },
  {
    id: 8,
    name: 'Mindful Explorer',
    description: 'Explore mindfulness through interactive challenges',
    spoke: 'Mindfulness',
    category: 'Reflection'
  },
  {
    id: 9,
    name: 'Leadership Challenge',
    description: 'Develop leadership skills through scenarios',
    spoke: 'Leadership',
    category: 'Development'
  }
]

export async function GET() {
  try {
    return NextResponse.json(games)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
} 