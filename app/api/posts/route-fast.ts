import { NextResponse } from 'next/server'
import { getOptimizedPrisma } from '@/lib/prisma-optimized'
import { getCachedPosts, setCachedPosts } from '@/lib/posts-cache'

// 🚀 ULTRA-FAST GET API - SIMPLIFIED FOR MAXIMUM PERFORMANCE
export async function GET(req: Request) {
  const startTime = Date.now()
  console.log('🚀 ULTRA-FAST API START')
  
  try {
    const { searchParams } = new URL(req.url)
    const spoke = searchParams.get('spoke')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 3) // 🚀 ULTRA SMALL LIMIT
    
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
        },
      })
    }

    console.log('🗄️ CACHE MISS - Fetching from database...')

    // 🚀 NO AUTH CHECK - Skip for maximum speed
    const where = {
      isDeleted: false,
      ...(spoke ? { spoke } : {}),
      ...(type ? { type } : {}),
    }

    const prisma = getOptimizedPrisma()
    
    // 🚀 STEP 1: Get posts - ULTRA MINIMAL FIELDS
    const queryStartTime = Date.now()
    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        content: true,
        images: true,
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
      return NextResponse.json(emptyResponse)
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
      }
    })

    console.log(`⚡ Authors query: ${Date.now() - batchStartTime}ms`)

    // 🚀 STEP 3: Combine data - NO likes/comments for speed
    const processingStartTime = Date.now()
    const authorsMap = new Map(authors.map(author => [author.id, author]))

    const postsWithData = posts.map(post => ({
      id: post.id,
      content: post.content,
      images: post.images,
      feeling: post.feeling,
      spoke: post.spoke,
      createdAt: post.createdAt,
      author: authorsMap.get(post.authorId) || null,
      likesCount: 0, // Skip for speed
      commentsCount: 0, // Skip for speed
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
      },
    })
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
} 