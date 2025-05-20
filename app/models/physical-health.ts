import { User } from './user'

// Workout & Fitness Models
export interface Workout {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: number // in minutes
  bodyFocus: string[]
  videoUrl: string
  thumbnailUrl: string
  equipment: string[]
  calories: number
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutLog {
  id: string
  userId: string
  workoutId: string
  completedAt: Date
  duration: number // actual duration in minutes
  caloriesBurned: number
  notes?: string
  rating?: number // 1-5
}

export interface FitnessGoal {
  id: string
  userId: string
  type: 'Weight' | 'WorkoutFrequency' | 'Steps' | 'Custom'
  target: number
  unit: string
  startDate: Date
  targetDate: Date
  progress: number
  status: 'Active' | 'Completed' | 'Abandoned'
}

export interface FitnessStats {
  id: string
  userId: string
  date: Date
  steps: number
  caloriesBurned: number
  activeMinutes: number
  distance: number // in meters
  heartRate?: {
    min: number
    max: number
    avg: number
  }
}

// Nutrition Models
export interface Meal {
  id: string
  name: string
  description?: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  nutrition: {
    calories: number
    protein: number // in grams
    carbs: number // in grams
    fat: number // in grams
    fiber?: number // in grams
    sugar?: number // in grams
  }
  ingredients: {
    name: string
    amount: number
    unit: string
  }[]
  dietaryInfo: string[] // e.g., ['vegetarian', 'gluten-free']
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface MealLog {
  id: string
  userId: string
  mealId: string
  date: Date
  portion: number // multiplier of base portion
  notes?: string
}

export interface NutritionGoal {
  id: string
  userId: string
  type: 'calories' | 'protein' | 'carbs' | 'fat' | 'water'
  target: number
  unit: string
  startDate: Date
  endDate?: Date
  progress: number
  createdAt: Date
  updatedAt: Date
}

export interface GroceryList {
  id: string
  userId: string
  items: GroceryItem[]
  createdAt: Date
  updatedAt: Date
}

export interface GroceryItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  isChecked: boolean
  createdAt: Date
  updatedAt: Date
}

// Health Reminders Models
export interface HealthReminder {
  id: string
  userId: string
  title: string
  description?: string
  frequency: 'daily' | 'weekly' | 'custom'
  time: string // HH:mm format
  days?: string[] // ['Monday', 'Wednesday', 'Friday']
  category: string
  isActive: boolean
  lastCompleted?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ReminderLog {
  id: string
  userId: string
  reminderId: string
  completedAt: Date
  status: 'completed' | 'snoozed' | 'missed'
}

// Integration Models
export interface FitnessDevice {
  id: string
  userId: string
  type: 'Fitbit' | 'AppleHealth' | 'GoogleFit'
  accessToken: string
  refreshToken: string
  lastSynced: Date
  isActive: boolean
}

export interface HealthMetric {
  id: string
  userId: string
  type: string
  value: number
  unit: string
  source: string
  timestamp: Date
  metadata?: Record<string, any>
}

// Relationships
export interface UserPhysicalHealth {
  userId: string
  user: User
  fitnessGoals: FitnessGoal[]
  nutritionGoals: NutritionGoal[]
  workoutLogs: WorkoutLog[]
  mealLogs: MealLog[]
  reminders: HealthReminder[]
  devices: FitnessDevice[]
  metrics: HealthMetric[]
} 