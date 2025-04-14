'use client'

import { useState, useEffect, useRef } from 'react'
import TopNav from '../components/TopNav'
import {
  UserGroupIcon,
  ChatBubbleLeftIcon,
  VideoCameraIcon,
  PhoneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  PaperAirplaneIcon,
  UserIcon,
  StarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CalendarIcon,
  MegaphoneIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
  LockClosedIcon,
  UsersIcon,
  DocumentTextIcon,
  PhotoIcon,
  MicrophoneIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  TrophyIcon,
  BellIcon,
  CogIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline'

// Message types
type Message = {
  id: string
  content: string
  sender: string
  timestamp: string
  isMe: boolean
  status: 'sent' | 'delivered' | 'read'
  reactions?: { emoji: string; count: number }[]
  attachments?: { type: 'image' | 'video' | 'file' | 'voice'; url: string; name?: string }[]
  isEdited?: boolean
  isDeleted?: boolean
}

// Conversation types
type Conversation = {
  id: string
  name: string
  type: 'direct' | 'expert' | 'random' | 'group'
  avatar?: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline?: boolean
  isTyping?: boolean
  members?: number
  isPinned?: boolean
  isMuted?: boolean
  expertInfo?: {
    badge: string
    rating: number
    availability: 'available' | 'busy' | 'offline'
    waitTime?: string
  }
  groupInfo?: {
    isAdmin: boolean
    isPrivate: boolean
    memberCount: number
    announcement?: string
  }
}

// Dummy data for conversations
const conversations: Conversation[] = [
  {
    id: '1',
    name: 'Sarah Wilson',
    type: 'direct',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2 hours ago',
    unreadCount: 2,
    isOnline: true,
    isTyping: false,
    isPinned: true,
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    type: 'expert',
    lastMessage: 'Your meditation progress looks great!',
    timestamp: '5 hours ago',
    unreadCount: 0,
    isOnline: false,
    expertInfo: {
      badge: 'Certified Meditation Expert',
      rating: 4.8,
      availability: 'available',
      waitTime: '5 min',
    },
  },
  {
    id: '3',
    name: 'Random Chat',
    type: 'random',
    lastMessage: 'Hi, I saw your post about mindfulness...',
    timestamp: '1 day ago',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '4',
    name: 'Mindfulness Circle',
    type: 'group',
    lastMessage: 'Mike: Check out this new framework!',
    timestamp: '5 hours ago',
    unreadCount: 5,
    members: 12,
    groupInfo: {
      isAdmin: true,
      isPrivate: false,
      memberCount: 45,
      announcement: 'Weekly meditation session tomorrow at 10 AM',
    },
  },
]

// Dummy data for messages
const messages: Message[] = [
  {
    id: '1',
    content: 'Hey, how are you doing?',
    sender: 'Sarah Wilson',
    timestamp: '2 hours ago',
    isMe: false,
    status: 'read',
    reactions: [{ emoji: '👍', count: 2 }],
  },
  {
    id: '2',
    content: "I'm good, thanks! How about you?",
    timestamp: '2 hours ago',
    sender: 'You',
    isMe: true,
    status: 'read',
  },
  {
    id: '3',
    content: 'Doing well! Just finished that project we talked about.',
    timestamp: '1 hour ago',
    sender: 'Sarah Wilson',
    isMe: false,
    status: 'read',
    attachments: [
      {
        type: 'image',
        url: 'https://example.com/image.jpg',
      },
    ],
  },
]

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState('messages')
  const [messageCategory, setMessageCategory] = useState('direct')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim() || selectedFile) {
      // TODO: Implement message sending with file upload
      console.log('Sending message:', { text: messageInput, file: selectedFile })
      setMessageInput('')
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
              {activeTab === 'messages' && (
                <div className="p-4 border-b border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setMessageCategory('direct')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md ${
                        messageCategory === 'direct'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <UserIcon className="h-5 w-5 mx-auto" />
                      Direct
                    </button>
                    <button
                      onClick={() => setMessageCategory('expert')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md ${
                        messageCategory === 'expert'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <StarIcon className="h-5 w-5 mx-auto" />
                      Expert
                    </button>
                    <button
                      onClick={() => setMessageCategory('random')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md ${
                        messageCategory === 'random'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <SparklesIcon className="h-5 w-5 mx-auto" />
                      Random
                    </button>
                  </div>
                </div>
              )}

              {conversations
                .filter((conv) => activeTab === 'groups' ? conv.type === 'group' : conv.type === messageCategory)
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        {conversation.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{conversation.name}</h3>
                          <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        {conversation.isTyping && (
                          <p className="text-xs text-gray-500">typing...</p>
                        )}
                        {conversation.expertInfo && (
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {conversation.expertInfo.badge} • {conversation.expertInfo.rating} ★
                            </span>
                          </div>
                        )}
                        {conversation.groupInfo && (
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {conversation.groupInfo.memberCount} members
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        <div className="ml-3">
                          <h3 className="font-medium">{selectedConversation.name}</h3>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.type === 'group'
                              ? `${selectedConversation.groupInfo?.memberCount} members`
                              : selectedConversation.isOnline
                              ? 'Online'
                              : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {selectedConversation.type === 'expert' && (
                          <button className="p-2 text-gray-500 hover:text-gray-700">
                            <CalendarIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button className="p-2 text-gray-500 hover:text-gray-700">
                          <VideoCameraIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700">
                          <PhoneIcon className="h-5 w-5" />
                        </button>
                        {selectedConversation.type === 'group' && (
                          <button className="p-2 text-gray-500 hover:text-gray-700">
                            <UsersIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button className="p-2 text-gray-500 hover:text-gray-700">
                          <CogIcon className="h-5 w-5" />
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
                          {message.attachments && (
                            <div className="mt-2">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="mt-2">
                                  {attachment.type === 'image' && (
                                    <img
                                      src={attachment.url}
                                      alt="Attachment"
                                      className="max-w-full rounded-lg"
                                    />
                                  )}
                                  {attachment.type === 'file' && (
                                    <div className="flex items-center p-2 bg-gray-200 rounded">
                                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                                      <span>{attachment.name}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
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
                                <span
                                  key={index}
                                  className="text-xs bg-gray-200 px-2 py-1 rounded-full"
                                >
                                  {reaction.emoji} {reaction.count}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
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
                          value={messageInput}
                          onChange={(e) => {
                            setMessageInput(e.target.value)
                            setIsTyping(true)
                            // Reset typing indicator after 3 seconds
                            setTimeout(() => setIsTyping(false), 3000)
                          }}
                          placeholder="Type a message..."
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <FaceSmileIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
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
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 