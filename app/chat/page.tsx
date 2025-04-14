'use client'

import { useState } from 'react'
import TopNav from '../components/TopNav'
import {
  UserGroupIcon,
  ChatBubbleLeftIcon,
  VideoCameraIcon,
  PhoneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  PaperAirplaneIcon,
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
    type: 'direct',
    status: 'online',
    role: 'friend',
    category: 'direct',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'Your meditation progress looks great!',
    timestamp: '5 hours ago',
    unread: false,
    type: 'direct',
    status: 'offline',
    role: 'expert',
    category: 'expert',
  },
  {
    id: 3,
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Hi, I saw your post about mindfulness...',
    timestamp: '1 day ago',
    unread: false,
    type: 'direct',
    status: 'online',
    role: 'stranger',
    category: 'stranger',
  },
  {
    id: 4,
    name: 'Tech Group',
    avatar: 'https://i.pravatar.cc/150?img=4',
    lastMessage: 'Mike: Check out this new framework!',
    timestamp: '5 hours ago',
    unread: false,
    type: 'group',
    members: 12,
    role: 'member',
    category: 'direct',
  },
  {
    id: 5,
    name: 'Meditation Circle',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Daily meditation session starting in 10 minutes',
    timestamp: '1 day ago',
    unread: false,
    type: 'event',
    members: 25,
    role: 'participant',
    category: 'direct',
  },
]

const messages = [
  {
    id: 1,
    sender: 'Sarah Wilson',
    content: 'Hey, how are you doing?',
    timestamp: '2 hours ago',
    isMe: false,
    status: 'read',
    reactions: [],
    attachments: [],
  },
  {
    id: 2,
    sender: 'You',
    content: "I'm good, thanks! How about you?",
    timestamp: '2 hours ago',
    isMe: true,
    status: 'read',
    reactions: [],
    attachments: [],
  },
  {
    id: 3,
    sender: 'Sarah Wilson',
    content: 'Doing well! Just finished that project we talked about.',
    timestamp: '1 hour ago',
    isMe: false,
    status: 'read',
    reactions: [],
    attachments: [],
  },
]

export default function Chat() {
  const [activeTab, setActiveTab] = useState('messages')
  const [selectedConversation, setSelectedConversation] = useState(conversations[0].id)
  const [messageInput, setMessageInput] = useState('')

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Chat</h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'messages'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
            Messages
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'groups'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Groups
          </button>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">{conversation.name}</h3>
                      <p className="text-xs text-gray-500">{conversation.lastMessage}</p>
                    </div>
                    <div className="ml-auto text-xs text-gray-500">
                      {conversation.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">
                        {conversations.find(c => c.id === selectedConversation)?.name}
                      </h3>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <VideoCameraIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <PhoneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isMe ? 'justify-end' : 'justify-start'
                    } mb-4`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isMe
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
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
                <div className="flex items-center">
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 mx-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <FaceSmileIcon className="h-5 w-5" />
                  </button>
                  <button className="ml-2 p-2 text-blue-600 hover:text-blue-700">
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 