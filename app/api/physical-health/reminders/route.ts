import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as reminderService from './service'

// GET /api/physical-health/reminders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    switch (path) {
      case 'logs':
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const logs = await reminderService.getReminderLogs(startDate || undefined, endDate || undefined)
        return NextResponse.json({ logs })
      default:
        const category = searchParams.get('category')
        const frequency = searchParams.get('frequency')
        const status = searchParams.get('status')
        const reminders = await reminderService.getReminders(
          category || undefined,
          frequency || undefined,
          status || undefined
        )
        return NextResponse.json({ reminders })
    }
  } catch (error) {
    console.error('Error in GET request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// POST /api/physical-health/reminders
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const data = await request.json()

    switch (path) {
      case 'bulk-update':
        const success = await reminderService.bulkUpdateReminders(data)
        return NextResponse.json({ success })
      case 'complete':
        const reminderId = searchParams.get('id')
        if (!reminderId) {
          return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 })
        }
        const completed = await reminderService.completeReminder(reminderId)
        return NextResponse.json({ success: completed })
      default:
        const reminder = await reminderService.createReminder(data)
        return NextResponse.json({ reminder }, { status: 201 })
    }
  } catch (error) {
    console.error('Error in POST request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// PUT /api/physical-health/reminders/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    const success = await reminderService.updateReminder(params.id, updates)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    )
  }
}

// DELETE /api/physical-health/reminders/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await reminderService.deleteReminder(params.id)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    )
  }
}

// POST /api/physical-health/reminders/:id/complete
export async function completeReminder(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get user ID from session
    // TODO: Create reminder log
    // TODO: Update reminder last completed timestamp
    // TODO: Update streak if applicable

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing reminder:', error)
    return NextResponse.json(
      { error: 'Failed to complete reminder' },
      { status: 500 }
    )
  }
}

// GET /api/physical-health/reminders/logs
export async function getReminderLogs(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // TODO: Get user ID from session
    // TODO: Fetch logs from database with date range filter
    const logs: ReminderLog[] = []

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching reminder logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminder logs' },
      { status: 500 }
    )
  }
}

// POST /api/physical-health/reminders/bulk-update
export async function bulkUpdateReminders(request: NextRequest) {
  try {
    const updates = await request.json()

    // TODO: Validate updates
    // TODO: Perform bulk update in database
    // TODO: Update notification schedules if needed

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error performing bulk update:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk update' },
      { status: 500 }
    )
  }
} 