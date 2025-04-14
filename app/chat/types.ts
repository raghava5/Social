// Message types
export type Message = {
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
export type Conversation = {
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
export const conversations: Conversation[] = [
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
export const messages: Message[] = [
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