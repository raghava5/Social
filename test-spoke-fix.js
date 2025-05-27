/**
 * Test Script: Spoke Detection Fix Verification
 * Tests the fixed spoke detection system for photos and videos
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testSpokeDetectionFix() {
  try {
    console.log('🎯 Testing FIXED spoke detection system...')
    
    // Get or create a test user
    let testUser = await prisma.user.findUnique({
      where: { email: 'spoketest@spokewheels.com' }
    })
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: 'spoke-test-user-fix',
          email: 'spoketest@spokewheels.com',
          username: 'spoketest',
          firstName: 'Spoke',
          lastName: 'Tester',
          passwordHash: 'dummy-hash'
        }
      })
      console.log('✅ Created test user:', testUser.id)
    }

    // Test cases for different media types
    const testCases = [
      {
        type: 'text',
        content: "Just finished an amazing workout at the gym! 💪 Feeling strong and healthy after my fitness routine.",
        expectedSpoke: 'Physical',
        description: 'Text post with fitness content'
      },
      {
        type: 'image',
        content: "Beautiful sunset from my vacation! 🌅",
        images: "/uploads/sunset-beach.jpg,/uploads/vacation-photo.jpg",
        expectedSpoke: 'Fun & Recreation',
        description: 'Image post with travel content'
      },
      {
        type: 'video',
        content: "Check out my cooking tutorial! 👨‍🍳",
        videos: "/uploads/cooking-tutorial.mp4",
        expectedSpoke: 'Personal',
        description: 'Video post with cooking content'
      },
      {
        type: 'video_fitness',
        content: "My morning workout routine video",
        videos: "/uploads/fitness-routine.mp4",
        expectedSpoke: 'Physical',
        description: 'Video post with fitness content'
      },
      {
        type: 'image_social',
        content: "Family gathering for my birthday celebration! 🎉 Love spending time with everyone.",
        images: "/uploads/family-photo.jpg",
        expectedSpoke: 'Social',
        description: 'Image post with social content'
      }
    ]

    const results = []

    for (const [index, testCase] of testCases.entries()) {
      console.log(`\n🔍 Test ${index + 1}: ${testCase.description}`)
      console.log(`   Content: "${testCase.content}"`)
      console.log(`   Expected spoke: ${testCase.expectedSpoke}`)
      
      const startTime = Date.now()
      
      // Create the post
      const post = await prisma.post.create({
        data: {
          content: testCase.content,
          images: testCase.images || null,
          videos: testCase.videos || null,
          userId: testUser.id,
          authorId: testUser.id,
          type: 'user-post'
        }
      })
      
      console.log(`   📝 Created post: ${post.id}`)
      
      // Test the spoke detection API directly
      const response = await fetch('http://localhost:3000/api/ai/process-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId: post.id, 
          action: 'detect_spoke' 
        })
      })
      
      const processingTime = Date.now() - startTime
      
      if (response.ok) {
        const result = await response.json()
        const detectedSpoke = result.spoke
        
        // Verify the post was updated
        const updatedPost = await prisma.post.findUnique({
          where: { id: post.id }
        })
        
        const success = detectedSpoke === testCase.expectedSpoke
        const status = success ? '✅ SUCCESS' : '❌ FAILED'
        
        console.log(`   ${status}: Detected "${detectedSpoke}" (expected "${testCase.expectedSpoke}")`)
        console.log(`   ⏱️ Processing time: ${processingTime}ms`)
        console.log(`   💾 Database updated: ${updatedPost?.spoke || 'None'}`)
        
        results.push({
          test: testCase.description,
          type: testCase.type,
          expected: testCase.expectedSpoke,
          detected: detectedSpoke,
          success,
          processingTime,
          postId: post.id
        })
        
      } else {
        const errorText = await response.text()
        console.log(`   ❌ API ERROR: ${response.status} - ${errorText}`)
        
        results.push({
          test: testCase.description,
          type: testCase.type,
          expected: testCase.expectedSpoke,
          detected: null,
          success: false,
          error: errorText,
          processingTime,
          postId: post.id
        })
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Summary
    console.log('\n📊 SPOKE DETECTION FIX TEST RESULTS:')
    console.log('=' .repeat(60))
    
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length
    
    console.log(`Overall Success Rate: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`)
    console.log('')
    
    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌'
      console.log(`${index + 1}. ${status} ${result.test}`)
      console.log(`   Type: ${result.type}`)
      console.log(`   Expected: ${result.expected}`)
      console.log(`   Detected: ${result.detected || 'None'}`)
      console.log(`   Time: ${result.processingTime}ms`)
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      console.log('')
    })
    
    // Test specific media type performance
    const textTests = results.filter(r => r.type === 'text')
    const imageTests = results.filter(r => r.type.includes('image'))
    const videoTests = results.filter(r => r.type.includes('video'))
    
    console.log('📈 PERFORMANCE BY MEDIA TYPE:')
    console.log(`Text Posts: ${textTests.filter(r => r.success).length}/${textTests.length} success`)
    console.log(`Image Posts: ${imageTests.filter(r => r.success).length}/${imageTests.length} success`)
    console.log(`Video Posts: ${videoTests.filter(r => r.success).length}/${videoTests.length} success`)
    
    if (successCount === totalCount) {
      console.log('\n🎉 ALL TESTS PASSED! Spoke detection is working correctly.')
    } else {
      console.log(`\n⚠️ ${totalCount - successCount} tests failed. Check the logs above for details.`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testSpokeDetectionFix()
  .catch(console.error) 