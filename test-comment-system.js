#!/usr/bin/env node
const fetch = require('node-fetch');

async function testCommentSystem() {
  console.log('🧪 Testing comment system...');
  
  try {
    // First, test fetching posts to see comment structure
    console.log('📤 Fetching posts to check comment structure...');
    
    const response = await fetch('http://localhost:3003/api/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Posts fetched successfully!');
      
      if (data.posts && data.posts.length > 0) {
        const firstPost = data.posts[0];
        console.log('📊 First post structure:');
        console.log('- ID:', firstPost.id);
        console.log('- Content:', firstPost.content.substring(0, 50) + '...');
        console.log('- Comments count:', firstPost.comments?.length || 0);
        console.log('- Comments structure:');
        
        if (firstPost.comments && firstPost.comments.length > 0) {
          const firstComment = firstPost.comments[0];
          console.log('  - Comment ID:', firstComment.id);
          console.log('  - Comment content:', firstComment.content);
          console.log('  - Comment user:', firstComment.user?.firstName, firstComment.user?.lastName);
          console.log('  - Comment created:', firstComment.createdAt);
        } else {
          console.log('  - No comments found');
        }
        
        console.log('\n🎯 Comment structure looks correct!');
      } else {
        console.log('⚠️  No posts found in response');
      }
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to fetch posts:', response.status, errorData);
    }
    
  } catch (error) {
    console.error('❌ Error testing comment system:', error.message);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  testCommentSystem();
}

module.exports = { testCommentSystem }; 