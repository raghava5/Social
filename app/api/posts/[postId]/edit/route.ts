import { NextResponse } from 'next/server'
import { getOptimizedPrisma } from '@/lib/prisma-optimized'
import { uploadToS3 } from '@/lib/s3'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    
    // Get user from session
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    
    // Handle both JSON and FormData
    let body: any
    let files: File[] = []
    
    const contentType = req.headers.get('content-type')
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData (with files)
      const formData = await req.formData()
      body = {
        content: formData.get('content'),
        feeling: formData.get('feeling'),
        location: formData.get('location'),
        tags: formData.get('tags')
      }
      files = formData.getAll('files') as File[]
    } else {
      // Handle JSON (without files)
      body = await req.json()
    }

    const { content, images, videos, feeling, location, tags } = body

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 })
    }

    console.log(`Edit post request: postId=${postId}, userId=${userId}`)

    const prisma = getOptimizedPrisma()

    // Verify the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.authorId !== userId && post.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Handle new file uploads
            const newImageUrls: string[] = []
        const newVideoUrls: string[] = []

    if (files.length > 0) {
      try {
        for (const file of files) {
          const url = await uploadToS3(file)
          if (file.type.startsWith('image/')) {
            newImageUrls.push(url)
          } else if (file.type.startsWith('video/')) {
            newVideoUrls.push(url)
          }
        }
      } catch (uploadError) {
        console.error('Error uploading files:', uploadError)
        return NextResponse.json({ error: 'Failed to upload media files' }, { status: 500 })
      }
    }

    // Combine existing and new media URLs
    const existingImages = images || post.images || ''
    const existingVideos = videos || post.videos || ''
    
    const finalImages = newImageUrls.length > 0 
      ? newImageUrls.join(',') 
      : existingImages

    const finalVideos = newVideoUrls.length > 0 
      ? newVideoUrls.join(',') 
      : existingVideos

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content: content.trim(),
        images: finalImages || null,
        videos: finalVideos || null,
        feeling: feeling || null,
        location: location || null,
        tags: tags ? (Array.isArray(tags) ? tags.join(',') : tags) : null,
        isEdited: true,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true
          }
        },
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    console.log(`Post edited successfully: ${postId}`)

    return NextResponse.json({
      success: true,
      post: {
        id: updatedPost.id,
        content: updatedPost.content,
        images: updatedPost.images,
        videos: updatedPost.videos,
        feeling: updatedPost.feeling,
        location: updatedPost.location,
        tags: updatedPost.tags ? updatedPost.tags.split(',') : [],
        isEdited: updatedPost.isEdited,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt,
        author: {
          id: updatedPost.author.id,
          name: `${updatedPost.author.firstName} ${updatedPost.author.lastName}`,
          profileImageUrl: updatedPost.author.profileImageUrl
        },
        likes: updatedPost.likes,
        comments: updatedPost.comments,
        likeCount: updatedPost._count.likes,
        commentCount: updatedPost._count.comments
      }
    })
  } catch (error) {
    console.error('Error editing post:', error)
    return NextResponse.json(
      { error: 'Failed to edit post' },
      { status: 500 }
    )
  }
} 
// Support PUT method as well (alias for PATCH)
export const PUT = PATCH
