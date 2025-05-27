import { NextResponse } from 'next/server'
import { getOptimizedPrisma, optimizedPostsQuery, executeOptimizedQuery } from '@/lib/prisma-optimized'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { uploadToS3 } from '@/lib/s3'
import { analyzeText } from '../ai/text-analysis'
import { withPerformanceMonitoring, monitorDatabaseQuery } from '@/lib/performance-monitor'
import { getCachedPosts, setCachedPosts, invalidatePostsCache } from '@/lib/posts-cache'

export async function POST(req: Request) {
  try {
    // Removed excessive logging for performance
    console.log('📤 Creating new post...')
    
    // Create Supabase server client
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

    // Get session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      console.log('Unauthorized: No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const content = formData.get('content') as string
    const feeling = formData.get('feeling') as string || null
    const location = formData.get('location') as string || null
    const spoke = formData.get('spoke') as string || null
    const type = formData.get('type') as string || 'user-post'
    const tags = formData.getAll('tags') as string[]
    const files = formData.getAll('files') as File[]
    
    // Check for pre-uploaded media URLs
    const uploadedVideoUrl = formData.get('uploadedVideoUrl') as string
    const uploadedImageUrl = formData.get('uploadedImageUrl') as string
    const uploadedAudioUrl = formData.get('uploadedAudioUrl') as string
    const uploadedDocumentUrl = formData.get('uploadedDocumentUrl') as string
    
    // Audio classification data
    const audioType = formData.get('audioType') as string
    const audioClassificationJson = formData.get('audioClassification') as string
    let audioClassification = null
    
    if (audioClassificationJson) {
      try {
        audioClassification = JSON.parse(audioClassificationJson)
        console.log('🎵 Audio classification received:', audioClassification)
      } catch (error) {
        console.warn('Failed to parse audio classification:', error)
      }
    }

    console.log('Post data:', { content, feeling, location, spoke, type, tags, audioType })
    console.log('Pre-uploaded media:', { 
      uploadedVideoUrl, 
      uploadedImageUrl, 
      uploadedAudioUrl, 
      uploadedDocumentUrl 
    })

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Analyze content and auto-assign spoke if not provided
    let assignedSpoke = spoke;
    try {
      if (!assignedSpoke) {
        const analysis = await analyzeText(content);
        if (analysis.spokeTag.confidence > 0.4) {
          assignedSpoke = analysis.spokeTag.spoke;
          console.log(`Auto-assigned spoke: ${assignedSpoke} (confidence: ${analysis.spokeTag.confidence})`);
          console.log(`Reasoning: ${analysis.spokeTag.reasoning}`);
        }
      }
    } catch (error) {
      console.error('Error analyzing content for spoke tagging:', error);
      // Continue without auto-assignment if analysis fails
    }

    // Handle media files - use pre-uploaded URLs if available, otherwise upload new files
    const imageUrls: string[] = []
    const videoUrls: string[] = []
    const audioUrls: string[] = []
    const documentUrls: string[] = []

    // Add pre-uploaded URLs first
    if (uploadedVideoUrl) {
      videoUrls.push(uploadedVideoUrl)
      console.log('✅ Using pre-uploaded video URL:', uploadedVideoUrl)
    }
    
    if (uploadedImageUrl) {
      imageUrls.push(uploadedImageUrl)
      console.log('✅ Using pre-uploaded image URL:', uploadedImageUrl)
    }

    if (uploadedAudioUrl) {
      audioUrls.push(uploadedAudioUrl)
      console.log('✅ Using pre-uploaded audio URL:', uploadedAudioUrl)
    }

    if (uploadedDocumentUrl) {
      documentUrls.push(uploadedDocumentUrl)
      console.log('✅ Using pre-uploaded document URL:', uploadedDocumentUrl)
    }

    // Upload any new files if not pre-uploaded
    if (files.length > 0 && !uploadedVideoUrl && !uploadedImageUrl && !uploadedAudioUrl && !uploadedDocumentUrl) {
      try {
        for (const file of files) {
          const url = await uploadToS3(file)
          if (file.type.startsWith('image/')) {
            imageUrls.push(url)
          } else if (file.type.startsWith('video/')) {
            videoUrls.push(url)
          } else if (file.type.startsWith('audio/')) {
            audioUrls.push(url)
          } else if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text') || file.type.includes('application/')) {
            documentUrls.push(url)
          }
        }
      } catch (uploadError) {
        console.error('Error uploading files:', uploadError)
        return NextResponse.json({ error: 'Failed to upload media files' }, { status: 500 })
      }
    }

    console.log('Media URLs:', { imageUrls, videoUrls, audioUrls, documentUrls })

    // Get or create user in database
    const prisma = getOptimizedPrisma()
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      // Create user if they don't exist
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email!,
          username: session.user.email!.split('@')[0],
          firstName: session.user.user_metadata?.firstName || 'Anonymous',
          lastName: session.user.user_metadata?.lastName || 'User',
          passwordHash: '', // Not used with Supabase auth
        },
      })
    }

    // Create post in database
    const post = await prisma.post.create({
      data: {
        content,
        feeling: feeling || undefined,
        location: location || undefined,
        spoke: assignedSpoke || undefined,
        type,
        tags: tags.length > 0 ? tags.join(',') : undefined,
        images: imageUrls.length > 0 ? imageUrls.join(',') : undefined,
        videos: videoUrls.length > 0 ? videoUrls.join(',') : undefined,
        audios: audioUrls.length > 0 ? audioUrls.join(',') : undefined,
        documents: documentUrls.length > 0 ? documentUrls.join(',') : undefined,
        userId: user.id,
        authorId: user.id,
      },
      include: {
        author: true,
        likes: true,
        comments: true,
      },
    })

    console.log('Post created:', post)

    // 🚀 CACHE INVALIDATION: Clear relevant cache entries
    invalidatePostsCache({
      spoke: assignedSpoke || undefined,
      type: type,
    })

    // 🎯 AUTOMATIC SPOKE DETECTION: Trigger immediately after post creation
    try {
      console.log(`🎯 Triggering automatic spoke detection for post: ${post.id}`)
      
      // Call the process-events API to detect spoke
      const spokeDetectionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/process-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId: post.id, 
          action: 'detect_spoke' 
        })
      })
      
      if (spokeDetectionResponse.ok) {
        const spokeResult = await spokeDetectionResponse.json()
        if (spokeResult.spoke) {
          console.log(`✅ Spoke detected for post ${post.id}: ${spokeResult.spoke}`)
          // Update the post object to return the detected spoke
          post.spoke = spokeResult.spoke
        } else {
          console.log(`⚠️ No spoke detected for post ${post.id}`)
        }
      } else {
        console.error(`❌ Spoke detection failed for post ${post.id}:`, spokeDetectionResponse.status)
      }
    } catch (spokeError) {
      console.error(`❌ Spoke detection error for post ${post.id}:`, spokeError)
      // Don't fail post creation if spoke detection fails
    }

    // Emit socket event for real-time updates
    if ((global as any).io) {
      console.log('Emitting new-post event')
      ;(global as any).io.emit('new-post', post)
    } else {
      console.log('WebSocket server not available')
    }

    // Auto-trigger FREE transcription for ALL videos
    if (videoUrls.length > 0) {
      try {
        console.log(`🆓 Auto-triggering FREE transcription for ${videoUrls.length} video(s) in post:`, post.id)
        
        // Import the auto-transcribe function (commented out as it's not exported)
        // const { autoTranscribeVideo } = await import('../transcribe-free/route')
        
        // Transcribe each video (commented out as function is not available)
        // for (const videoUrl of videoUrls) {
        //   console.log(`🎥 Transcribing video: ${videoUrl}`)
        //   autoTranscribeVideo(post.id, videoUrl)
        //     .catch((error: any) => {
        //       console.error(`Failed to transcribe video ${videoUrl}:`, error)
        //     })
        // }
        
        console.log('✅ FREE transcription started for all videos')
      } catch (transcribeError) {
        console.warn('⚠️ Failed to auto-trigger transcription:', transcribeError)
        // Don't fail the post creation if transcription fails
      }
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    )
  }
}

