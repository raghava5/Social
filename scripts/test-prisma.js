// Test script to verify Prisma can create users

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Testing Prisma database connection...')
  
  try {
    // Generate a test email with timestamp to avoid duplicates
    const testEmail = `test${Date.now()}@example.com`
    const testUsername = `testuser${Date.now()}`
    
    console.log(`Creating test user with email ${testEmail}...`)
    
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        username: testUsername,
        firstName: 'Test',
        lastName: 'User',
        passwordHash: 'test-hash',
        isVerified: false,
        profile: {
          create: {
            // Empty profile
          }
        }
      }
    })
    
    console.log('User created successfully:', user)
    
    // Count all users
    const userCount = await prisma.user.count()
    console.log(`Total users in database: ${userCount}`)
    
    return { success: true, user }
  } catch (error) {
    console.error('Error testing Prisma:', error)
    return { success: false, error }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
main()
  .then(result => {
    console.log('Test completed with result:', result.success ? 'SUCCESS' : 'FAILURE')
    process.exit(result.success ? 0 : 1)
  })
  .catch(e => {
    console.error('Unexpected error during test:', e)
    process.exit(1)
  }) 