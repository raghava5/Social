import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const activitiesPath = path.join(process.cwd(), 'Activities.md')
    const content = fs.readFileSync(activitiesPath, 'utf8')

    // Parse the markdown content to extract activities
    const activities: any[] = []
    const lines = content.split('\n')
    let currentSpoke = ''
    let currentSubcategory = ''

    lines.forEach((line) => {
      if (line.startsWith('# ')) {
        currentSpoke = line.slice(2).trim()
      } else if (line.startsWith('## ')) {
        currentSubcategory = line.slice(3).trim()
      } else if (line.match(/^\d+\./)) {
        const activity = line.replace(/^\d+\./, '').trim()
        activities.push({
          id: activities.length + 1,
          name: activity,
          subcategory: {
            name: currentSubcategory,
            spoke: currentSpoke
          },
          level: 'Beginner' // You can add logic to determine level based on content
        })
      }
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
} 