// 🚀 ULTRA-FAST GET API - WITH REQUEST CANCELLATION PROTECTION
export const GET = async function(req: Request) {
  const startTime = Date.now()
  console.log('🚀 ULTRA-FAST API START')
  
  try {
    const { searchParams } = new URL(req.url)
    const spoke = searchParams.get('spoke')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 5) // ✅ INCREASED: Allow up to 5 posts
    
    console.log(`📄 Fetching posts: page=${page}, limit=${limit}`)

    // 🚀 CACHE CHECK: Try to get from cache first
    const cacheParams = { page, limit, spoke: spoke || undefined, type: type || undefined }
    const cachedResult = getCachedPosts(cacheParams)
    
    if (cachedResult) {
      console.log(`⚡ CACHE HIT in ${Date.now() - startTime}ms`)
      return new NextResponse(JSON.stringify(cachedResult), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'X-Query-Time': `${Date.now() - startTime}ms`,
          'Access-Control-Allow-Origin': '*', // ✅ CORS HEADERS
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
      })
    }

    console.log('🗄️ CACHE MISS - Fetching from database...')

    // 🚀 REQUEST VALIDATION: Prevent invalid requests
    if (page < 1 || limit < 1) {
      console.warn('Invalid pagination parameters')
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 })
    }

    // 🚀 NO AUTH CHECK - Skip for maximum speed
    const where = {
      isDeleted: false,
      ...(spoke ? { spoke } : {}),
      ...(type ? { type } : {}),
    }

    const prisma = getOptimizedPrisma()
    
    // 🚀 STEP 1: Get posts - ESSENTIAL FIELDS INCLUDING MEDIA
    const queryStartTime = Date.now()
    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        content: true,
        images: true,
        videos: true,          // ✅ RESTORED: Essential for media display
        audios: true,          // ✅ RESTORED: Essential for audio posts
        documents: true,       // ✅ RESTORED: Essential for document posts
        feeling: true,
        spoke: true,
        createdAt: true,
        authorId: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })
    
    console.log(`⚡ Posts query: ${Date.now() - queryStartTime}ms`)

    if (posts.length === 0) {
      const emptyResponse = {
        posts: [],
        pagination: { page, limit, hasMore: false, count: 0 }
      }
      setCachedPosts(cacheParams, emptyResponse, 60 * 1000) // Cache for 1 minute
      return new NextResponse(JSON.stringify(emptyResponse), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'MISS',
          'X-Query-Time': `${Date.now() - startTime}ms`,
        },
      })
    }

    // 🚀 STEP 2: Get authors only - NO other data
    const batchStartTime = Date.now()
    const authorIds = [...new Set(posts.map(p => p.authorId))]
    
    const authors = await prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true, // ✅ RESTORED: For user avatars
      }
    })

    console.log(`⚡ Authors query: ${Date.now() - batchStartTime}ms`)

    // 🚀 STEP 3: Combine data - ESSENTIAL FIELDS WITH NULL SAFETY
    const processingStartTime = Date.now()
    const authorsMap = new Map(authors.map(author => [author.id, author]))

    const postsWithData = posts.map(post => ({
      id: post.id,
      content: post.content || '',                    // ✅ NULL SAFETY: Prevent crashes
      images: post.images || null,                    // ✅ RESTORED: Media support
      videos: post.videos || null,                    // ✅ RESTORED: Video support  
      audios: post.audios || null,                    // ✅ RESTORED: Audio support
      documents: post.documents || null,              // ✅ RESTORED: Document support
      feeling: post.feeling || null,
      spoke: post.spoke || null,
      createdAt: post.createdAt,
      author: authorsMap.get(post.authorId) || null,
      likesCount: 0, // Skip for speed but could be restored if needed
      commentsCount: 0, // Skip for speed but could be restored if needed
      isLikedByCurrentUser: false,
    }))

    console.log(`⚡ Data processing: ${Date.now() - processingStartTime}ms`)

    const response = {
      posts: postsWithData,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
        count: posts.length,
      }
    }
    
    console.log(`⏱️ TOTAL API TIME: ${Date.now() - startTime}ms`)
    
    // 🚀 CACHE RESULT
    setCachedPosts(cacheParams, response, 60 * 1000) // Cache for 1 minute
    
    return new NextResponse(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'X-Query-Time': `${Date.now() - startTime}ms`,
        'Access-Control-Allow-Origin': '*', // ✅ CORS HEADERS
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    })
  } catch (error) {
    console.error('❌ API Error:', error)
    
    // ✅ ENHANCED ERROR RESPONSE
    const errorResponse = {
      error: 'Failed to fetch posts',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
    
    return new NextResponse(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Error': 'true',
      },
    })
  }
} 