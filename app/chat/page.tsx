'use client'

import { useState, useEffect } from 'react'
import TopNav from '../components/TopNav'
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  VideoCameraIcon,
  PhoneIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  BookOpenIcon,
  HeartIcon,
  ShieldCheckIcon,
  FlagIcon,
  BellIcon,
  EllipsisHorizontalIcon,
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

const events = [
  {
    id: 1,
    title: 'Morning Meditation',
    type: 'meditation',
    time: '08:00 AM',
    date: 'Today',
    participants: 15,
    status: 'upcoming',
    streamUrl: 'https://zoom.us/j/123456789',
    description: 'Join us for a peaceful morning meditation session',
  },
  {
    id: 2,
    title: 'Tech Workshop',
    type: 'workshop',
    time: '02:00 PM',
    date: 'Tomorrow',
    participants: 8,
    status: 'upcoming',
    streamUrl: 'https://zoom.us/j/987654321',
    description: 'Learn about the latest web development trends',
  },
  {
    id: 3,
    title: 'Book Club Discussion',
    type: 'book-club',
    time: '06:00 PM',
    date: 'Friday',
    participants: 12,
    status: 'upcoming',
    streamUrl: 'https://zoom.us/j/456789123',
    description: 'Discussion on "The Power of Now"',
  },
]

const groups = [
  {
    id: 1,
    name: 'Mindfulness Circle',
    avatar: 'https://i.pravatar.cc/150?img=4',
    members: 45,
    type: 'support',
    lastActivity: '2 hours ago',
    privacy: 'public',
    description: 'A supportive community for mindfulness practice',
    resources: [
      { id: 1, name: 'Meditation Guide', type: 'pdf' },
      { id: 2, name: 'Weekly Schedule', type: 'doc' },
    ],
  },
  {
    id: 2,
    name: 'Tech Enthusiasts',
    avatar: 'https://i.pravatar.cc/150?img=5',
    members: 120,
    type: 'interest',
    lastActivity: '1 hour ago',
    privacy: 'private',
    description: 'Tech discussions and knowledge sharing',
    resources: [
      { id: 1, name: 'Project Guidelines', type: 'pdf' },
      { id: 2, name: 'Code Repository', type: 'link' },
    ],
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
  const [messageCategory, setMessageCategory] = useState('direct')
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() || selectedFile) {
      // TODO: Implement message sending with file upload
      console.log('Sending message:', { text: newMessage, file: selectedFile })
      setNewMessage('')
      setSelectedFile(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <div className="w-1/4 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-4">
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === 'messages'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('messages')}
              >
                Messages
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === 'groups'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('groups')}
              >
                Groups
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === 'events'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('events')}
              >
                Events
              </button>
            </div>
          </div>

          {activeTab === 'messages' && (
            <>
              <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-2">
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md ${
                      messageCategory === 'direct'
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => setMessageCategory('direct')}
                  >
                    Direct
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md ${
                      messageCategory === 'stranger'
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => setMessageCategory('stranger')}
                  >
                    Stranger
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium rounded-md ${
                      messageCategory === 'expert'
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => setMessageCategory('expert')}
                  >
                    Expert
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100%-8rem)]">
                {conversations
                  .filter((conversation) => conversation.category === messageCategory)
                  .map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation.id === conversation.id ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <img
                            src={conversation.avatar}
                            alt={conversation.name}
                            className="h-10 w-10 rounded-full"
                          />
                          {conversation.status === 'online' && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
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
                          {conversation.type === 'group' && (
                            <span className="text-xs text-gray-500">
                              {conversation.members} members
                            </span>
                          )}
                        </div>
                        {conversation.unread && (
                          <div className="ml-2 h-2 w-2 rounded-full bg-primary-500" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {activeTab === 'groups' && (
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <img
                      src={group.avatar}
                      alt={group.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{group.name}</h3>
                        <span className="text-xs text-gray-500">
                          {group.lastActivity}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{group.members} members</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{group.type}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{group.privacy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-full">
                      <CalendarDaysIcon className="h-6 w-6 text-primary-500" />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{event.title}</h3>
                        <span className="text-xs text-gray-500">
                          {event.time}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{event.date}</span>
                        <span className="mx-2">•</span>
                        <span>{event.participants} participants</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={selectedConversation.avatar}
                  alt={selectedConversation.name}
                  className="h-10 w-10 rounded-full"
                />
                <div className="ml-3">
                  <h3 className="font-medium">{selectedConversation.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.type === 'group'
                      ? `${selectedConversation.members} members`
                      : selectedConversation.status === 'online'
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                {selectedConversation.type === 'event' && (
                  <button className="btn-primary text-sm">
                    Join Event
                  </button>
                )}
                <button className="text-gray-500 hover:text-gray-700">
                  <VideoCameraIcon className="h-5 w-5" />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <PhoneIcon className="h-5 w-5" />
                </button>
                {selectedConversation.type === 'group' && (
                  <button className="text-gray-500 hover:text-gray-700">
                    <UserGroupIcon className="h-5 w-5" />
                  </button>
                )}
                <button className="text-gray-500 hover:text-gray-700">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
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
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2">
                      {/* Render attachments */}
                    </div>
                  )}
                  <div className="flex items-center justify-end mt-1 space-x-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp}
                    </span>
                    {message.isMe && (
                      <span className="text-xs opacity-70">
                        {message.status === 'read' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex space-x-1 mt-1">
                      {message.reactions.map((reaction, index) => (
                        <span key={index}>{reaction}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="file-upload"
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <PaperClipIcon className="h-5 w-5" />
                </label>
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    setIsTyping(true)
                    // Reset typing indicator after 3 seconds
                    setTimeout(() => setIsTyping(false), 3000)
                  }}
                />
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <FaceSmileIcon className="h-5 w-5" />
                </button>
              </div>
              <button type="submit" className="btn-primary">
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
            {selectedFile && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => setSelectedFile(null)}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 