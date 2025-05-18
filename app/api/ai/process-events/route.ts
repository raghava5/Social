import { NextRequest, NextResponse } from 'next/server';
import { processTrackedEvents } from '../data-processor';

export async function POST(request: NextRequest) {
  try {
    // Check for secret API key to protect this endpoint
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.AI_PROCESSOR_API_KEY;
    
    if (!authHeader || !apiKey || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Process events
    const result = await processTrackedEvents();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in event processing API:', error);
    return NextResponse.json(
      { error: 'Failed to process events' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
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
  );
} 