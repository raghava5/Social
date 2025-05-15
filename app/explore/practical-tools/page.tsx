import { Suspense } from 'react'
import { Metadata } from 'next'
import { 
  HeartIcon, BookOpenIcon, UsersIcon, BriefcaseIcon,
  BanknotesIcon, ArrowTrendingUpIcon, SparklesIcon, HandRaisedIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Practical Tools | Explore',
  description: 'Discover and use practical tools to improve your well-being across all aspects of life.',
}

interface ToolCategory {
  id: string
  name: string
  description: string
  tools: Tool[]
}

interface Tool {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  route: string
}

const SPOKE_TOOLS: ToolCategory[] = [
  {
    id: 'physical-health',
    name: 'Physical Health',
    description: 'Tools to optimize your fitness, nutrition, and overall health.',
    tools: [
      {
        id: 'fitness-planner',
        name: 'Fitness Planner',
        description: 'Create and track personalized workout routines.',
        icon: HeartIcon,
        route: '/explore/practical-tools/physical-health/fitness-planner'
      },
      {
        id: 'nutrition-tracker',
        name: 'Nutrition Tracker',
        description: 'Plan meals and track your nutrition goals.',
        icon: HeartIcon,
        route: '/explore/practical-tools/physical-health/nutrition-tracker'
      },
      {
        id: 'health-reminders',
        name: 'Health Reminders',
        description: 'Set custom reminders for health-related activities.',
        icon: HeartIcon,
        route: '/explore/practical-tools/physical-health/health-reminders'
      }
    ]
  },
  // Add other spokes similarly...
]

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon
  
  return (
    <a 
      href={tool.route}
      className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary-50 rounded-lg">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
          <p className="mt-1 text-sm text-gray-600">{tool.description}</p>
        </div>
      </div>
    </a>
  )
}

function CategorySection({ category }: { category: ToolCategory }) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
      <p className="mt-2 text-gray-600">{category.description}</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  )
}

export default function PracticalTools() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Practical Tools</h1>
        <p className="mt-4 text-xl text-gray-600">
          Discover tools and resources to improve your well-being across all aspects of life.
        </p>
      </div>

      <Suspense fallback={<div>Loading tools...</div>}>
        <div className="mt-12">
          {SPOKE_TOOLS.map(category => (
            <CategorySection key={category.id} category={category} />
          ))}
        </div>
      </Suspense>
    </div>
  )
} 