/**
 * Test Enhanced Spoke Detection System
 * Tests the specific minimal content cases that were failing
 */

async function testEnhancedSpokeDetection() {
  console.log('🧪 Testing Enhanced Spoke Detection System...\n')
  
  // Test cases from the actual failing posts
  const testCases = [
    {
      content: "hi image, lets start the jog",
      expected: "Physical",
      hasMedia: true,
      description: "Actual failing post #1 - should detect 'jog' as Physical"
    },
    {
      content: "hi lets learn some english",
      expected: "Personal", 
      hasMedia: false,
      description: "Actual failing post #2 - should detect 'learn english' as Personal"
    },
    // Additional edge cases
    {
      content: "going to gym",
      expected: "Physical",
      hasMedia: false,
      description: "Short physical activity"
    },
    {
      content: "family dinner",
      expected: "Social",
      hasMedia: false,
      description: "Family activity"
    },
    {
      content: "work meeting",
      expected: "Professional",
      hasMedia: false,
      description: "Work activity"
    },
    {
      content: "save money",
      expected: "Financial",
      hasMedia: false,
      description: "Financial activity"
    },
    {
      content: "morning run",
      expected: "Physical",
      hasMedia: false,
      description: "Physical exercise"
    },
    {
      content: "study session",
      expected: "Personal",
      hasMedia: false,
      description: "Learning activity"
    },
    {
      content: "meditation time",
      expected: "Spiritual",
      hasMedia: false,
      description: "Spiritual practice"
    },
    {
      content: "hello world",
      expected: null, // This should likely fail detection
      hasMedia: false,
      description: "Generic greeting - should fail"
    }
  ]
  
  let passedTests = 0
  let totalTests = testCases.length
  
  console.log(`Running ${totalTests} test cases...\n`)
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`📝 Test ${i + 1}: "${testCase.content}"`)
    console.log(`   Expected: ${testCase.expected || 'No detection'}`)
    console.log(`   Description: ${testCase.description}`)
    
    try {
      // Test the enhanced detection
      const result = await testProcessEventsAPI(testCase.content, testCase.hasMedia)
      
      if (result.success && result.spoke === testCase.expected) {
        console.log(`   ✅ PASSED: Detected "${result.spoke}" (method: ${result.method || 'API'})`)
        passedTests++
      } else if (!result.success && testCase.expected === null) {
        console.log(`   ✅ PASSED: Correctly failed to detect spoke`)
        passedTests++
      } else {
        console.log(`   ❌ FAILED: Expected "${testCase.expected}", got "${result.spoke || 'none'}"`)
        if (result.details) {
          console.log(`   📊 Details: ${result.details}`)
        }
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`)
    }
    
    console.log() // Empty line for readability
  }
  
  // Summary
  console.log('📊 TEST SUMMARY:')
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`)
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Enhanced spoke detection is working correctly.')
  } else if (passedTests >= totalTests * 0.8) {
    console.log('⚠️ Most tests passed. Some edge cases may need refinement.')
  } else {
    console.log('🚨 Multiple tests failed. Enhanced spoke detection needs improvements.')
  }
  
  return { passed: passedTests, total: totalTests, percentage: Math.round(passedTests/totalTests*100) }
}

/**
 * Test the process-events API with enhanced detection
 */
async function testProcessEventsAPI(content, hasMedia = false) {
  try {
    // First create a test post
    const createResponse = await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        feeling: null,
        location: null,
        spoke: null,
        type: 'user-post',
        tags: [],
        ...(hasMedia ? { uploadedImageUrl: 'test-image.jpg' } : {})
      })
    })
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create test post: ${createResponse.status}`)
    }
    
    const postData = await createResponse.json()
    const postId = postData.id
    
    console.log(`   🔄 Created test post: ${postId}`)
    
    // Wait a moment for the automatic spoke detection
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check if spoke was detected
    const checkResponse = await fetch(`http://localhost:3000/api/posts/${postId}`)
    if (checkResponse.ok) {
      const updatedPost = await checkResponse.json()
      const detectedSpoke = updatedPost.spoke
      
      // Clean up test post
      await fetch(`http://localhost:3000/api/posts/${postId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permanent: true })
      })
      
      return {
        success: !!detectedSpoke,
        spoke: detectedSpoke,
        method: 'automatic'
      }
    }
    
    return {
      success: false,
      spoke: null,
      details: 'Failed to check post after creation'
    }
    
  } catch (error) {
    console.error('Test API error:', error)
    return {
      success: false,
      spoke: null,
      details: error.message
    }
  }
}

/**
 * Test the AI detect-spoke API directly
 */
async function testAIDetectionAPI(content, isMinimalContent = true) {
  try {
    const response = await fetch('http://localhost:3000/api/ai/detect-spoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: content,
        isMinimalContent,
        hasMedia: false,
        context: 'Testing enhanced spoke detection for minimal content'
      })
    })
    
    if (!response.ok) {
      throw new Error(`AI API failed: ${response.status}`)
    }
    
    const result = await response.json()
    return {
      success: !!result.spoke,
      spoke: result.spoke,
      confidence: result.confidence,
      method: 'AI'
    }
    
  } catch (error) {
    return {
      success: false,
      spoke: null,
      details: error.message
    }
  }
}

/**
 * Test just the specific failing cases
 */
async function testFailingCases() {
  console.log('🎯 Testing Specific Failing Cases...\n')
  
  const failingCases = [
    "hi image, lets start the jog",
    "hi lets learn some english"
  ]
  
  for (const content of failingCases) {
    console.log(`📝 Testing: "${content}"`)
    
    // Test AI API directly
    const aiResult = await testAIDetectionAPI(content, true)
    console.log(`   🤖 AI Result: ${aiResult.spoke || 'none'} (confidence: ${aiResult.confidence || 0})`)
    
    // Test full process
    const fullResult = await testProcessEventsAPI(content, content.includes('image'))
    console.log(`   🔄 Full Process: ${fullResult.spoke || 'none'}`)
    
    console.log()
  }
}

// Run the tests
if (require.main === module) {
  console.log('🚀 Starting Enhanced Spoke Detection Tests...\n')
  
  testEnhancedSpokeDetection()
    .then(results => {
      console.log('\n🎯 Testing specific failing cases...')
      return testFailingCases()
    })
    .then(() => {
      console.log('\n✅ Testing complete!')
    })
    .catch(error => {
      console.error('❌ Testing failed:', error)
    })
}

module.exports = { testEnhancedSpokeDetection, testFailingCases } 