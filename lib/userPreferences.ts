'use client'

// User preferences interface
export interface UserPreferences {
  hasCompletedOnboarding: boolean
  hideDummyContent: boolean
  theme: 'light' | 'dark' | 'system'
  // Add more preferences as needed
}

// Default preferences
const defaultPreferences: UserPreferences = {
  hasCompletedOnboarding: false,
  hideDummyContent: false,
  theme: 'system'
}

// Get user preferences from local storage
export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return defaultPreferences
  }
  
  try {
    const storedPrefs = localStorage.getItem('userPreferences')
    return storedPrefs ? JSON.parse(storedPrefs) : defaultPreferences
  } catch (error) {
    console.error('Error reading preferences:', error)
    return defaultPreferences
  }
}

// Save user preferences to local storage
export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') return
  
  try {
    const current = getUserPreferences()
    const updated = { ...current, ...preferences }
    localStorage.setItem('userPreferences', JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving preferences:', error)
  }
}

// Helper to mark onboarding as complete
export function markOnboardingComplete(): void {
  saveUserPreferences({ hasCompletedOnboarding: true })
}

// Helper to toggle hiding dummy content
export function toggleDummyContent(hide: boolean): void {
  saveUserPreferences({ hideDummyContent: hide })
}

// Check if user has completed onboarding
export function hasCompletedOnboarding(): boolean {
  return getUserPreferences().hasCompletedOnboarding
}

// Check if dummy content should be hidden
export function shouldHideDummyContent(): boolean {
  return getUserPreferences().hideDummyContent
} 