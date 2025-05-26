/**
 * Direct Test for Spoke Detection
 * Tests the specific post ID mentioned by the user: "cmb4os8s600058oylq3yqpudr"
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testDirectSpokeDetection() {
  try {
    console.log('🎯 Testing direct spoke detection...')
    
    // Test the specific post ID mentioned by the user
    const problemPostId = 'cmb4os8s600058oylq3yqpudr'
    
    // Get the post from database
    const post = await prisma.post.findUnique({
      where: { id: problemPostId },
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
    })

    if (!post) {
      console.log(`❌ Post ${problemPostId} not found or was deleted`)
      return
    }

    console.log(`📝 Found post: ${post.id}`)
    console.log(`   Content: ${post.content.substring(0, 100)}...`)
    console.log(`   Images: ${post.images || 'None'}`)
    console.log(`   Videos: ${post.videos || 'None'}`)
    console.log(`   Current spoke: ${post.spoke || 'None'}`)
    console.log(`   Has transcript: ${post.transcript ? 'Yes' : 'No'}`)

    if (post.transcript) {
      console.log(`   Transcript preview: ${post.transcript.fullText?.substring(0, 100)}...`)
    }

    let detectedSpoke = null

    // Step 1: Analyze text content for spoke
    console.log('\n🔍 Step 1: Analyzing text content...')
    detectedSpoke = analyzeTextForSpoke(post.content)
    console.log(`   Result: ${detectedSpoke || 'No spoke detected'}`)

    if (!detectedSpoke) {
      // Step 2: Analyze media content
      if (post.videos && post.transcript?.fullText) {
        console.log('\n🔍 Step 2: Analyzing video transcript...')
        detectedSpoke = analyzeTextForSpoke(post.transcript.fullText)
        console.log(`   Result: ${detectedSpoke || 'No spoke detected'}`)
      } else if (post.images) {
        console.log('\n🔍 Step 2: Would analyze image (skipping for this test)...')
        console.log(`   Images to analyze: ${post.images}`)
      }
    }

    // Update post with detected spoke
    if (detectedSpoke) {
      console.log(`\n✅ Detected spoke: ${detectedSpoke}`)
      
      await prisma.post.update({
        where: { id: problemPostId },
        data: { spoke: detectedSpoke }
      })
      
      console.log(`🎯 Updated post ${problemPostId} with spoke: ${detectedSpoke}`)
    } else {
      console.log(`\n❌ No spoke detected for post ${problemPostId}`)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Analyze text content for spoke keywords
 */
function analyzeTextForSpoke(content) {
  const spokeKeywords = {
    'Spiritual': ['spiritual', 'meditation', 'prayer', 'faith', 'soul', 'mindfulness', 'zen', 'enlightenment', 'divine', 'sacred'],
    'Mental': ['mental', 'psychology', 'anxiety', 'depression', 'therapy', 'counseling', 'mind', 'thoughts', 'emotions', 'stress'],
    'Physical': ['fitness', 'workout', 'exercise', 'gym', 'health', 'running', 'yoga', 'sports', 'physical', 'body'],
    'Personal': ['personal', 'self', 'growth', 'development', 'goals', 'habits', 'reflection', 'journal', 'diary', 'me', 'cooking'],
    'Professional': ['work', 'career', 'job', 'professional', 'business', 'office', 'meeting', 'project', 'team', 'leadership', 'strategy', 'quarterly'],
    'Financial': ['money', 'financial', 'investment', 'savings', 'budget', 'income', 'expenses', 'wealth', 'economy', 'finance'],
    'Social': ['friends', 'family', 'social', 'relationships', 'community', 'networking', 'people', 'connection', 'love', 'friendship', 'loved ones'],
    'Societal': ['society', 'politics', 'news', 'social issues', 'community service', 'volunteering', 'activism', 'charity', 'justice', 'equality'],
    'Fun & Recreation': ['fun', 'entertainment', 'games', 'movies', 'music', 'travel', 'adventure', 'hobby', 'recreation', 'leisure', 'sunset', 'photos']
  }

  const contentLower = content.toLowerCase()
  let bestMatch = { spoke: '', score: 0, keywords: [] }

  for (const [spoke, keywords] of Object.entries(spokeKeywords)) {
    let score = 0
    const foundKeywords = []
    
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = contentLower.match(regex)
      if (matches) {
        score += matches.length
        foundKeywords.push(keyword)
      }
    }
    
    if (score > bestMatch.score) {
      bestMatch = { spoke, score, keywords: foundKeywords }
    }
  }

  if (bestMatch.score >= 1) {
    console.log(`   🔍 Found keywords: [${bestMatch.keywords.join(', ')}] → ${bestMatch.spoke} (score: ${bestMatch.score})`)
  }

  // Return spoke if confidence is high enough
  return bestMatch.score >= 1 ? bestMatch.spoke : null
}

// Run the test
testDirectSpokeDetection() 