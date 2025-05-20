'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingProps {
  userName?: string
  onComplete: () => void
}

export default function Onboarding({ userName = 'there', onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const totalSteps = 3
  
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        
        {step === 1 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Seven Spokes, {userName}!</h2>
            <p className="text-gray-600 mb-8">
              We're excited to have you join our community. Seven Spokes is designed to help you connect with others in meaningful ways.
            </p>
            <img 
              src="/images/onboarding-welcome.svg" 
              alt="Welcome illustration" 
              className="w-64 h-64 mx-auto mb-8 opacity-80"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <button
              onClick={nextStep}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Let's Get Started
            </button>
          </div>
        )}
        
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Our Seven Spokes</h2>
            <p className="text-gray-600 mb-6">
              Seven Spokes connects you with others through seven life dimensions:
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-blue-600 text-xs font-medium">1</span>
                </span>
                <span className="text-gray-700"><strong>Connect</strong> - Build meaningful relationships</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-green-600 text-xs font-medium">2</span>
                </span>
                <span className="text-gray-700"><strong>Activities</strong> - Join and create group events</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-purple-600 text-xs font-medium">3</span>
                </span>
                <span className="text-gray-700"><strong>Help Others</strong> - Volunteer and support others</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-red-600 text-xs font-medium">4</span>
                </span>
                <span className="text-gray-700"><strong>Be Helped</strong> - Find support when you need it</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-yellow-600 text-xs font-medium">5</span>
                </span>
                <span className="text-gray-700"><strong>Tools</strong> - Access resources and guides</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-indigo-600 text-xs font-medium">6</span>
                </span>
                <span className="text-gray-700"><strong>Games</strong> - Play and learn through games</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-pink-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-pink-600 text-xs font-medium">7</span>
                </span>
                <span className="text-gray-700"><strong>Story</strong> - Share your journey and growth</span>
              </li>
            </ul>
            <button
              onClick={nextStep}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Next
            </button>
          </div>
        )}
        
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <p className="text-gray-600 mb-6">
              Here are a few things you can do right away:
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Complete your profile</h3>
                  <p className="text-gray-600">Add a profile picture and tell others about yourself</p>
                </div>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Find your community</h3>
                  <p className="text-gray-600">Search for people and groups that share your interests</p>
                </div>
              </li>
              <li className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Join an activity</h3>
                  <p className="text-gray-600">Participate in events and activities in your area</p>
                </div>
              </li>
            </ul>
            <button
              onClick={onComplete}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 