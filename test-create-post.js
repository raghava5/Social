const FormData = require('form-data');
const fetch = require('node-fetch');

async function testCreatePost() {
  try {
    console.log('🧪 Testing post creation API...');
    
    // Create form data
    const formData = new FormData();
    formData.append('content', 'Test post from API');
    formData.append('postMode', 'post');
    formData.append('isAnonymous', 'false');
    
    // Test the API
    const response = await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      body: formData,
      headers: {
        // Add a mock session header for testing
        'Cookie': 'test=true'
      }
    });
    
    console.log('Response status:', response.status);
    const result = await response.text();
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ API is working!');
    } else {
      console.log('❌ API failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCreatePost(); 