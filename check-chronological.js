const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('🕒 Recent posts (newest first):');
    posts.forEach((post, index) => {
      const authorName = `${post.author.firstName} ${post.author.lastName}`;
      const timeAgo = Math.round((Date.now() - new Date(post.createdAt).getTime()) / 1000 / 60);
      console.log(`  ${index + 1}. ${authorName} - ${timeAgo}m ago - ${post.content.substring(0, 40)}... [Spoke: ${post.spoke || 'None'}]`);
    });

    // Verify chronological ordering
    let isChronological = true;
    for (let i = 1; i < posts.length; i++) {
      if (new Date(posts[i-1].createdAt) < new Date(posts[i].createdAt)) {
        isChronological = false;
        break;
      }
    }

    console.log(`\n📅 Chronological ordering: ${isChronological ? '✅ CORRECT' : '❌ INCORRECT'}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentPosts(); 