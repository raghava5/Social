import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    // Get current user session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handle cookie setting error
            }
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId, videoUrl } = await req.json()

    if (!postId || !videoUrl) {
      return NextResponse.json({ error: 'Missing postId or videoUrl' }, { status: 400 })
    }

    // Check if transcript already exists for this specific video
    const existingTranscript = await prisma.transcript.findFirst({
      where: { 
        postId,
        videoUrl
      }
    })

    if (existingTranscript) {
      return NextResponse.json({ transcript: existingTranscript })
    }

    // Create initial transcript record
    const transcript = await prisma.transcript.create({
      data: {
        postId,
        videoUrl,
        status: 'processing'
      }
    })

    // Process transcription in background
    processTranscription(transcript.id, videoUrl)

    return NextResponse.json({ 
      transcript,
      message: 'Transcription started' 
    })

  } catch (error) {
    console.error('Error starting transcription:', error)
    return NextResponse.json(
      { error: 'Failed to start transcription' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')
    const videoUrl = searchParams.get('videoUrl')

    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 })
    }

    let transcript
    
    if (videoUrl) {
      // Look for transcript for specific video URL
      transcript = await prisma.transcript.findFirst({
        where: { 
          postId,
          videoUrl: decodeURIComponent(videoUrl)
        }
      })
    } else {
      // Fallback to any transcript for the post (backward compatibility)
      transcript = await prisma.transcript.findFirst({
        where: { postId }
      })
    }

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 })
    }

    return NextResponse.json({ transcript })

  } catch (error) {
    console.error('Error fetching transcript:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}

async function processTranscription(transcriptId: string, videoUrl: string) {
  try {
    // Download video file (you might want to implement proper file handling)
    const response = await fetch(videoUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a File object for OpenAI
    const file = new File([buffer], 'video.mp4', { type: 'video/mp4' })

    // Transcribe with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    })

    // Process segments for our format
    const segments = transcription.segments?.map((segment: any) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text.trim()
    })) || []

    // Update transcript in database
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: {
        status: 'completed',
        segments: segments,
        fullText: transcription.text,
        duration: transcription.duration,
        language: transcription.language || 'en'
      }
    })

    console.log(`Transcription completed for transcript ${transcriptId}`)

  } catch (error) {
    console.error('Error processing transcription:', error)
    
    // Update status to failed
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: {
        status: 'failed'
      }
    })
  }
} 