import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true
      }
    })

    console.log(`Total users: ${users.length}`)
    console.log('\nUsers:')
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Email: ${user.email}`)
      console.log(`   Name: ${user.firstName} ${user.lastName}`)
      console.log(`   Posts: ${user.posts.length}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers() 