#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');

// Create a Prisma client
const prisma = new PrismaClient();

async function verifyPostTable() {
  console.log('🔍 Verifying that the Post table exists...');
  
  try {
    // Check if we can query the Post table
    console.log('Running test query on Post table...');
    const postCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "Post"`;
    
    console.log('✅ Post table exists!');
    console.log('Post count:', postCount[0].count);
    
    // Try to create a test post
    console.log('\nCreating a test post...');
    const testPost = await prisma.post.create({
      data: {
        content: 'This is a test post created at ' + new Date().toISOString(),
        userId: await getOrCreateTestUser(),
        authorId: await getOrCreateTestUser(),
        type: 'test-post'
      }
    });
    
    console.log('✅ Test post created successfully:');
    console.log('- Post ID:', testPost.id);
    console.log('- Content:', testPost.content);
    console.log('- Created at:', testPost.createdAt);
    
    return true;
  } catch (error) {
    console.error('❌ Error verifying Post table:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function getOrCreateTestUser() {
  try {
    // Try to find an existing test user
    const testUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { startsWith: 'test_' } },
          { email: { startsWith: 'test_' } }
        ]
      }
    });
    
    if (testUser) {
      return testUser.id;
    }
    
    // Create a test user if none exists
    const newUser = await prisma.user.create({
      data: {
        username: `test_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        passwordHash: 'test_hash',
        firstName: 'Test',
        lastName: 'User',
      }
    });
    
    return newUser.id;
  } catch (error) {
    console.error('Error getting/creating test user:', error);
    throw error;
  }
}

// Run the verification
verifyPostTable().then(success => {
  if (success) {
    console.log('\n✅ Verification completed successfully. The Post table exists and is working.');
    process.exit(0);
  } else {
    console.log('\n❌ Verification failed. There may still be issues with the Post table.');
    process.exit(1);
  }
}); 