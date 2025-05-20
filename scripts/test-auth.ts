// Test script to verify auth functionality
import { createClient } from '../lib/supabase'

async function main() {
  // Create auth client
  const supabase = createClient()
  
  // Test email and password
  const testEmail = 'test@example.com'
  const testPassword = 'password123'
  
  console.log('Testing auth signup and login...')
  
  // Test signup
  console.log(`1. Creating test user: ${testEmail}`)
  const signupResult = await supabase.auth.signUp({
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
  const loginResult = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  })
  
  console.log('Login result:', {
    success: !loginResult.error,
    error: loginResult.error,
    session: loginResult.data?.session ? 'Session created' : null
  })
  
  // Debug auth state
  console.log('\n3. Current auth state:')
  const { data: { session } } = await supabase.auth.getSession()
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