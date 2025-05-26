import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { detectSpoke } from '@/app/api/ai/text-analysis'

const execAsync = promisify(exec)

// Helper function to get local file path from video URL
function getLocalVideoPath(videoUrl: string): string | null {
  if (videoUrl.startsWith('http')) {
    return null // External URL, can't process locally
  }
  
  // For relative paths like /uploads/video.mp4
  const localPath = path.join(process.cwd(), 'public', videoUrl.replace(/^\//, ''))
  
  return fs.existsSync(localPath) ? localPath : null
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
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

    // Check if transcript already exists
    const existingTranscript = await prisma.transcript.findFirst({
      where: { postId, videoUrl }
    })

    if (existingTranscript) {
      return NextResponse.json({ transcript: existingTranscript })
    }

    // Check if we can process this video locally
    const localVideoPath = getLocalVideoPath(videoUrl)
    if (!localVideoPath) {
      return NextResponse.json({ 
        error: 'Video not found locally. Upload the video first.' 
      }, { status: 400 })
    }

    // Create initial transcript record
    const transcript = await prisma.transcript.create({
      data: {
        postId,
        videoUrl,
        status: 'processing'
      }
    })

    // Process with FREE Whisper.cpp (no waiting, background processing)
    processTranscriptionFree(transcript.id, videoUrl, localVideoPath)
      .catch(error => {
        console.error('Background transcription failed:', error)
      })

    return NextResponse.json({ 
      transcript,
      message: '🆓 Free transcription started!' 
    })

  } catch (error) {
    console.error('Error starting free transcription:', error)
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
      transcript = await prisma.transcript.findFirst({
        where: { 
          postId,
          videoUrl: decodeURIComponent(videoUrl)
        }
      })
    } else {
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

// 🆓 FREE WHISPER.CPP BACKGROUND PROCESSING
async function processTranscriptionFree(transcriptId: string, videoUrl: string, localVideoPath: string) {
  try {
    console.log(`🆓 Starting FREE transcription for ${transcriptId}...`)
    console.log(`📹 Video: ${localVideoPath}`)
    
    // Create temp directory for output
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    
    // Get configuration
    const whisperPath = process.env.WHISPER_CPP_PATH || '/opt/homebrew/bin/whisper-cli'
    const modelPath = process.env.WHISPER_MODEL_PATH || path.join(process.cwd(), 'whisper-models/ggml-base.en.bin')
    
    if (!fs.existsSync(modelPath)) {
      throw new Error(`❌ Whisper model not found at: ${modelPath}`)
    }
    
    // Convert video to audio first using FFmpeg
    const audioPath = path.join(tempDir, `audio_${transcriptId}.wav`)
    console.log(`🔄 Converting video to audio: ${audioPath}`)
    
    // First, check if video has audio stream
    const probeCommand = `ffprobe -v quiet -select_streams a:0 -show_entries stream=codec_type -of csv=p=0 "${localVideoPath}"`
    
    let ffmpegCommand
    try {
      const { stdout: probeOutput } = await execAsync(probeCommand, { timeout: 30000 })
      
      if (probeOutput.trim() === 'audio') {
        // Video has audio - extract it
        ffmpegCommand = [
          'ffmpeg',
          '-i', `"${localVideoPath}"`,
          '-ar', '16000', // 16kHz sample rate (Whisper's preferred)
          '-ac', '1',     // Mono audio
          '-c:a', 'pcm_s16le', // PCM 16-bit little-endian
          '-y',           // Overwrite output file
          `"${audioPath}"`
        ].join(' ')
      } else {
        // Video has no audio - create silent audio
        console.log('⚠️ Video has no audio track, creating silent audio for processing')
        ffmpegCommand = [
          'ffmpeg',
          '-f', 'lavfi',
          '-i', 'anullsrc=channel_layout=mono:sample_rate=16000',
          '-t', '10', // 10 seconds of silence
          '-c:a', 'pcm_s16le',
          '-y',
          `"${audioPath}"`
        ].join(' ')
      }
    } catch (probeError) {
      // If probe fails, assume no audio and create silent track
      console.log('⚠️ Could not probe audio, creating silent audio for processing')
      ffmpegCommand = [
        'ffmpeg',
        '-f', 'lavfi',
        '-i', 'anullsrc=channel_layout=mono:sample_rate=16000',
        '-t', '10', // 10 seconds of silence
        '-c:a', 'pcm_s16le',
        '-y',
        `"${audioPath}"`
      ].join(' ')
    }
    
    console.log(`🎯 Running FFmpeg: ${ffmpegCommand}`)
    
    const { stdout: ffmpegStdout, stderr: ffmpegStderr } = await execAsync(ffmpegCommand, {
      timeout: 300000, // 5 minute timeout for conversion
      maxBuffer: 1024 * 1024 * 5 // 5MB buffer
    })
    
    console.log('✅ FFmpeg conversion completed!')
    if (ffmpegStdout) console.log('📄 FFmpeg output:', ffmpegStdout)
    if (ffmpegStderr && !ffmpegStderr.includes('time=')) console.log('⚠️ FFmpeg warnings:', ffmpegStderr)
    
    // Verify audio file was created
    if (!fs.existsSync(audioPath)) {
      throw new Error('❌ Audio conversion failed - no output file created')
    }
    
    // Output file paths for transcription
    const outputBase = path.join(tempDir, `transcript_${transcriptId}`)
    const srtPath = `${outputBase}.srt`
    const txtPath = `${outputBase}.txt`
    
    // Build Whisper.cli command
    const whisperCommand = [
      whisperPath,
      '-m', `"${modelPath}"`,
      '-f', `"${audioPath}"`, // Use converted audio file
      '--output-srt', // Output SRT
      '--output-txt', // Output TXT  
      '--output-file', `"${outputBase}"`,
      '-t', '4', // Use 4 CPU threads
      '-l', 'en', // English language
      '--print-progress'
    ].join(' ')
    
    console.log(`🎯 Running Whisper: ${whisperCommand}`)
    
    // Execute Whisper.cpp with timeout
    const { stdout, stderr } = await execAsync(whisperCommand, {
      timeout: 600000, // 10 minute timeout
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    })
    
    console.log('✅ Whisper.cpp completed!')
    if (stdout) console.log('📄 Output:', stdout)
    if (stderr && !stderr.includes('progress')) console.log('⚠️ Warnings:', stderr)
    
    // Parse results
    let segments: any[] = []
    let fullText = ''
    let duration = 0
    
    // Read SRT file for segments with timestamps
    if (fs.existsSync(srtPath)) {
      console.log('📄 Parsing SRT file...')
      const srtContent = fs.readFileSync(srtPath, 'utf8')
      const parsed = parseSRT(srtContent)
      segments = parsed.segments
      fullText = parsed.fullText
      duration = parsed.duration
    }
    
    // If no SRT, try TXT file for basic text
    if (segments.length === 0 && fs.existsSync(txtPath)) {
      console.log('📄 Using TXT file...')
      fullText = fs.readFileSync(txtPath, 'utf8').trim()
      
      // Create a single segment for the whole video
      if (fullText) {
        segments = [{
          start: 0,
          end: 60, // Default 1 minute, will be updated if we can get real duration
          text: fullText
        }]
      }
    }
    
    if (segments.length === 0) {
      throw new Error('❌ No transcript content generated')
    }
    
    console.log(`📊 Generated ${segments.length} segments, ${fullText.length} characters`)
    
    // Update database with results
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: {
        status: 'completed',
        segments: segments,
        fullText: fullText,
        duration: duration || 60,
        language: 'en'
      }
    })

    // Auto-tag post with spoke based on transcript content
    await autoTagPostWithSpoke(transcriptId, fullText)
    
    // Cleanup temp files
    try {
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath)
      if (fs.existsSync(srtPath)) fs.unlinkSync(srtPath)
      if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath)
    } catch (cleanupError) {
      console.warn('⚠️ Cleanup warning:', cleanupError)
    }
    
    console.log(`🎉 FREE transcription completed for ${transcriptId}`)

  } catch (error) {
    console.error(`❌ Free transcription failed for ${transcriptId}:`, error)
    
    // Update status to failed
    await prisma.transcript.update({
      where: { id: transcriptId },
      data: { 
        status: 'failed',
        fullText: `Transcription failed: ${error instanceof Error ? error.message : String(error)}`
      }
    }).catch((dbError: any) => {
      console.error('Failed to update transcript status:', dbError)
    })
  }
}

