import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('Testing Prisma connection to Supabase...')
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })
  
  try {
    // Test with a simple query first
    console.log('Attempting raw query...')
    const timestamp = await prisma.$queryRaw`SELECT NOW()`
    console.log('Raw query successful:', timestamp)
    
    // Then count users
    console.log('Counting users...')
    const userCount = await prisma.user.count()
    console.log(`Total users in database: ${userCount}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error testing Prisma connection:', error)
    return { success: false, error }
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then((result) => {
    console.log('Test completed:', result.success ? 'SUCCESS' : 'FAILED')
    if (!result.success) {
      console.error(result.error)
      process.exit(1)
    }
  })
  .catch((e) => {
    console.error('Unhandled error:', e)
    process.exit(1)
  }) 