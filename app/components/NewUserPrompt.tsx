'use client'

import React from 'react'
import { UserGroupIcon, ChatBubbleLeftIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface NewUserPromptProps {
  type: 'people' | 'chat' | 'generic'
  onHide?: () => void
}

const NewUserPrompt: React.FC<NewUserPromptProps> = ({ type, onHide }) => {
  const router = useRouter()
  
  const getTitleAndContent = () => {
    switch (type) {
      case 'people':
        return {
          icon: <UserGroupIcon className="h-8 w-8 text-blue-500" aria-hidden="true" />,
          title: 'Connect with People & Communities',
          description: "This is where you'll find people, groups, and events that match your interests. As you explore, we'll suggest connections that align with your journey.",
          buttonText: 'Explore Recommendations',
          buttonAction: () => {
            // Future implementation could route to recommendations page
            if (onHide) onHide()
          },
        }
        
      case 'chat':
        return {
          icon: <ChatBubbleLeftIcon className="h-8 w-8 text-indigo-500" aria-hidden="true" />,
          title: 'Start Meaningful Conversations',
          description: "Connect through direct messages, group discussions, or even anonymous chats about topics that matter to you. Your chat history will appear here.",
          buttonText: 'Find Conversations',
          buttonAction: () => {
            // Future implementation could show conversation suggestions
            if (onHide) onHide()
          },
        }
        
      default:
        return {
          icon: <SparklesIcon className="h-8 w-8 text-purple-500" aria-hidden="true" />,
          title: 'Welcome to Seven Spokes',
          description: "You're just getting started! Explore this section to discover content tailored to your interests and goals.",
          buttonText: 'Explore Features',
          buttonAction: () => {
            if (onHide) onHide()
          },
        }
    }
  }
  
  const { icon, title, description, buttonText, buttonAction } = getTitleAndContent()
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-blue-50">
          {icon}
        </div>
      </div>
      <h2 className="text-lg font-medium text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="flex space-x-4 justify-center">
        <button
          onClick={buttonAction}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {buttonText}
        </button>
        {onHide && (
          <button
            onClick={onHide}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Show Example Content
          </button>
        )}
      </div>
    </div>
  )
}

export default NewUserPrompt 