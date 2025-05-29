'use client'

import React from 'react'

interface NavigationDotsProps {
  totalPosts: number
  currentIndex: number
  onNavigate: (index: number) => void
}

export default function NavigationDots({ totalPosts, currentIndex, onNavigate }: NavigationDotsProps) {
  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-[105] flex flex-col space-y-3">
      {Array.from({ length: totalPosts }, (_, index) => (
        <button
          key={index}
          onClick={() => onNavigate(index)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            index === currentIndex
              ? 'bg-white scale-125 shadow-lg'
              : 'bg-white/40 hover:bg-white/70'
          }`}
          aria-label={`Go to post ${index + 1}`}
        />
      ))}
      
      {/* Progress indicator */}
      <div className="mt-4 flex flex-col items-center">
        <div className="text-white/70 text-xs font-medium">
          {currentIndex + 1}/{totalPosts}
        </div>
        <div className="w-px h-8 bg-white/20 mt-2">
          <div 
            className="w-full bg-white transition-all duration-500"
            style={{ 
              height: `${((currentIndex + 1) / totalPosts) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  )
} 