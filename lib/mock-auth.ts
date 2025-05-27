/**
 * Mock authentication helper for development
 */

export const isMockAuthEnabled = (): boolean => {
  return process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
}

export const getMockUser = () => {
  return {
    id: 'mock-user-1',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    profileImageUrl: '/images/avatars/default.svg'
  }
}

export const mockSignIn = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (email === 'demo@example.com' && password === 'password123') {
    return { success: true, user: getMockUser() }
  }
  
  return { success: false, error: 'Invalid credentials' }
}