// Helper function to parse SRT format
function parseSRT(srtContent: string) {
  const segments: any[] = []
  let fullText = ''
  let duration = 0
  
  // Split by double newlines to get blocks
  const blocks = srtContent.split(/\n\s*\n/).filter(block => block.trim())
  
  blocks.forEach(block => {
    const lines = block.trim().split('\n')
    if (lines.length >= 3) {
      // Line 0: sequence number
      // Line 1: timestamp (00:00:00,000 --> 00:00:05,000)
      // Line 2+: text content
      
      const timestampLine = lines[1]
      const timestampMatch = timestampLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/)
      
      if (timestampMatch) {
        const start = parseTimestamp(timestampMatch[1])
        const end = parseTimestamp(timestampMatch[2])
        const text = lines.slice(2).join(' ').trim()
        
        if (text) {
          segments.push({ start, end, text })
          fullText += text + ' '
          duration = Math.max(duration, end)
        }
      }
    }
  })
  
  return { 
    segments, 
    fullText: fullText.trim(), 
    duration 
  }
}

// Helper function to parse SRT timestamp to seconds
function parseTimestamp(timestamp: string): number {
  const [time, ms] = timestamp.split(',')
  const [hours, minutes, seconds] = time.split(':').map(Number)
  return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000
}

// Helper function to auto-transcribe video during upload
export async function autoTranscribeVideo(postId: string, videoUrl: string): Promise<void> {
  try {
    console.log(`🔄 Auto-transcribing video for post ${postId}: ${videoUrl}`)
    
    const localVideoPath = getLocalVideoPath(videoUrl)
    if (!localVideoPath) {
      console.log('⚠️ Cannot auto-transcribe: video not found locally')
      return
    }

    // Check if transcript already exists
    const existingTranscript = await prisma.transcript.findFirst({
      where: { postId, videoUrl }
    })

    if (existingTranscript) {
      console.log('✅ Transcript already exists')
      return
    }

    // Create transcript record
    const transcript = await prisma.transcript.create({
      data: {
        postId,
        videoUrl,
        status: 'processing'
      }
    })

    // Start background transcription
    processTranscriptionFree(transcript.id, videoUrl, localVideoPath)
      .catch(error => {
        console.error('Auto-transcription failed:', error)
      })

  } catch (error) {
    console.error('Error in auto-transcribe:', error)
  }
}

