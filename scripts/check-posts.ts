import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPosts() {
  try {
    // First find the user
    const user = await prisma.user.findUnique({
      where: {
        email: 'raghavarockz5@gmail.com'
      },
      include: {
        posts: true
      }
    })

    if (!user) {
      console.log('User not found')
      return
    }

    console.log(`Found user: ${user.email}`)
    console.log(`Total posts: ${user.posts.length}`)
    console.log('\nPosts:')
    user.posts.forEach((post, index) => {
      console.log(`\n${index + 1}. Content: ${post.content}`)
      console.log(`   Created at: ${post.createdAt}`)
      console.log(`   Images: ${post.images || 'None'}`)
      console.log(`   Videos: ${post.videos || 'None'}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPosts() 