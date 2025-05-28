'use client'

import React from 'react'
import { 
  Squares2X2Icon, 
  RectangleStackIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface ViewModeToggleProps {
  viewMode: 'traditional' | 'fullscreen'
  onViewModeChange: (mode: 'traditional' | 'fullscreen') => void
}

export default function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="fixed top-6 left-6 z-40 bg-black/30 backdrop-blur-sm rounded-full p-1 border border-white/20">
      <div className="flex space-x-2">
        <button
          onClick={() => onViewModeChange('traditional')}
          className={`p-3 rounded-full transition-all duration-200 ${
            viewMode === 'traditional'
              ? 'bg-white text-black shadow-lg'
              : 'text-white hover:bg-white/20'
          }`}
          title="Traditional Feed"
        >
          <RectangleStackIcon className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => onViewModeChange('fullscreen')}
          className={`p-3 rounded-full transition-all duration-200 ${
            viewMode === 'fullscreen'
              ? 'bg-white text-black shadow-lg'
              : 'text-white hover:bg-white/20'
          }`}
          title="Immersive Full-Screen"
        >
          <SparklesIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
} 