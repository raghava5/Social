/**
 * Test Script for Spoke Detection
 * Tests the spoke detection functionality for a specific post
 */

const postId = 'cmb4os8s600058oylq3yqpudr'

async function testSpokeDetection() {
  try {
    console.log(`🎯 Testing spoke detection for post: ${postId}`)
    
    const response = await fetch('http://localhost:3000/api/ai/process-events', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'SpokeDetectionTest/1.0'
      },
      body: JSON.stringify({ 
        postId, 
        action: 'detect_spoke' 
      })
    })

    console.log(`Response status: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Spoke detection result:', result)
    } else {
      const errorText = await response.text()
      console.log('❌ Spoke detection failed:', errorText)
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testSpokeDetection() 