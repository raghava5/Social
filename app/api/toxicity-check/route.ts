import { NextRequest, NextResponse } from 'next/server'
import { analyzeText } from '../ai/text-analysis'

interface ToxicityCheckRequest {
  text: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json() as ToxicityCheckRequest
    
    if (!body.text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      )
    }
    
    // Analyze the text for toxicity
    const analysis = await analyzeText(body.text)
    
    // Return toxicity assessment
    return NextResponse.json({
      isToxic: analysis.toxicity.isToxic,
      toxicityScore: analysis.toxicity.score,
      sentiment: {
        score: analysis.sentiment.score,
        label: analysis.sentiment.label
      }
    })
  } catch (error) {
    console.error('Error checking toxicity:', error)
    return NextResponse.json(
      { error: 'Failed to check content' },
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