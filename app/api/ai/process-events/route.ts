import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enhancedSpokeDetection } from '@/lib/enhanced-spoke-detection';

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

    console.log(`🔍 Starting spoke detection for post ${postId}...`)
    console.log(`📝 Content: "${post.content.substring(0, 100)}..."`)
    console.log(`🖼️ Images: ${post.images ? 'Yes' : 'No'}`)
    console.log(`🎥 Videos: ${post.videos ? 'Yes' : 'No'}`)
    console.log(`📄 Transcript: ${post.transcript?.fullText ? 'Yes' : 'No'}`)

    // Step 1: Enhanced spoke detection for text content
    console.log(`🔍 Using enhanced spoke detection for content: "${post.content}"`);
    
    // Try enhanced detection first for better results on minimal content
    const enhancedResult = await enhancedSpokeDetection(post.content, !!(post.images || post.videos));
    if (enhancedResult) {
      detectedSpoke = enhancedResult.spoke;
      console.log(`✅ Enhanced detection found: ${detectedSpoke} (${enhancedResult.confidence}, ${enhancedResult.method})`);
    } else {
      // Fallback to original method for longer content
      detectedSpoke = await analyzeTextForSpoke(post.content);
      if (detectedSpoke) {
        console.log(`✅ Fallback detection found: ${detectedSpoke}`)
      }
    }

    if (!detectedSpoke) {
      // Step 2: Analyze media content
      if (post.videos) {
        console.log(`🎥 Analyzing video content...`)
        if (post.transcript?.fullText) {
          console.log(`📄 Using existing transcript for analysis`)
          detectedSpoke = await analyzeVideoForSpoke(post.transcript.fullText);
        } else {
          console.log(`⏳ No transcript available yet, analyzing video content from text`)
          // Fallback: Try to detect from video-related keywords in content
          detectedSpoke = await analyzeVideoContentFallback(post.content, post.videos);
        }
        
        if (detectedSpoke) {
          console.log(`✅ Spoke detected from video: ${detectedSpoke}`)
        }
      } else if (post.images) {
        console.log(`🖼️ Analyzing image content...`)
        detectedSpoke = await analyzeImageForSpoke(post.images);
        
        if (!detectedSpoke) {
          console.log(`🔄 Image analysis failed, trying content-based fallback`)
          // Fallback: Analyze image-related keywords in content
          detectedSpoke = await analyzeImageContentFallback(post.content, post.images);
        }
        
        if (detectedSpoke) {
          console.log(`✅ Spoke detected from image: ${detectedSpoke}`)
        }
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
 * Analyze text content for spoke keywords with enhanced detection for minimal content
 */
async function analyzeTextForSpoke(content: string): Promise<string | null> {
  // 🎯 ENHANCED SPOKE DETECTION FOR MINIMAL CONTENT
  const spokeKeywords = {
    'Spiritual': ['spiritual', 'meditation', 'prayer', 'faith', 'soul', 'mindfulness', 'zen', 'enlightenment', 'divine', 'sacred', 'peace', 'wisdom', 'blessing', 'pray', 'god', 'universe', 'chakra', 'karma'],
    'Mental': ['mental', 'psychology', 'anxiety', 'depression', 'therapy', 'counseling', 'mind', 'thoughts', 'emotions', 'stress', 'wellbeing', 'cognitive', 'brain', 'think', 'thinking', 'feel', 'feeling', 'mood', 'relax'],
    'Physical': ['fitness', 'workout', 'exercise', 'gym', 'health', 'running', 'yoga', 'sports', 'physical', 'body', 'strength', 'training', 'muscle', 'cardio', 'jog', 'jogging', 'walk', 'walking', 'swim', 'swimming', 'run', 'bike', 'hiking', 'stretch', 'lift'],
    'Personal': ['personal', 'self', 'growth', 'development', 'goals', 'habits', 'reflection', 'journal', 'diary', 'me', 'improvement', 'learning', 'skills', 'learn', 'study', 'education', 'tutorial', 'course', 'lesson', 'practice', 'read', 'book', 'skill', 'hobby', 'cook', 'cooking', 'english', 'language'],
    'Professional': ['work', 'career', 'job', 'professional', 'business', 'office', 'meeting', 'project', 'team', 'leadership', 'workplace', 'corporate', 'management', 'interview', 'client', 'presentation', 'strategy'],
    'Financial': ['money', 'financial', 'investment', 'savings', 'budget', 'income', 'expenses', 'wealth', 'economy', 'finance', 'cost', 'price', 'dollar', 'economic', 'invest', 'save', 'spend', 'buy', 'sell'],
    'Social': ['friends', 'family', 'social', 'relationships', 'community', 'networking', 'people', 'connection', 'love', 'friendship', 'together', 'group', 'children', 'parents', 'mother', 'father', 'brother', 'sister', 'friend', 'party', 'gathering'],
    'Societal': ['society', 'politics', 'news', 'social issues', 'community service', 'volunteering', 'activism', 'charity', 'justice', 'equality', 'government', 'public', 'volunteer', 'help', 'community'],
    'Fun & Recreation': ['fun', 'entertainment', 'games', 'movies', 'music', 'travel', 'adventure', 'hobby', 'recreation', 'leisure', 'vacation', 'party', 'celebration', 'enjoy', 'game', 'movie', 'song', 'trip', 'holiday', 'beach', 'nature']
  };

  // 🔍 ENHANCED FUZZY MATCHING for minimal content
  const contentLower = content.toLowerCase();
  let bestMatch: { spoke: string; score: number; matches: string[] } = { spoke: '', score: 0, matches: [] };

  for (const [spoke, keywords] of Object.entries(spokeKeywords)) {
    let score = 0;
    const foundMatches: string[] = [];
    
    for (const keyword of keywords) {
      // Method 1: Exact word boundary match (highest confidence)
      const exactRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const exactMatches = contentLower.match(exactRegex);
      if (exactMatches) {
        score += exactMatches.length * 2; // Higher weight for exact matches
        foundMatches.push(`exact:${keyword}`);
      }
      
      // Method 2: Partial/fuzzy match for short content (lower confidence)
      else if (contentLower.includes(keyword) && content.length <= 50) {
        score += 0.5; // Lower weight for fuzzy matches
        foundMatches.push(`fuzzy:${keyword}`);
      }
      
      // Method 3: Contextual inference for very short posts
      else if (content.length <= 30) {
        // Special handling for ultra-short posts
        if (keyword === 'jog' && (contentLower.includes('jog') || contentLower.includes('run'))) {
          score += 1.5;
          foundMatches.push(`context:${keyword}`);
        }
        if (keyword === 'learn' && (contentLower.includes('learn') || contentLower.includes('study') || contentLower.includes('english'))) {
          score += 1.5;
          foundMatches.push(`context:${keyword}`);
        }
      }
    }
    
    if (score > bestMatch.score) {
      bestMatch = { spoke, score, matches: foundMatches };
    }
  }

  // 🎯 CONFIDENCE THRESHOLDS - More lenient for short content
  const isShortContent = content.length <= 50;
  const isVeryShortContent = content.length <= 30;
  
  let minScore = 1; // Default threshold
  if (isVeryShortContent) {
    minScore = 0.5; // Very lenient for ultra-short content
  } else if (isShortContent) {
    minScore = 0.8; // Slightly more lenient for short content
  }

  if (bestMatch.score >= minScore) {
    console.log(`🎯 Detected spoke: ${bestMatch.spoke} (confidence: ${bestMatch.score}, matches: ${bestMatch.matches.join(', ')})`);
    return bestMatch.spoke;
  }
  
  // 🤖 AI FALLBACK for minimal content that doesn't match keywords
  if (content.length <= 50 && bestMatch.score < minScore) {
    console.log(`🤖 Trying AI fallback for minimal content: "${content}"`);
    try {
      const aiSpoke = await analyzeMinimalContentWithAI(content);
      if (aiSpoke) {
        console.log(`🤖 AI detected spoke: ${aiSpoke} for minimal content`);
        return aiSpoke;
      }
    } catch (error) {
      console.warn('AI fallback failed:', error);
    }
  }
  
     console.log(`❌ No spoke detected (confidence: ${bestMatch.score}, threshold: ${minScore})`);
   return null;
}

/**
 * AI-powered analysis for minimal content that doesn't match keywords
 */
async function analyzeMinimalContentWithAI(content: string): Promise<string | null> {
  try {
    const response = await fetch('http://localhost:3000/api/ai/detect-spoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: content,
        isMinimalContent: true,
        context: 'This is very short content that may need contextual inference'
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.spoke && result.confidence > 0.4) { // Lower threshold for AI on minimal content
        return result.spoke;
      }
    }

    return null;
  } catch (error) {
    console.error('AI minimal content analysis failed:', error);
    return null;
  }
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

/**
 * Fallback video content analysis when transcript is not available
 */
async function analyzeVideoContentFallback(content: string, videoUrls: string): Promise<string | null> {
  try {
    console.log(`🎬 Analyzing video content fallback for: ${videoUrls}`)
    
    // Enhanced keyword analysis for video content
    const videoKeywords = {
      'Physical': ['workout', 'exercise', 'fitness', 'gym', 'training', 'sports', 'running', 'yoga', 'dance', 'swimming'],
      'Fun & Recreation': ['travel', 'adventure', 'vacation', 'fun', 'entertainment', 'music', 'dance', 'party', 'celebration'],
      'Personal': ['cooking', 'tutorial', 'diy', 'craft', 'learning', 'skill', 'hobby', 'personal'],
      'Social': ['family', 'friends', 'gathering', 'wedding', 'birthday', 'reunion', 'together'],
      'Professional': ['presentation', 'meeting', 'conference', 'work', 'business', 'training'],
      'Spiritual': ['meditation', 'prayer', 'spiritual', 'mindfulness', 'zen'],
      'Mental': ['therapy', 'counseling', 'mental health', 'wellbeing'],
      'Financial': ['investment', 'money', 'financial', 'budget'],
      'Societal': ['news', 'politics', 'activism', 'charity', 'volunteering']
    };

    // Analyze content with video-specific keywords
    const contentLower = content.toLowerCase();
    let bestMatch: { spoke: string; score: number } = { spoke: '', score: 0 };

    for (const [spoke, keywords] of Object.entries(videoKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = contentLower.match(regex);
        if (matches) {
          score += matches.length * 2; // Higher weight for video keywords
        }
      }
      
      if (score > bestMatch.score) {
        bestMatch = { spoke, score };
      }
    }

    if (bestMatch.score >= 1) {
      console.log(`🎬 Video fallback detected spoke: ${bestMatch.spoke} (confidence: ${bestMatch.score})`);
      return bestMatch.spoke;
    }

    return null;
  } catch (error) {
    console.error('Video content fallback analysis failed:', error);
    return null;
  }
}

/**
 * Fallback image content analysis when CLIP is not available
 */
async function analyzeImageContentFallback(content: string, imageUrls: string): Promise<string | null> {
  try {
    console.log(`🖼️ Analyzing image content fallback for: ${imageUrls}`)
    
    // Enhanced keyword analysis for image content
    const imageKeywords = {
      'Fun & Recreation': ['sunset', 'beach', 'travel', 'vacation', 'nature', 'landscape', 'adventure', 'beautiful', 'amazing'],
      'Social': ['family', 'friends', 'wedding', 'birthday', 'celebration', 'together', 'group', 'people'],
      'Physical': ['gym', 'workout', 'fitness', 'sports', 'running', 'yoga', 'exercise', 'training'],
      'Personal': ['selfie', 'me', 'personal', 'achievement', 'goal', 'progress', 'growth'],
      'Professional': ['office', 'work', 'business', 'meeting', 'conference', 'team', 'professional'],
      'Spiritual': ['temple', 'church', 'meditation', 'spiritual', 'peaceful', 'sacred'],
      'Mental': ['peaceful', 'calm', 'relaxing', 'therapy', 'wellbeing'],
      'Financial': ['money', 'investment', 'wealth', 'success', 'financial'],
      'Societal': ['protest', 'activism', 'charity', 'community', 'volunteering']
    };

    // Analyze content with image-specific keywords
    const contentLower = content.toLowerCase();
    let bestMatch: { spoke: string; score: number } = { spoke: '', score: 0 };

    for (const [spoke, keywords] of Object.entries(imageKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = contentLower.match(regex);
        if (matches) {
          score += matches.length * 1.5; // Higher weight for image keywords
        }
      }
      
      if (score > bestMatch.score) {
        bestMatch = { spoke, score };
      }
    }

    if (bestMatch.score >= 1) {
      console.log(`🖼️ Image fallback detected spoke: ${bestMatch.spoke} (confidence: ${bestMatch.score})`);
      return bestMatch.spoke;
    }

    return null;
  } catch (error) {
    console.error('Image content fallback analysis failed:', error);
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