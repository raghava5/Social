import { NextRequest, NextResponse } from 'next/server'
import { recommendActivities, suggestNextAction, recommendConnections } from '../ai/recommender'
import type { RecommendationItem } from '../ai/recommender'

// Input validation type
interface RecommendationRequest {
  userId: string
  type?: 'activities' | 'connections' | 'next_action'
  categories?: string[]
  limit?: number
  excludeIds?: string[]
  includeRecentlyViewed?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json() as RecommendationRequest
    
    if (!body.userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    
    // Default to activity recommendations
    const type = body.type || 'activities'
    let recommendations: RecommendationItem[] = []
    
    // Get recommendations based on type
    switch (type) {
      case 'activities':
        recommendations = await recommendActivities({
          userId: body.userId,
          categories: body.categories,
          limit: body.limit,
          excludeIds: body.excludeIds,
          includeRecentlyViewed: body.includeRecentlyViewed
        })
        break
        
      case 'connections':
        recommendations = await recommendConnections({
          userId: body.userId,
          limit: body.limit,
          excludeIds: body.excludeIds
        })
        break
        
      case 'next_action':
        recommendations = await suggestNextAction(body.userId)
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid recommendation type' },
          { status: 400 }
        )
    }
    
    // Return recommendations
    return NextResponse.json({
      recommendations,
      count: recommendations.length
    })
  } catch (error) {
    console.error('Error processing recommendation request:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  )
} 