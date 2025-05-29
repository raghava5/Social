import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

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

    const { postId, videoUrl, audioUrl } = await req.json()
    const mediaUrl = videoUrl || audioUrl // Support both parameter names

    if (!postId || !mediaUrl) {
      return NextResponse.json({ error: 'Missing postId or media URL' }, { status: 400 })
    }

    console.log('🎤 Starting transcription for:', { postId, mediaUrl })

    // Check if transcript already exists for this specific media file
    const existingTranscript = await prisma.transcript.findFirst({
      where: { 
        postId,
        videoUrl: mediaUrl // Store all media URLs in videoUrl field
      }
    })

    if (existingTranscript) {
      return NextResponse.json({ transcript: existingTranscript })
    }

    // Create initial transcript record
    const transcript = await prisma.transcript.create({
      data: {
        postId,
        videoUrl: mediaUrl,
        status: 'processing'
      }
    })

    console.log('✅ Transcript record created, starting background processing...')

    // Process transcription in background
    processTranscription(transcript.id, mediaUrl)

    return NextResponse.json({ 
      transcript,
      message: 'Transcription started' 
    })

  } catch (error) {
    console.error('❌ Error starting transcription:', error)
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

async function processTranscription(transcriptId: string, mediaUrl: string) {
  try {
    console.log(`🎤 Processing transcription for: ${mediaUrl}`)
    
    let fileBuffer: Buffer
    
    // Handle both relative and full URLs
    if (mediaUrl.startsWith('http')) {
      // Full URL - fetch from external source
      const response = await fetch(mediaUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch media file: ${response.statusText}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
    } else {
      // Relative URL - read from local file system
      const filePath = mediaUrl.startsWith('/') ? 
        path.join(process.cwd(), 'public', mediaUrl) : 
        path.join(process.cwd(), 'public', '/', mediaUrl)
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Media file not found: ${filePath}`)
      }
      
      fileBuffer = fs.readFileSync(filePath)
    }

    console.log(`📁 File loaded, size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB`)

    // Determine file type and extension from URL
    const urlParts = mediaUrl.split('.')
    const extension = urlParts[urlParts.length - 1].toLowerCase()
    let mimeType = 'audio/mpeg' // Default
    let fileName = 'media.mp3' // Default

    // Set appropriate MIME type and filename based on extension
    if (extension === 'mp4' || extension === 'mov' || extension === 'avi') {
      mimeType = 'video/mp4'
      fileName = `video.${extension}`
    } else if (extension === 'mp3') {
      mimeType = 'audio/mpeg'
      fileName = `audio.${extension}`
    } else if (extension === 'wav') {
      mimeType = 'audio/wav'
      fileName = `audio.${extension}`
    } else if (extension === 'm4a') {
      mimeType = 'audio/m4a'
      fileName = `audio.${extension}`
    } else if (extension === 'webm') {
      mimeType = 'video/webm'
      fileName = `media.${extension}`
    }

    // Check file size (OpenAI has 25MB limit)
    if (fileBuffer.length > 25 * 1024 * 1024) {
      throw new Error('File too large for transcription (max 25MB)')
    }

    // Create a File object for OpenAI with proper type
    const file = new File([fileBuffer], fileName, { type: mimeType })

    console.log(`🎤 Transcribing ${fileName} (${mimeType}) with Whisper...`)

    // Transcribe with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
      language: 'en' // Can be auto-detected or specified
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

    console.log(`✅ Transcription completed for transcript ${transcriptId}`)

  } catch (error) {
    console.error('❌ Error processing transcription:', error)
    
    // Update status to failed
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: {
        status: 'failed',
        fullText: `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    })
  }
} 