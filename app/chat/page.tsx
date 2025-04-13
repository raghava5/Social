'use client'

import { useState } from 'react'
import TopNav from '../components/TopNav'
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  VideoCameraIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'

// Dummy data for demonstration
const conversations = [
  {
    id: 1,
    name: 'Sarah Wilson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    name: 'Tech Group',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'Mike: Check out this new framework!',
    timestamp: '5 hours ago',
    unread: false,
  },
  {
    id: 3,
    name: 'David Brown',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Thanks for the help yesterday!',
    timestamp: '1 day ago',
    unread: false,
  },
]

const messages = [
  {
    id: 1,
    sender: 'Sarah Wilson',
    content: 'Hey, how are you doing?',
    timestamp: '2 hours ago',
    isMe: false,
  },
  {
    id: 2,
    sender: 'You',
    content: "I'm good, thanks! How about you?",
    timestamp: '2 hours ago',
    isMe: true,
  },
  {
    id: 3,
    sender: 'Sarah Wilson',
    content: 'Doing well! Just finished that project we talked about.',
    timestamp: '1 hour ago',
    isMe: false,
  },
  {
    id: 4,
    sender: 'You',
    content: "That's great! How did it go?",
    timestamp: '1 hour ago',
    isMe: true,
  },
  {
    id: 5,
    sender: 'Sarah Wilson',
    content: 'Really well! The client was very happy with the results.',
    timestamp: '30 minutes ago',
    isMe: false,
  },
]

export default function Chat() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      // TODO: Implement message sending
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Messages</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation.id === conversation.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-center">
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{conversation.name}</h3>
                      <span className="text-xs text-gray-500">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unread && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-primary-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={selectedConversation.avatar}
                  alt={selectedConversation.name}
                  className="h-10 w-10 rounded-full"
                />
                <div className="ml-3">
                  <h3 className="font-medium">{selectedConversation.name}</h3>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button className="text-gray-500 hover:text-gray-700">
                  <VideoCameraIcon className="h-5 w-5" />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <PhoneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isMe ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isMe
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="flex-1 flex items-center space-x-2">
                <button type="button" className="text-gray-500 hover:text-gray-700">
                  <PaperClipIcon className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="button" className="text-gray-500 hover:text-gray-700">
                  <FaceSmileIcon className="h-5 w-5" />
                </button>
              </div>
              <button type="submit" className="btn-primary">
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 