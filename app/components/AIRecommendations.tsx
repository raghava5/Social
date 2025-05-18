'use client'

import { useState, useEffect } from 'react'
import { 
  SparklesIcon, 
  LightBulbIcon, 
  ArrowPathIcon,
  BeakerIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import type { RecommendationItem } from '../api/ai/recommender'

interface AIRecommendationsProps {
  userId: string
  category?: string
}

export default function AIRecommendations({ userId, category }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true)
        setError(null)
        
        // Call our API to get recommendations
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            categories: category ? [category] : undefined,
            limit: 5,
            includeRecentlyViewed: true
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations')
        }
        
        const data = await response.json()
        setRecommendations(data.recommendations)
      } catch (err) {
        console.error('Error fetching recommendations:', err)
        setError('Unable to load personalized recommendations')
        // Use fallback recommendations
        setRecommendations(getFallbackRecommendations(category))
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecommendations()
  }, [userId, category])
  
  if (loading) {
    return (
      <div className="relative p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 animate-pulse">
        <div className="flex items-center">
          <SparklesIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-blue-800">Personalizing your experience...</h3>
        </div>
        <div className="mt-3 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-white bg-opacity-50 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }
  
  if (error && recommendations.length === 0) {
    return (
      <div className="relative p-6 rounded-lg bg-red-50">
        <div className="flex items-center">
          <BeakerIcon className="h-6 w-6 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold text-red-800">Recommendation System Unavailable</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button 
          className="mt-3 text-sm text-red-600 hover:text-red-800 flex items-center"
          onClick={() => window.location.reload()}
        >
          <ArrowPathIcon className="h-4 w-4 mr-1" />
          Retry
        </button>
      </div>
    )
  }
  
  if (recommendations.length === 0) {
    return null
  }
  
  return (
    <div className="relative p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="absolute top-0 right-0 p-1">
        <button 
          className="text-blue-500 hover:text-blue-700 p-1"
          onClick={() => window.location.reload()}
          title="Refresh recommendations"
        >
          <ArrowPathIcon className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex items-center">
        <SparklesIcon className="h-6 w-6 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-blue-800">Personalized For You</h3>
      </div>
      
      <div className="mt-3 space-y-3">
        {recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
    </div>
  )
}

function RecommendationCard({ recommendation }: { recommendation: RecommendationItem }) {
  // Determine icon based on recommendation type
  let Icon = LightBulbIcon
  if (recommendation.type === 'user') {
    Icon = UserGroupIcon
  }
  
  return (
    <div className="bg-white bg-opacity-80 p-3 rounded-md hover:bg-opacity-100 transition-colors">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <Icon className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-gray-900">{recommendation.title}</h4>
          {recommendation.description && (
            <p className="mt-1 text-xs text-gray-600">{recommendation.description}</p>
          )}
          {recommendation.category && (
            <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {recommendation.category}
            </span>
          )}
          {recommendation.level && (
            <span className="inline-flex items-center px-2 py-0.5 mt-1 ml-2 rounded text-xs font-medium bg-purple-100 text-purple-800">
              {recommendation.level}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Fallback recommendations when API fails
function getFallbackRecommendations(category?: string): RecommendationItem[] {
  const allRecommendations: RecommendationItem[] = [
    {
      id: 'fallback-1',
      type: 'activity',
      title: 'Daily Meditation Practice',
      description: 'Start with just 5 minutes of mindful breathing',
      category: 'spiritual',
      level: 'Beginner'
    },
    {
      id: 'fallback-2',
      type: 'activity',
      title: 'Financial Goal Setting',
      description: 'Define your short and long-term financial objectives',
      category: 'financial',
      level: 'Beginner'
    },
    {
      id: 'fallback-3',
      type: 'activity',
      title: '30-Day Fitness Challenge',
      description: 'Simple daily exercises to build consistency',
      category: 'physical',
      level: 'Intermediate'
    },
    {
      id: 'fallback-4',
      type: 'activity',
      title: 'Conflict Resolution Skills',
      description: 'Learn techniques to navigate difficult conversations',
      category: 'relational',
      level: 'Intermediate'
    },
    {
      id: 'fallback-5',
      type: 'activity',
      title: 'Professional Networking',
      description: 'Strategies to expand your professional connections',
      category: 'professional',
      level: 'Intermediate'
    },
  ]
  
  if (!category) {
    return allRecommendations;
  }
  
  return allRecommendations.filter(rec => rec.category === category);
} 