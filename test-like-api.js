#!/usr/bin/env node

const testLikeAPI = async () => {
  console.log('🧪 Testing Like API Functionality')
  console.log('==================================')

  const baseUrl = 'http://localhost:3000'
  const testPostId = 'test-post-123'
  const testUserId = 'test-user-456'

  try {
    // Test 1: Like a post
    console.log('\n1. Testing POST like...')
    const likeResponse = await fetch(`${baseUrl}/api/posts/${testPostId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId
      })
    })

    console.log(`Status: ${likeResponse.status}`)
    
    if (likeResponse.ok) {
      const likeData = await likeResponse.json()
      console.log('✅ Like API Response:', likeData)
    } else {
      const errorData = await likeResponse.text()
      console.log('❌ Like API Error:', errorData)
    }

    // Test 2: Unlike the post
    console.log('\n2. Testing POST unlike...')
    const unlikeResponse = await fetch(`${baseUrl}/api/posts/${testPostId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId
      })
    })

    console.log(`Status: ${unlikeResponse.status}`)
    
    if (unlikeResponse.ok) {
      const unlikeData = await unlikeResponse.json()
      console.log('✅ Unlike API Response:', unlikeData)
    } else {
      const errorData = await unlikeResponse.text()
      console.log('❌ Unlike API Error:', errorData)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }

  console.log('\n📋 Test Summary:')
  console.log('- Like API should return 200 with success: true')
  console.log('- Unlike API should return 200 with success: true')
  console.log('- Both should include liked status and likeCount')
  console.log('- No 500 errors should occur')
}

// Run the test
testLikeAPI() 