// Helper function to auto-tag post with spoke based on transcript content
async function autoTagPostWithSpoke(transcriptId: string, fullText: string): Promise<void> {
  try {
    console.log(`🎯 Analyzing transcript for spoke tagging...`)
    
    // Get the transcript to find the associated post
    const transcript = await prisma.transcript.findUnique({
      where: { id: transcriptId }
    })
    
    if (!transcript) {
      console.log('⚠️ Transcript not found for spoke tagging')
      return
    }
    
    // Use the improved process-events API for spoke detection
    const spokeResponse = await fetch('http://localhost:3000/api/ai/process-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        postId: transcript.postId, 
        action: 'detect_spoke' 
      })
    })
    
    if (spokeResponse.ok) {
      const spokeData = await spokeResponse.json()
      if (spokeData.spoke) {
        console.log(`🎯 Detected spoke via API: ${spokeData.spoke}`)
        return // The API will handle updating the post
      }
    }
    
    // Fallback to legacy analysis if API fails
    const spokeAnalysis = detectSpoke(fullText)
    
    console.log(`🎯 Detected spoke: ${spokeAnalysis.spoke} (confidence: ${spokeAnalysis.confidence})`)
    console.log(`🎯 Reasoning: ${spokeAnalysis.reasoning}`)
    
    // Only update if confidence is reasonable (lowered threshold)
    if (spokeAnalysis.confidence > 0.3) {
      // Update the post with the detected spoke
      await prisma.post.update({
        where: { id: transcript.postId },
        data: { 
          spoke: spokeAnalysis.spoke,
          // Add a note about auto-tagging in the content if it doesn't already have a spoke
        }
      })
      
      console.log(`✅ Post ${transcript.postId} auto-tagged with spoke: ${spokeAnalysis.spoke}`)
    } else {
      console.log(`⚠️ Low confidence (${spokeAnalysis.confidence}), skipping auto-tagging`)
    }
    
  } catch (error) {
    console.error('Error in auto-tagging post with spoke:', error)
  }
} 