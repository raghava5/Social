#!/usr/bin/env node
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

// Test script to verify image upload functionality
async function testImageUpload() {
  console.log('🧪 Testing image upload functionality...');
  
  try {
    // Create a simple test image file (1x1 pixel PNG)
    const testImageData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, // color type and CRC
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, // compressed data
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, // CRC
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
      0x42, 0x60, 0x82
    ]);
    
    // Save test image temporarily
    fs.writeFileSync('test-image.png', testImageData);
    
    // Create form data
    const formData = new FormData();
    formData.append('content', 'Testing image upload with a test image 🖼️');
    formData.append('type', 'user-post');
    formData.append('files', fs.createReadStream('test-image.png'), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    console.log('📤 Sending POST request with image...');
    
    // Send POST request to local server
    const response = await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      body: formData,
      headers: {
        // Let fetch set the content-type with boundary for multipart/form-data
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Post created successfully!');
      console.log('Post ID:', data.id);
      console.log('Images:', data.images);
      console.log('Videos:', data.videos);
      
      if (data.images) {
        console.log('🎉 Image upload working correctly!');
      } else {
        console.log('⚠️  Post created but no images field found');
      }
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to create post:', response.status, errorData);
    }
    
    // Cleanup
    fs.unlinkSync('test-image.png');
    
  } catch (error) {
    console.error('❌ Error testing image upload:', error.message);
    
    // Cleanup on error
    try {
      fs.unlinkSync('test-image.png');
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  testImageUpload();
}

module.exports = { testImageUpload }; 