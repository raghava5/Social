// Test script to verify auth functionality

// Import the mock auth client directly for testing
const { mockAuthClient } = require('../lib/mock-auth')

async function main() {
  // Test email and password
  const testEmail = 'test@example.com'
  const testPassword = 'password123'
  
  console.log('Testing mock auth signup and login...')
  
  // Test signup
  console.log(`1. Creating test user: ${testEmail}`)
  const signupResult = await mockAuthClient.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        firstName: 'Test',
        lastName: 'User'
      }
    }
  })
  
  console.log('Signup result:', {
    success: !signupResult.error,
    error: signupResult.error,
    user: signupResult.data?.user ? {
      id: signupResult.data.user.id,
      email: signupResult.data.user.email
    } : null
  })
  
  // Test login with same credentials
  console.log(`\n2. Logging in with credentials: ${testEmail}`)
  const loginResult = await mockAuthClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  })
  
  console.log('Login result:', {
    success: !loginResult.error,
    error: loginResult.error,
    session: loginResult.data?.session ? 'Session created' : null
  })
  
  // Test login with wrong password
  console.log('\n3. Testing login with incorrect password')
  const wrongLoginResult = await mockAuthClient.auth.signInWithPassword({
    email: testEmail,
    password: 'wrongpassword'
  })
  
  console.log('Incorrect login result:', {
    success: !wrongLoginResult.error,
    error: wrongLoginResult.error
  })
  
  // Debug mock auth state
  console.log('\n4. Current mock auth state:')
  const { data: { session } } = await mockAuthClient.auth.getSession()
  console.log('Session exists:', !!session)
  
  return { success: true }
}

// Run the test
main()
  .then(() => {
    console.log('\nTest completed')
    process.exit(0)
  })
  .catch(e => {
    console.error('Test error:', e)
    process.exit(1)
  }) 