import { NextRequest, NextResponse } from 'next/server'
import { summarizeText } from '../ai/text-analysis'

interface SummarizeRequest {
  text: string
  maxLength?: number
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json() as SummarizeRequest
    
    if (!body.text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      )
    }
    
    // Set default max length if not provided
    const maxLength = body.maxLength || 150
    
    // Don't summarize if text is already shorter than max length
    if (body.text.length <= maxLength) {
      return NextResponse.json({ summary: body.text })
    }
    
    // Generate summary
    const summary = await summarizeText(body.text, maxLength)
    
    // Return summary
    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
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