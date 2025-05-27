const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Test 1: Basic connection
    console.log('📡 Test 1: Basic Database Connection');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test 2: Simple query
    console.log('\n📊 Test 2: Simple Query Test');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test passed:', result);

    // Test 3: Count posts (this might be what's failing)
    console.log('\n📝 Test 3: Posts Table Access');
    try {
      const postCount = await prisma.post.count();
      console.log('✅ Posts table accessible, count:', postCount);
    } catch (error) {
      console.error('❌ Posts table error:', error.message);
    }

    // Test 4: Get sample posts with relations
    console.log('\n🔍 Test 4: Sample Posts Query (similar to API)');
    try {
      const posts = await prisma.post.findMany({
        where: {
          isDeleted: false,
        },
        include: {
          author: true,
          likes: true,
          comments: {
            include: {
              user: true,
              likes: true,
              replies: {
                include: {
                  user: true,
                  likes: true,
                }
              }
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
      console.log('✅ Posts query successful, found:', posts.length, 'posts');
      
      if (posts.length > 0) {
        console.log('📄 Sample post structure:');
        const sample = posts[0];
        console.log({
          id: sample.id,
          authorId: sample.authorId,
          content: sample.content?.substring(0, 50) + '...',
          hasAuthor: !!sample.author,
          likesCount: sample.likes?.length || 0,
          commentsCount: sample.comments?.length || 0,
        });
      }
    } catch (error) {
      console.error('❌ Posts query error:', error.message);
      console.error('Full error:', error);
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log('\n✅ Database test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database test failed:', error);
    process.exit(1);
  }); 