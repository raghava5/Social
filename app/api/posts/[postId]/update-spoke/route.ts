import { NextRequest, NextResponse } from 'next/server'
import { CacheService, CacheKeys } from '../../../../../lib/redis'
import { websocketManager } from '../../../../../lib/websocket-manager'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { spoke } = await request.json()
    const postId = params.postId

    if (!postId || !spoke) {
      return NextResponse.json(
        { error: 'Post ID and spoke are required' },
        { status: 400 }
      )
    }

    // Validate spoke value
    const validSpokes = [
      'Spiritual', 'Mental', 'Physical', 'Personal', 'Professional',
      'Financial', 'Social', 'Societal', 'Fun & Recreation'
    ]

    if (!validSpokes.includes(spoke)) {
      return NextResponse.json(
        { error: 'Invalid spoke value' },
        { status: 400 }
      )
    }

    // TODO: Update database with actual Prisma call
    // For now, we'll simulate the update
    console.log(`📝 Updating post ${postId} with spoke: ${spoke}`)

    // Invalidate cached post
    await CacheService.del(CacheKeys.POST(postId))

    // Broadcast spoke update to real-time clients
    await websocketManager.broadcast('post_spoke_updated', {
      postId,
      spoke
    })

    return NextResponse.json({
      success: true,
      postId,
      spoke,
      message: 'Post spoke updated successfully'
    })

  } catch (error) {
    console.error('Update spoke error:', error)
    return NextResponse.json(
      { error: 'Failed to update post spoke' },
      { status: 500 }
    )
  }
} 