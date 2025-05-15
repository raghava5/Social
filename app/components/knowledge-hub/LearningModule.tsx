'use client'

import { useState } from 'react'
import {
  BookOpenIcon,
  ClockIcon,
  ChartBarIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'

interface Module {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: string
  category: string
  progress: number
  lessons: {
    id: string
    title: string
    type: 'video' | 'text' | 'quiz'
    completed: boolean
  }[]
}

interface LearningModuleProps {
  module: Module
}

export default function LearningModule({ module }: LearningModuleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{module.title}</h3>
            <p className="mt-1 text-gray-600">{module.description}</p>
            <div className="mt-4 flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-500">
                <ChartBarIcon className="h-5 w-5 mr-1" />
                <span>{module.difficulty}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-5 w-5 mr-1" />
                <span>{module.estimatedTime}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <BookOpenIcon className="h-5 w-5 mr-1" />
                <span>{module.category}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-primary flex items-center"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            {module.progress === 0 ? 'Start Learning' : 'Continue'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(module.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${module.progress}%` }}
            />
          </div>
        </div>

        {/* Lesson list */}
        {isExpanded && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <ul className="space-y-3">
              {module.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    {lesson.type === 'video' && (
                      <PlayIcon className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    {lesson.type === 'text' && (
                      <BookOpenIcon className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <span
                      className={`${
                        lesson.completed ? 'text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {lesson.title}
                    </span>
                  </div>
                  {lesson.completed && (
                    <span className="text-green-600 text-sm">Completed</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
} 