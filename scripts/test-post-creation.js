#!/usr/bin/env node
const fetch = require('node-fetch');
const FormData = require('form-data');

// Configuration
const API_URL = 'http://localhost:3004/api/posts';
const TEST_CONTENT = 'This is a test post from the command line ' + Date.now();

async function createPost() {
  console.log('🚀 Testing post creation API...');
  
  try {
    // Create form data with test content
    const formData = new FormData();
    formData.append('content', TEST_CONTENT);
    formData.append('type', 'user-post');
    
    console.log(`Sending POST request to ${API_URL}`);
    console.log(`Content: ${TEST_CONTENT}`);
    
    // Send POST request
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        // Add any necessary headers here
      }
    });
    
    // Check if request was successful
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Post created successfully!');
      console.log('Post ID:', data.id);
      console.log('Created at:', new Date(data.createdAt).toLocaleString());
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to create post:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing post creation:', error.message);
    return false;
  }
}

// Run the test
createPost().then(success => {
  if (success) {
    console.log('\n✅ API test completed successfully');
    process.exit(0);
  } else {
    console.log('\n❌ API test failed');
    process.exit(1);
  }
}); 