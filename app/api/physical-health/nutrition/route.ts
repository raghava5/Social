import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as nutritionService from './service'

// GET /api/physical-health/nutrition/meals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const dietary = searchParams.get('dietary')
    const path = searchParams.get('path')

    switch (path) {
      case 'meals':
        const meals = await nutritionService.getMeals(type || undefined, dietary || undefined)
        return NextResponse.json({ meals })
      case 'goals':
        const goals = await nutritionService.getGoals()
        return NextResponse.json({ goals })
      case 'grocery-list':
        const list = await nutritionService.getGroceryList()
        return NextResponse.json({ list })
      default:
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in GET request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// POST /api/physical-health/nutrition
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const data = await request.json()

    switch (path) {
      case 'meals':
        const meal = await nutritionService.createMeal(data)
        return NextResponse.json({ meal }, { status: 201 })
      case 'logs':
        const log = await nutritionService.logMeal(data)
        return NextResponse.json({ log }, { status: 201 })
      case 'goals':
        const goal = await nutritionService.createGoal(data)
        return NextResponse.json({ goal }, { status: 201 })
      case 'grocery-list':
        const success = await nutritionService.updateGroceryList(data)
        return NextResponse.json({ success })
      default:
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in POST request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// PUT /api/physical-health/nutrition/meals/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const success = await nutritionService.updateMeal(params.id, updates)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error updating meal:', error)
    return NextResponse.json(
      { error: 'Failed to update meal' },
      { status: 500 }
    )
  }
}

// DELETE /api/physical-health/nutrition/meals/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await nutritionService.deleteMeal(params.id)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error deleting meal:', error)
    return NextResponse.json(
      { error: 'Failed to delete meal' },
      { status: 500 }
    )
  }
}

// Helper functions (not exported as route handlers)
async function getGoalsHelper(request: NextRequest) {
  try {
    // TODO: Get user ID from session
    // TODO: Fetch goals from database

    const goals: any[] = []

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Error fetching nutrition goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nutrition goals' },
      { status: 500 }
    )
  }
}

async function createGoalHelper(request: NextRequest) {
  try {
    const goal = await request.json()

    // TODO: Validate goal data
    // TODO: Save to database

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error) {
    console.error('Error creating nutrition goal:', error)
    return NextResponse.json(
      { error: 'Failed to create nutrition goal' },
      { status: 500 }
    )
  }
}

async function getGroceryListHelper(request: NextRequest) {
  try {
    // TODO: Get user ID from session
    // TODO: Fetch grocery list from database

    const list: any[] = []

    return NextResponse.json({ list })
  } catch (error) {
    console.error('Error fetching grocery list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grocery list' },
      { status: 500 }
    )
  }
}

async function updateGroceryListHelper(request: NextRequest) {
  try {
    const updates = await request.json()

    // TODO: Validate updates
    // TODO: Update in database

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating grocery list:', error)
    return NextResponse.json(
      { error: 'Failed to update grocery list' },
      { status: 500 }
    )
  }
} 