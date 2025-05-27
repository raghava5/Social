const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        id: { in: ['cmb60uai700098o6vzoft75ir', 'cmb60y485000d8o6vt1sboziq'] }
      },
      include: { transcript: true }
    });
    
    console.log('🔍 DEBUGGING POSTS WITHOUT SPOKE TAGS:');
    console.log('='.repeat(60));
    
    posts.forEach((post, index) => {
      console.log(`\n📝 POST ${index + 1}:`);
      console.log(`ID: ${post.id}`);
      console.log(`Content: "${post.content}"`);
      console.log(`Images: ${post.images || 'None'}`);
      console.log(`Videos: ${post.videos || 'None'}`);
      console.log(`Current Spoke: ${post.spoke || 'None'}`);
      console.log(`Transcript: ${post.transcript?.fullText || 'None'}`);
      console.log(`Created: ${post.createdAt}`);
      
      // Analyze content manually
      const content = post.content.toLowerCase();
      console.log(`\n🔍 MANUAL ANALYSIS:`);
      
      // Check for keywords
      const keywords = {
        'Physical': ['workout', 'exercise', 'fitness', 'gym', 'training', 'sports', 'running', 'yoga'],
        'Fun & Recreation': ['travel', 'vacation', 'fun', 'entertainment', 'music', 'party', 'celebration'],
        'Personal': ['cooking', 'tutorial', 'diy', 'learning', 'skill', 'hobby', 'personal'],
        'Social': ['family', 'friends', 'gathering', 'wedding', 'birthday', 'together'],
        'Professional': ['work', 'business', 'meeting', 'project', 'team', 'career'],
        'Spiritual': ['meditation', 'prayer', 'spiritual', 'mindfulness'],
        'Mental': ['therapy', 'mental', 'stress', 'anxiety', 'wellbeing'],
        'Financial': ['money', 'investment', 'financial', 'budget'],
        'Societal': ['politics', 'activism', 'charity', 'volunteering']
      };
      
      let foundKeywords = [];
      for (const [spoke, words] of Object.entries(keywords)) {
        for (const word of words) {
          if (content.includes(word)) {
            foundKeywords.push({ spoke, word });
          }
        }
      }
      
      if (foundKeywords.length > 0) {
        console.log(`Found keywords:`, foundKeywords);
      } else {
        console.log(`❌ No keywords found in content`);
      }
      
      // Check content length
      console.log(`Content length: ${post.content.length} characters`);
      console.log(`Content words: ${post.content.split(' ').length} words`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPosts(); 