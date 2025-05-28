import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Initialize Prisma client
const prisma = new PrismaClient()

// Enhanced upload function
async function uploadFile(file: File, type: 'images' | 'videos' | 'audios' | 'documents'): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', type)
  await mkdir(uploadsDir, { recursive: true })
  
  const extension = path.extname(file.name)
  const filename = `${uuidv4()}${extension}`
  const filepath = path.join(uploadsDir, filename)
  
  await writeFile(filepath, buffer)
  return `/uploads/${type}/${filename}` // Return web-accessible path
}

// Determine file type based on MIME type
function getFileType(file: File): 'images' | 'videos' | 'audios' | 'documents' {
  if (file.type.startsWith('image/')) return 'images'
  if (file.type.startsWith('video/')) return 'videos'
  if (file.type.startsWith('audio/')) return 'audios'
  return 'documents'
}

export async function POST(req: NextRequest) {
  try {
    console.log('📝 POST /api/posts - Starting...')
    
    // Authentication check
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
    if (!session?.user) {
      console.log('❌ Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', session.user.id)

    const formData = await req.formData()
    const content = formData.get('content') as string
    const postMode = formData.get('postMode') as string || 'post'
    const title = formData.get('title') as string
    const feeling = formData.get('feeling') as string
    const location = formData.get('location') as string
    const latitude = formData.get('latitude') as string
    const longitude = formData.get('longitude') as string
    const isAnonymous = formData.get('isAnonymous') === 'true'
    
    const files = formData.getAll('files') as File[]

    console.log(`📝 Creating ${postMode}:`, {
      userId: session.user.id,
      contentLength: content?.length || 0,
      filesCount: files.length,
      isAnonymous,
      hasLocation: !!location,
      hasCoordinates: !!(latitude && longitude)
    })

    // Validate required content
    if (!content?.trim() && files.length === 0) {
      console.log('❌ Validation failed - no content or files')
      return NextResponse.json({ error: 'Post content or media is required' }, { status: 400 })
    }

    if (postMode === 'article' && !title?.trim()) {
      console.log('❌ Validation failed - no article title')
      return NextResponse.json({ error: 'Article title is required' }, { status: 400 })
    }

    // Process file uploads
    const uploadedFiles = {
      images: [] as string[],
      videos: [] as string[],
      audios: [] as string[],
      documents: [] as string[]
    }

    for (const file of files) {
      if (file && file.size > 0) {
        try {
          const fileType = getFileType(file)
          const filename = await uploadFile(file, fileType)
          uploadedFiles[fileType].push(filename)
          console.log(`✅ Uploaded ${fileType}: ${filename}`)
        } catch (error) {
          console.error(`❌ Upload failed for ${file.name}:`, error)
        }
      }
    }

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      console.log('🔄 Creating user in database...')
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email!,
          username: session.user.email!.split('@')[0],
          firstName: session.user.user_metadata?.firstName || session.user.user_metadata?.name || 'User',
          lastName: session.user.user_metadata?.lastName || '',
          passwordHash: '', // Not used with Supabase auth
          profileImageUrl: session.user.user_metadata?.avatar_url || null,
        }
      })
      console.log('✅ User created:', user.id)
    }

    // Create post with enhanced data
    const postData = {
      userId: session.user.id,
      authorId: session.user.id,
      content: content?.trim() || '',
      type: postMode === 'article' ? 'article' : 'user-post',
      ...(postMode === 'article' && title && { title: title.trim() }),
      ...(feeling && { feeling }),
      ...(location && { location }),
      ...(latitude && longitude && {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }),
      isAnonymous: isAnonymous,
      // File attachments
      ...(uploadedFiles.images.length > 0 && { images: uploadedFiles.images.join(',') }),
      ...(uploadedFiles.videos.length > 0 && { videos: uploadedFiles.videos.join(',') }),
      ...(uploadedFiles.audios.length > 0 && { audios: uploadedFiles.audios.join(',') }),
      ...(uploadedFiles.documents.length > 0 && { documents: uploadedFiles.documents.join(',') }),
    }

    console.log('🔄 Creating post in database...')
    const post = await prisma.post.create({
      data: postData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            email: true
          }
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            email: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    })

    console.log('✅ Post created successfully:', post.id)

    // Return post data with anonymous handling
    const responsePost = {
      ...post,
      // Completely hide user info for anonymous posts
      user: isAnonymous ? {
        id: 'anonymous',
        firstName: 'Anonymous',
        lastName: '',
        profileImageUrl: null,
        email: ''
      } : post.user,
      author: isAnonymous ? {
        id: 'anonymous',
        firstName: 'Anonymous',
        lastName: '',
        profileImageUrl: null,
        email: ''
      } : post.author,
      // Include engagement stats
      likes_count: post._count.likes,
      comments_count: post._count.comments,
      shares_count: post.shares || 0
    }

    return NextResponse.json(responsePost, { status: 201 })

  } catch (error) {
    console.error('❌ Post creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('📖 GET /api/posts - Starting...')
    
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    console.log(`📄 Fetching posts: page=${page}, limit=${limit}`)

    const posts = await prisma.post.findMany({
      where: {
        isDeleted: false
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            email: true
          }
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            email: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Handle anonymous posts in response
    const responsePosts = posts.map(post => ({
      ...post,
      // Hide user info for anonymous posts
      user: (post as any).isAnonymous ? {
        id: 'anonymous',
        firstName: 'Anonymous',
        lastName: '',
        profileImageUrl: null,
        email: ''
      } : post.user,
      author: (post as any).isAnonymous ? {
        id: 'anonymous',
        firstName: 'Anonymous',
        lastName: '',
        profileImageUrl: null,
        email: ''
      } : post.author,
      likes_count: post._count.likes,
      comments_count: post._count.comments,
      shares_count: post.shares || 0
    }))

    console.log(`✅ Fetched ${responsePosts.length} posts`)

    return NextResponse.json({
      posts: responsePosts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
        count: posts.length
      }
    })

  } catch (error) {
    console.error('❌ Posts fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 