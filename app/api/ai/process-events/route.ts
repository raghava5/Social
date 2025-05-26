import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Background service to process posts for spoke detection
 * This will handle existing posts that don't have spoke tags
 */
export async function POST(request: NextRequest) {
  try {
    const { postId, action } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    // Get the post from database
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true
          }
        },
        transcript: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let detectedSpoke: string | null = null;

    // Step 1: Analyze text content for spoke
    detectedSpoke = await analyzeTextForSpoke(post.content);

    if (!detectedSpoke) {
      // Step 2: Analyze media content
      if (post.videos && post.transcript?.fullText) {
        detectedSpoke = await analyzeVideoForSpoke(post.transcript.fullText);
      } else if (post.images) {
        detectedSpoke = await analyzeImageForSpoke(post.images);
      }
    }

    // Update post with detected spoke
    if (detectedSpoke) {
      await prisma.post.update({
        where: { id: postId },
        data: { spoke: detectedSpoke }
      });

      // Broadcast real-time update
      if (global.io) {
        global.io.emit('post_spoke_updated', {
          postId: post.id,
          spoke: detectedSpoke
        });
      }

      console.log(`🎯 Auto-detected spoke "${detectedSpoke}" for post ${postId}`);
    }

    // If this is a new post, broadcast it to feeds
    if (action === 'new_post') {
      const formattedPost = {
        id: post.id,
        authorId: post.authorId,
        content: post.content,
        images: post.images,
        videos: post.videos,
        likes: 0, // TODO: Get actual like count
        comments: 0, // TODO: Get actual comment count
        shares: post.shares || 0,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        spoke: detectedSpoke || post.spoke,
        location: post.location,
        feeling: post.feeling,
        tags: post.tags ? post.tags.split(',') : [],
        author: {
          id: post.author.id,
          name: `${post.author.firstName} ${post.author.lastName}`,
          profileImageUrl: post.author.profileImageUrl
        }
      };

      // Broadcast new post to all connected users
      if (global.io) {
        global.io.emit('new_post', {
          post: formattedPost,
          action: 'prepend'
        });
      }

      console.log(`📡 Broadcasted new post ${postId} to all users`);
    }

    return NextResponse.json({
      success: true,
      postId,
      spoke: detectedSpoke, // Frontend expects 'spoke' not 'detectedSpoke'
      detectedSpoke,
      message: `Post processed successfully`
    });
  } catch (error) {
    console.error('Process events error:', error);
    return NextResponse.json(
      { error: 'Failed to process post' },
      { status: 500 }
    );
  }
}

/**
 * Analyze text content for spoke keywords
 */
async function analyzeTextForSpoke(content: string): Promise<string | null> {
  const spokeKeywords = {
    'Spiritual': ['spiritual', 'meditation', 'prayer', 'faith', 'soul', 'mindfulness', 'zen', 'enlightenment', 'divine', 'sacred', 'peace', 'wisdom', 'blessing'],
    'Mental': ['mental', 'psychology', 'anxiety', 'depression', 'therapy', 'counseling', 'mind', 'thoughts', 'emotions', 'stress', 'wellbeing', 'cognitive', 'brain'],
    'Physical': ['fitness', 'workout', 'exercise', 'gym', 'health', 'running', 'yoga', 'sports', 'physical', 'body', 'strength', 'training', 'muscle', 'cardio'],
    'Personal': ['personal', 'self', 'growth', 'development', 'goals', 'habits', 'reflection', 'journal', 'diary', 'me', 'improvement', 'learning', 'skills'],
    'Professional': ['work', 'career', 'job', 'professional', 'business', 'office', 'meeting', 'project', 'team', 'leadership', 'workplace', 'corporate', 'management'],
    'Financial': ['money', 'financial', 'investment', 'savings', 'budget', 'income', 'expenses', 'wealth', 'economy', 'finance', 'cost', 'price', 'dollar', 'economic'],
    'Social': ['friends', 'family', 'social', 'relationships', 'community', 'networking', 'people', 'connection', 'love', 'friendship', 'together', 'group', 'children', 'parents', 'mother', 'father', 'brother', 'sister'],
    'Societal': ['society', 'politics', 'news', 'social issues', 'community service', 'volunteering', 'activism', 'charity', 'justice', 'equality', 'government', 'public'],
    'Fun & Recreation': ['fun', 'entertainment', 'games', 'movies', 'music', 'travel', 'adventure', 'hobby', 'recreation', 'leisure', 'vacation', 'party', 'celebration', 'enjoy']
  };

  const contentLower = content.toLowerCase();
  let bestMatch: { spoke: string; score: number } = { spoke: '', score: 0 };

  for (const [spoke, keywords] of Object.entries(spokeKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    
    if (score > bestMatch.score) {
      bestMatch = { spoke, score };
    }
  }

  // Return spoke if confidence is high enough (lowered threshold for better detection)
  if (bestMatch.score >= 1) {
    console.log(`🎯 Detected spoke: ${bestMatch.spoke} (confidence: ${bestMatch.score})`);
    return bestMatch.spoke;
  } else if (bestMatch.score >= 0.5) {
    console.log(`⚠️ Low confidence (${bestMatch.score}), but accepting for media posts`);
    return bestMatch.spoke; // Accept lower confidence for media posts
  }
  console.log(`❌ No spoke detected (confidence: ${bestMatch.score})`);
  return null;
}

/**
 * Analyze video transcript for spoke
 */
async function analyzeVideoForSpoke(transcriptText: string): Promise<string | null> {
  try {
    // First try keyword analysis
    const spokeFromKeywords = await analyzeTextForSpoke(transcriptText);
    if (spokeFromKeywords) {
      return spokeFromKeywords;
    }

    // Fallback to AI analysis
    const response = await fetch('http://localhost:3000/api/ai/detect-spoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: transcriptText })
    });

    if (response.ok) {
      const result = await response.json();
      return result.spoke || null;
    }

    return null;
  } catch (error) {
    console.error('Video spoke analysis failed:', error);
    return null;
  }
}

/**
 * Analyze image for spoke using CLIP
 */
async function analyzeImageForSpoke(imagePaths: string): Promise<string | null> {
  try {
    const firstImage = imagePaths.split(',')[0];
    
    const response = await fetch('http://localhost:3000/api/ai/analyze-image-spoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePath: firstImage })
    });

    if (response.ok) {
      const result = await response.json();
      return result.spoke || null;
    }

    return null;
  } catch (error) {
    console.error('Image spoke analysis failed:', error);
    return null;
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