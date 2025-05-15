import { Suspense } from 'react'
import { Metadata } from 'next'
import {
  PlusIcon,
  ChartPieIcon,
  ListBulletIcon,
  ShoppingCartIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

export const metadata: Metadata = {
  title: 'Nutrition Tracker | Practical Tools',
  description: 'Plan your meals and track your nutrition with our comprehensive tool.',
}

interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  nutrition: NutritionInfo
  ingredients: string[]
  dietaryInfo: string[]
  image?: string
}

const SAMPLE_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Greek Yogurt Breakfast Bowl',
    type: 'breakfast',
    nutrition: {
      calories: 320,
      protein: 20,
      carbs: 45,
      fat: 8
    },
    ingredients: ['Greek yogurt', 'Mixed berries', 'Honey', 'Granola'],
    dietaryInfo: ['High Protein', 'Vegetarian'],
    image: '/images/meals/greek-yogurt-bowl.jpg'
  },
  // Add more sample meals...
]

function NutritionSummary() {
  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65
  }

  const current = {
    calories: 850,
    protein: 45,
    carbs: 95,
    fat: 28
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Nutrition</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Calories</span>
            <span>{current.calories} / {dailyGoals.calories} kcal</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${(current.calories / dailyGoals.calories) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Protein</span>
            <span>{current.protein}g / {dailyGoals.protein}g</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(current.protein / dailyGoals.protein) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Carbs</span>
            <span>{current.carbs}g / {dailyGoals.carbs}g</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: `${(current.carbs / dailyGoals.carbs) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Fat</span>
            <span>{current.fat}g / {dailyGoals.fat}g</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full"
              style={{ width: `${(current.fat / dailyGoals.fat) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MealCard({ meal }: { meal: Meal }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {meal.image && (
        <div className="aspect-video">
          <img
            src={meal.image}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{meal.name}</h3>
        
        <div className="mt-2 flex items-center space-x-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
            {meal.type}
          </span>
          <span className="text-sm text-gray-500">
            {meal.nutrition.calories} kcal
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <span className="block text-gray-900 font-medium">
              {meal.nutrition.protein}g
            </span>
            <span className="text-gray-500">Protein</span>
          </div>
          <div>
            <span className="block text-gray-900 font-medium">
              {meal.nutrition.carbs}g
            </span>
            <span className="text-gray-500">Carbs</span>
          </div>
          <div>
            <span className="block text-gray-900 font-medium">
              {meal.nutrition.fat}g
            </span>
            <span className="text-gray-500">Fat</span>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900">Ingredients</h4>
          <ul className="mt-2 text-sm text-gray-600 space-y-1">
            {meal.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function MealList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Meal Library</h2>
        <button className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Meal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_MEALS.map(meal => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  )
}

function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50">
        <ChartPieIcon className="h-6 w-6 text-primary-600" />
        <span className="mt-2 text-sm font-medium text-gray-900">Set Goals</span>
      </button>
      
      <button className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50">
        <ListBulletIcon className="h-6 w-6 text-primary-600" />
        <span className="mt-2 text-sm font-medium text-gray-900">Meal Plan</span>
      </button>
      
      <button className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50">
        <ShoppingCartIcon className="h-6 w-6 text-primary-600" />
        <span className="mt-2 text-sm font-medium text-gray-900">Shopping List</span>
      </button>
      
      <button className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50">
        <FunnelIcon className="h-6 w-6 text-primary-600" />
        <span className="mt-2 text-sm font-medium text-gray-900">Preferences</span>
      </button>
    </div>
  )
}

export default function NutritionTracker() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Nutrition Tracker</h1>
      <p className="mt-2 text-lg text-gray-600">
        Plan your meals and track your nutrition goals.
      </p>

      <div className="mt-8">
        <Suspense fallback={<div>Loading actions...</div>}>
          <QuickActions />
        </Suspense>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-1">
          <Suspense fallback={<div>Loading nutrition summary...</div>}>
            <NutritionSummary />
          </Suspense>
        </div>

        <div className="mt-8 lg:mt-0 lg:col-span-3">
          <Suspense fallback={<div>Loading meals...</div>}>
            <MealList />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 