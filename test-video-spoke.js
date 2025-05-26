/**
 * Test Video Transcript Spoke Detection
 * Creates a video post with a transcript to test video-based spoke detection
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testVideoSpokeDetection() {
  try {
    console.log('🎯 Testing video transcript spoke detection...')
    
    // Get or create a test user
    let testUser = await prisma.user.findUnique({
      where: { email: 'videotest@spokewheels.com' }
    })
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: 'video-test-user',
          email: 'videotest@spokewheels.com',
          username: 'videotest',
          firstName: 'Video',
          lastName: 'Tester',
          passwordHash: 'dummy-hash'
        }
      })
      console.log('✅ Created video test user:', testUser.id)
    }
    
    // Create a video post with minimal text but rich transcript
    const videoPost = await prisma.post.create({
      data: {
        content: "Check out this video!", // Minimal text - should rely on transcript
        videos: "/uploads/sample-fitness-video.mp4",
        userId: testUser.id,
        authorId: testUser.id,
        type: 'user-post'
      }
    })
    
    console.log(`📹 Created video post: ${videoPost.id}`)
    
    // Create a transcript with fitness-related content
    const transcript = await prisma.transcript.create({
      data: {
        postId: videoPost.id,
        videoUrl: "/uploads/sample-fitness-video.mp4",
        fullText: "Welcome to my fitness journey! Today I'm going to show you my morning workout routine. We'll start with some basic exercises, then move on to strength training at the gym. Don't forget to maintain proper physical health and stay consistent with your exercise regimen. Let's begin with some yoga poses and then transition to high-intensity cardio. Remember, fitness is a lifestyle, not just a hobby!",
        segments: [
          { start: 0, end: 5, text: "Welcome to my fitness journey!" },
          { start: 5, end: 15, text: "Today I'm going to show you my morning workout routine." },
          { start: 15, end: 25, text: "We'll start with some basic exercises, then move on to strength training at the gym." }
        ],
        status: 'completed',
        duration: 60.0
      }
    })
    
    console.log(`📝 Created transcript: ${transcript.id}`)
    console.log(`   Content preview: ${transcript.fullText.substring(0, 100)}...`)
    
    // Test the spoke detection
    console.log('\n🔍 Testing spoke detection...')
    
    const response = await fetch('http://localhost:3000/api/ai/process-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        postId: videoPost.id, 
        action: 'detect_spoke' 
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Spoke detection result:', result)
      
      // Verify the post was updated
      const updatedPost = await prisma.post.findUnique({
        where: { id: videoPost.id }
      })
      
      console.log(`🎯 Final spoke tag: ${updatedPost.spoke}`)
      
      if (updatedPost.spoke === 'Physical') {
        console.log('✅ SUCCESS: Video transcript correctly identified Physical spoke!')
      } else {
        console.log(`❌ FAILURE: Expected 'Physical', got '${updatedPost.spoke}'`)
      }
      
    } else {
      const errorText = await response.text()
      console.log('❌ Spoke detection failed:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testVideoSpokeDetection() 