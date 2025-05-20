'use client'

import { useState, useEffect, useRef } from 'react'
import TopNav from '../components/TopNav'
import {
  UserGroupIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
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
  TagIcon,
  PlusIcon,
  MapPinIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  LanguageIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
  MoonIcon,
  ComputerDesktopIcon,
  HeartIcon,
  FireIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import DirectMessaging from '../components/messaging/ui/DirectMessaging'
import { useSocket } from '../hooks/useSocket';
import styles from './chat.module.css'

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

// Random chat types
type RandomChatPreference = {
  interests: string[]
  anonymityLevel: 'anonymous' | 'pseudonym' | 'real'
  locationRadius: 'nearby' | 'country' | 'language' | 'global'
  chatDuration: 15 | 30 | 60 | 120 // minutes
  userMood: 'lonely' | 'excited' | 'curious' | 'vent' | 'any'
  showSurpriseMe: boolean
  interestsInput?: string
}

type RandomChatUser = {
  id: string
  displayName: string
  interests: string[]
  personalityTags: string[]
  mood: string
  isAnonymous: boolean
  hasBlurredAvatar: boolean
}

type RandomChatSession = {
  id: string
  participants: RandomChatUser[]
  startTime: string
  expiresAt: string
  remainingTime: number // in seconds
  isActive: boolean
  hasCompletedVibeCheck: boolean
  icebreaker?: string
}

// Conversation types
type Conversation = {
  id: string
  name: string
  type: 'direct' | 'expert' | 'random' | 'group' | 'discussion'
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
  discussionInfo?: {
    expiresAt: string
    participants: number
    tags: string[]
    topic: string
    isPrivate: boolean
    creator: string
    progress: number
  }
  randomChatInfo?: RandomChatSession
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
    name: 'Random Chat #2391',
    type: 'random',
    lastMessage: 'Hi, I saw your post about mindfulness...',
    timestamp: '1 day ago',
    unreadCount: 0,
    isOnline: true,
    randomChatInfo: {
      id: 'rc-1',
      participants: [
        {
          id: 'user1',
          displayName: 'Anonymous',
          interests: ['Mindfulness', 'Philosophy'],
          personalityTags: ['Night Owl', 'Empath'],
          mood: 'curious',
          isAnonymous: true,
          hasBlurredAvatar: true
        },
        {
          id: 'user2',
          displayName: 'You',
          interests: ['Meditation', 'Psychology'],
          personalityTags: ['Open to venting', 'Techie'],
          mood: 'curious',
          isAnonymous: true,
          hasBlurredAvatar: true
        }
      ],
      startTime: '2023-05-01T14:30:00Z',
      expiresAt: '2023-05-01T15:30:00Z',
      remainingTime: 600, // 10 minutes
      isActive: true,
      hasCompletedVibeCheck: true,
      icebreaker: "What's something you learned recently that changed your perspective?"
    }
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
  {
    id: '5',
    name: 'Mental Health Support',
    type: 'discussion',
    lastMessage: 'Alex: What coping mechanisms work for you?',
    timestamp: '30 minutes ago',
    unreadCount: 3,
    members: 8,
    discussionInfo: {
      expiresAt: 'Expires in 14 hours',
      participants: 15,
      tags: ['mentalhealth', 'support', 'wellness'],
      topic: 'Coping with anxiety during challenging times',
      isPrivate: false,
      creator: 'Dr. Emily Johnson',
      progress: 60
    }
  },
  {
    id: '6',
    name: 'Career Growth Strategies',
    type: 'discussion',
    lastMessage: 'Lisa: Networking has been my biggest asset',
    timestamp: '2 hours ago',
    unreadCount: 0,
    members: 12,
    discussionInfo: {
      expiresAt: 'Expires in 18 hours',
      participants: 24,
      tags: ['career', 'growth', 'networking'],
      topic: 'How to advance in your field while maintaining work-life balance',
      isPrivate: false,
      creator: 'Marcus Chen',
      progress: 45
    }
  },
  {
    id: '7',
    name: 'Relationship Communication',
    type: 'discussion',
    lastMessage: 'Sophia: Active listening changed everything for us',
    timestamp: '4 hours ago',
    unreadCount: 1,
    members: 6,
    discussionInfo: {
      expiresAt: 'Expires in 22 hours',
      participants: 9,
      tags: ['relationships', 'communication', 'connection'],
      topic: 'Healthy communication patterns in long-term relationships',
      isPrivate: true,
      creator: 'Relationship Coach Jamie',
      progress: 75
    }
  },
  {
    id: '8',
    name: 'Random Chat #4576',
    type: 'random',
    lastMessage: 'I think that perspective on mental health is really interesting...',
    timestamp: '2 hours ago',
    unreadCount: 1,
    isOnline: true,
    randomChatInfo: {
      id: 'rc-2',
      participants: [
        {
          id: 'user3',
          displayName: 'Thoughtful Thinker',
          interests: ['Mental Health', 'Psychology'],
          personalityTags: ['Empath', 'Deep Thinker'],
          mood: 'curious',
          isAnonymous: false,
          hasBlurredAvatar: false
        },
        {
          id: 'user4',
          displayName: 'You',
          interests: ['Mental Health', 'Self-improvement'],
          personalityTags: ['Open to venting', 'Listener'],
          mood: 'vent',
          isAnonymous: true,
          hasBlurredAvatar: true
        }
      ],
      startTime: '2023-05-02T09:30:00Z',
      expiresAt: '2023-05-02T10:30:00Z',
      remainingTime: 2400, // 40 minutes
      isActive: true,
      hasCompletedVibeCheck: true,
      icebreaker: "What's something you've overcome that you're proud of?"
    }
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

// 1. Add mock expert data and daily limit state
const mockExperts = [
  {
    id: 'exp1',
    name: 'Dr. Emily Chen',
    avatar: '',
    verified: true,
    credentials: ['PhD Clinical Psychology', 'Certified Mindfulness Coach'],
    specialties: ['Mindfulness', 'Anxiety', 'Wellness'],
    languages: ['English', 'Mandarin'],
    badge: 'Verified Expert',
    rating: 4.9,
    reviews: 128,
    availability: 'available',
    nextAvailable: 'Today, 3:00 PM',
    portfolio: 'https://emilychen.com',
    byAppointment: false,
    groupSessions: true,
    spoke: 'Mental Health',
    summary: '10+ years experience in mindfulness and anxiety coaching.',
    featured: true,
  },
  {
    id: 'exp2',
    name: 'Alex Rivera',
    avatar: '',
    verified: true,
    credentials: ['MBA, CFA', 'Finance Mentor'],
    specialties: ['Finance Mentor', 'Budgeting', 'Investing'],
    languages: ['English', 'Spanish'],
    badge: 'Verified Expert',
    rating: 4.7,
    reviews: 89,
    availability: 'by_appointment',
    nextAvailable: 'Tomorrow, 10:00 AM',
    portfolio: 'https://alexriverafinance.com',
    byAppointment: true,
    groupSessions: true,
    spoke: 'Finance',
    summary: 'Helping young professionals master their money.',
    featured: false,
  },
  {
    id: 'exp3',
    name: 'Coach Priya Sharma',
    avatar: '',
    verified: true,
    credentials: ['Relationship Coach', 'ICF Certified'],
    specialties: ['Relationship Coach', 'Communication', 'Couples Therapy'],
    languages: ['English', 'Hindi'],
    badge: 'Verified Expert',
    rating: 4.8,
    reviews: 102,
    availability: 'offline',
    nextAvailable: 'Friday, 2:00 PM',
    portfolio: 'https://priyasharma.com',
    byAppointment: true,
    groupSessions: false,
    spoke: 'Relationships',
    summary: 'ICF-certified coach for couples and individuals.',
    featured: false,
  },
];

export default function ChatPage() {
  const {
    socket,
    joinRoom,
    leaveRoom,
    sendMessage,
    onReceiveMessage,
    emitTyping,
    onUserTyping,
    updateStatus,
    onStatusChange,
  } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState('messages')
  const [messageCategory, setMessageCategory] = useState('direct')
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Random chat states
  const [isRandomChatSetupOpen, setIsRandomChatSetupOpen] = useState(false)
  const [randomChatPreferences, setRandomChatPreferences] = useState<RandomChatPreference>({
    interests: [],
    anonymityLevel: 'anonymous',
    locationRadius: 'global',
    chatDuration: 30,
    userMood: 'any',
    showSurpriseMe: false,
    interestsInput: ''
  })
  const [availableInterests, setAvailableInterests] = useState([
    'Mental Health', 'Philosophy', 'Movies', 'Music', 'Books', 'Technology', 
    'Sports', 'Art', 'Travel', 'Food', 'Fitness', 'Career', 'Education',
    'Life Advice', 'Relationships', 'Spirituality', 'Science', 'Gaming',
    'Lonely', 'Excited', 'Frustrated', 'Hopeful', 'Confused', 'Inspired'
  ])
  const [personalityTags, setPersonalityTags] = useState([
    'Night Owl', 'Early Bird', 'Empath', 'Techie', 'Creative', 'Analytical', 
    'Open to venting', 'Deep Thinker', 'Listener', 'Adventurous', 'Introvert', 'Extrovert'
  ])
  const [selectedPersonalityTags, setSelectedPersonalityTags] = useState<string[]>([])
  const [searchingForRandomChat, setSearchingForRandomChat] = useState(false)
  const [currentRandomChatSession, setCurrentRandomChatSession] = useState<RandomChatSession | null>(null)
  const [showVibeCheckPrompt, setShowVibeCheckPrompt] = useState(false)
  const [icebreakers, setIcebreakers] = useState([
    "What's something you learned recently that changed your perspective?",
    "If you could master any skill instantly, what would you choose?",
    "What's a book/movie that influenced you deeply?",
    "Would you rather be able to fly or be invisible?",
    "What's your ideal way to spend a day off?",
    "What's something you're looking forward to?",
    "If you could have dinner with anyone in history, who would it be?",
    "What's a small thing that brings you joy?",
    "What's something you've overcome that you're proud of?",
    "What would your perfect day look like?"
  ])
  const [selectedIcebreaker, setSelectedIcebreaker] = useState('')
  const [randomChatTimer, setRandomChatTimer] = useState<NodeJS.Timeout | null>(null)
  const [remainingTime, setRemainingTime] = useState(0)
  const [timeExpired, setTimeExpired] = useState(false)

  // 2. Render expert directory in left panel when Expert tab is active
  const [showExpertProfile, setShowExpertProfile] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [dailyExpertChatCount, setDailyExpertChatCount] = useState(2); // mock: 2 chats used today
  const dailyLimit = 3;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Function to handle random chat timer
  useEffect(() => {
    if (currentRandomChatSession && currentRandomChatSession.isActive) {
      // Set initial remaining time
      setRemainingTime(currentRandomChatSession.remainingTime);
      
      // Start timer to countdown
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setRandomChatTimer(timer);
      
      // Cleanup timer on unmount
      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [currentRandomChatSession]);

  // Function to start searching for a random chat
  const handleStartRandomChat = () => {
    setSearchingForRandomChat(true);
    // In a real app, this would connect to a backend to find a match
    setTimeout(() => {
      // Simulate finding a match after 2 seconds
      const newSession: RandomChatSession = {
        id: `rc-${Math.floor(Math.random() * 10000)}`,
        participants: [
          {
            id: 'matched-user',
            displayName: randomChatPreferences.anonymityLevel === 'anonymous' 
              ? 'Anonymous' 
              : randomChatPreferences.anonymityLevel === 'pseudonym'
                ? 'Curious Explorer'
                : 'Alex Johnson',
            interests: randomChatPreferences.interests.length > 0 
              ? randomChatPreferences.interests 
              : ['Philosophy', 'Life Advice'],
            personalityTags: selectedPersonalityTags.length > 0
              ? ['Empath', 'Listener']
              : [],
            mood: randomChatPreferences.userMood,
            isAnonymous: randomChatPreferences.anonymityLevel === 'anonymous',
            hasBlurredAvatar: randomChatPreferences.anonymityLevel !== 'real'
          },
          {
            id: 'current-user',
            displayName: 'You',
            interests: randomChatPreferences.interests,
            personalityTags: selectedPersonalityTags,
            mood: randomChatPreferences.userMood,
            isAnonymous: randomChatPreferences.anonymityLevel === 'anonymous',
            hasBlurredAvatar: randomChatPreferences.anonymityLevel !== 'real'
          }
        ],
        startTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + randomChatPreferences.chatDuration * 60 * 1000).toISOString(),
        remainingTime: randomChatPreferences.chatDuration * 60,
        isActive: true,
        hasCompletedVibeCheck: false,
        icebreaker: selectedIcebreaker || icebreakers[Math.floor(Math.random() * icebreakers.length)]
      };
      
      setCurrentRandomChatSession(newSession);
      setSearchingForRandomChat(false);
      setShowVibeCheckPrompt(true);
      
      // Create a new conversation for this random chat
      const newConversation: Conversation = {
        id: `new-${Date.now()}`,
        name: `Random Chat #${Math.floor(Math.random() * 10000)}`,
        type: 'random',
        lastMessage: "You've been matched! Say hello.",
        timestamp: 'just now',
        unreadCount: 1,
        isOnline: true,
        randomChatInfo: newSession
      };
      
      // Select this conversation
      setSelectedConversation(newConversation);
    }, 2000);
  };

  // Function to handle vibe check response
  const handleVibeCheck = (isPositive: boolean) => {
    if (isPositive) {
      setShowVibeCheckPrompt(false);
      if (currentRandomChatSession) {
        setCurrentRandomChatSession({
          ...currentRandomChatSession,
          hasCompletedVibeCheck: true
        });
      }
    } else {
      // End the chat if vibe check fails
      if (randomChatTimer) {
        clearInterval(randomChatTimer);
      }
      setCurrentRandomChatSession(null);
      setSelectedConversation(null);
      setShowVibeCheckPrompt(false);
    }
  };

  // Format remaining time for display
  const formatRemainingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const messageData = {
      roomId: selectedConversation.id,
      message: messageInput,
      userId: 'current-user',
      userName: 'You'
    };

    sendMessage(messageData);
    setMessageInput('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // Function to toggle interests selection
  const toggleInterest = (interest: string) => {
    setRandomChatPreferences(prev => {
      if (prev.interests.includes(interest)) {
        return {
          ...prev,
          interests: prev.interests.filter(i => i !== interest)
        };
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest]
        };
      }
    });
  };

  // Function to toggle personality tags
  const togglePersonalityTag = (tag: string) => {
    if (selectedPersonalityTags.includes(tag)) {
      setSelectedPersonalityTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedPersonalityTags(prev => [...prev, tag]);
    }
  };

  // Generate a random icebreaker
  const generateRandomIcebreaker = () => {
    const randomIndex = Math.floor(Math.random() * icebreakers.length);
    setSelectedIcebreaker(icebreakers[randomIndex]);
  };

  // Simulate chat timer expiration for demonstration
  useEffect(() => {
    if (selectedConversation?.type === 'random') {
      // For demonstration purposes only - in real app this would be based on the remainingTime
      const timer = setTimeout(() => {
        if (Math.random() > 0.7) { // 30% chance the timer will "expire" during the demo
          setTimeExpired(true);
        }
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [selectedConversation]);
  
  // Reset time expired when conversation changes
  useEffect(() => {
    setTimeExpired(false);
  }, [selectedConversation]);

  useEffect(() => {
    // Set up message listener
    onReceiveMessage((data) => {
      setMessages((prev) => [...prev, {
        id: data.id || Math.random().toString(),
        content: data.message,
        sender: data.userName,
        timestamp: data.timestamp,
        isMe: data.userId === currentUser?.id,
        status: 'sent'
      }]);
      scrollToBottom();
    });

    // Set up typing listener
    onUserTyping((data) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation?.id
            ? { ...conv, isTyping: data.isTyping }
            : conv
        )
      );
    });

    // Set up status change listener
    onStatusChange((data) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.type === 'direct' && conv.id === data.userId
            ? { ...conv, isOnline: data.status === 'online' }
            : conv
        )
      );
    });

    // Join room if there's an active conversation
    if (activeConversation) {
      joinRoom(activeConversation.id);
    }

    // Cleanup
    return () => {
      if (activeConversation) {
        leaveRoom(activeConversation.id);
      }
    };
  }, [activeConversation]);

  const handleTyping = (isTyping: boolean) => {
    if (!selectedConversation || !currentUser) return;

    emitTyping({
      roomId: selectedConversation.id,
      userId: currentUser.id,
      isTyping
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Chat</h1>
          {activeTab === 'discussions' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Discussion
            </button>
          )}
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
          <button
            onClick={() => setActiveTab('discussions')}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'discussions'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
            Discussions
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

              {activeTab === 'messages' && messageCategory === 'expert' && (
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                    Expert Directory
                  </h2>
                  <div className="space-y-4">
                    {mockExperts.map(expert => (
                      <div key={expert.id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4 cursor-pointer hover:bg-blue-50 border border-gray-100" onClick={() => { setShowExpertProfile(expert.id); setSelectedExpert(expert); }}>
                        <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-blue-600">
                          {expert.avatar ? <img src={expert.avatar} alt={expert.name} className="h-14 w-14 rounded-full object-cover" /> : expert.name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{expert.name}</span>
                            {expert.verified && <ShieldCheckIcon className="h-4 w-4 text-blue-500" title="Verified" />}
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{expert.badge}</span>
                          </div>
                          <div className="text-xs text-gray-500 mb-1">{expert.credentials.join(', ')}</div>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {expert.specialties.map((tag: string) => (
                              <span key={tag} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={expert.availability === 'available' ? 'text-green-600' : expert.availability === 'offline' ? 'text-gray-400' : 'text-amber-500'}>
                              {expert.availability === 'available' ? 'Online' : expert.availability === 'offline' ? 'Offline' : 'By Appointment'}
                            </span>
                            <span>•</span>
                            <span>{expert.languages.join(', ')}</span>
                            <span>•</span>
                            <span>{expert.rating}★ ({expert.reviews} reviews)</span>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs" onClick={e => { e.stopPropagation(); setShowBookingModal(true); setSelectedExpert(expert); }}>Book</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {conversations
                .filter((conv) => {
                  if (activeTab === 'groups') return conv.type === 'group';
                  if (activeTab === 'discussions') return conv.type === 'discussion';
                  return conv.type === messageCategory;
                })
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
                        {conversation.discussionInfo && (
                          <div className="flex flex-col mt-1">
                            <div className="flex items-center">
                              <ClockIcon className="h-3 w-3 text-amber-500 mr-1" />
                              <span className="text-xs text-amber-500 font-medium">
                                {conversation.discussionInfo.expiresAt}
                              </span>
                      </div>
                            <div className="flex flex-wrap mt-1">
                              {conversation.discussionInfo.tags.map((tag, index) => (
                                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mr-1 mb-1">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${conversation.discussionInfo.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col relative">
              {isRandomChatSetupOpen ? (
                <div className="absolute inset-0 flex items-center justify-center z-30 bg-white bg-opacity-95">
                  <div className="w-full max-w-lg bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col preference-panel modal-container overflow-x-hidden max-h-[90vh] mx-auto my-auto">
                    <h3 className="text-lg font-medium mb-2 sticky top-0 bg-white z-10">Random Chat Preferences</h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 modal-body max-h-[calc(90vh-7rem)]">
                      {/* Interests selection */}
                      <div className="mb-3">
                        <label htmlFor="interestsInput" className="font-medium text-sm text-gray-700">
                          Select Your Interests
                        </label>
                        <input
                          type="text"
                          id="interestsInput"
                          name="interests"
                          placeholder="Type your interests separated by commas (e.g., mental health, art, science)"
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          value={randomChatPreferences.interestsInput || ""}
                          onChange={e =>
                            setRandomChatPreferences(prev => ({
                              ...prev,
                              interestsInput: e.target.value,
                              interests: e.target.value
                                .split(',')
                                .map(s => s.trim())
                                .filter(Boolean)
                            }))
                          }
                        />
                        <div className="mt-2">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              name="surpriseMe"
                              className="form-checkbox h-4 w-4 text-blue-600"
                              checked={randomChatPreferences.showSurpriseMe}
                              onChange={e =>
                                setRandomChatPreferences(prev => ({
                                  ...prev,
                                  showSurpriseMe: e.target.checked
                                }))
                              }
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Surprise Me (completely random matching)
                            </span>
                          </label>
                        </div>
                      </div>
                      {/* Anonymity */}
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">Anonymity Level</h4>
                        <div className="flex flex-col space-y-1">
                          <label className="flex items-center gap-2 leading-relaxed radio-option">
                            <input
                              type="radio"
                              name="anonymity"
                              checked={randomChatPreferences.anonymityLevel === 'anonymous'}
                              onChange={() => 
                                setRandomChatPreferences(prev => ({
                                  ...prev,
                                  anonymityLevel: 'anonymous'
                                }))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="flex items-center gap-1">
                              <EyeSlashIcon className="h-4 w-4" />
                              Completely Anonymous
                            </span>
                          </label>
                          <label className="flex items-center gap-2 leading-relaxed radio-option">
                            <input
                              type="radio"
                              name="anonymity"
                              checked={randomChatPreferences.anonymityLevel === 'pseudonym'}
                              onChange={() => 
                                setRandomChatPreferences(prev => ({
                                  ...prev,
                                  anonymityLevel: 'pseudonym'
                                }))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              Use a Pseudonym
                            </span>
                          </label>
                          <label className="flex items-center gap-2 leading-relaxed radio-option">
                            <input
                              type="radio"
                              name="anonymity"
                              checked={randomChatPreferences.anonymityLevel === 'real'}
                              onChange={() => 
                                setRandomChatPreferences(prev => ({
                                  ...prev,
                                  anonymityLevel: 'real'
                                }))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="flex items-center gap-1">
                              <EyeIcon className="h-4 w-4" />
                              Reveal Identity (mutual approval required)
                            </span>
                          </label>
                        </div>
                      </div>
                      {/* Location radius */}
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">Location Radius</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => 
                              setRandomChatPreferences(prev => ({
                                ...prev,
                                locationRadius: 'nearby'
                              }))
                            }
                            className={`flex items-center justify-center px-2 py-1 text-xs rounded-md w-full ${
                              randomChatPreferences.locationRadius === 'nearby'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            Nearby
                          </button>
                          <button
                            onClick={() => 
                              setRandomChatPreferences(prev => ({
                                ...prev,
                                locationRadius: 'country'
                              }))
                            }
                            className={`flex items-center justify-center px-2 py-1 text-xs rounded-md w-full ${
                              randomChatPreferences.locationRadius === 'country'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <BuildingLibraryIcon className="h-4 w-4 mr-1" />
                            Same Country
                          </button>
                          <button
                            onClick={() => 
                              setRandomChatPreferences(prev => ({
                                ...prev,
                                locationRadius: 'language'
                              }))
                            }
                            className={`flex items-center justify-center px-2 py-1 text-xs rounded-md w-full ${
                              randomChatPreferences.locationRadius === 'language'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <LanguageIcon className="h-4 w-4 mr-1" />
                            Same Language
                          </button>
                          <button
                            onClick={() => 
                              setRandomChatPreferences(prev => ({
                                ...prev,
                                locationRadius: 'global'
                              }))
                            }
                            className={`flex items-center justify-center px-2 py-1 text-xs rounded-md w-full ${
                              randomChatPreferences.locationRadius === 'global'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <GlobeAltIcon className="h-4 w-4 mr-1" />
                            Global
                          </button>
                        </div>
                      </div>
                      {/* Icebreaker selection */}
                      <div className="mb-3">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium mb-1">Select an Icebreaker (optional)</h4>
                          <button 
                            onClick={generateRandomIcebreaker}
                            className="text-xs text-blue-600 flex items-center"
                          >
                            <ArrowPathIcon className="h-3 w-3 mr-1" /> 
                            Randomize
                          </button>
                        </div>
                        <select
                          value={selectedIcebreaker}
                          onChange={(e) => setSelectedIcebreaker(e.target.value)}
                          className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select an icebreaker...</option>
                          {icebreakers.map((icebreaker, index) => (
                            <option key={index} value={icebreaker}>
                              {icebreaker}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="pt-2 bg-white sticky bottom-0 z-20 flex justify-between gap-2 border-t mt-2 button-container">
                      <button
                        onClick={() => setIsRandomChatSetupOpen(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 btn btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleStartRandomChat}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 btn btn-primary"
                      >
                        Find Random Chat
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`relative h-10 w-10 rounded-full ${
                          selectedConversation.type === 'random' && 
                          selectedConversation.randomChatInfo?.participants[0].hasBlurredAvatar ? 
                          'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gray-200'
                        }`}>
                          {selectedConversation.type === 'random' && 
                           selectedConversation.randomChatInfo?.participants[0].hasBlurredAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center text-white">
                              <UserIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium">{selectedConversation.name}</h3>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.type === 'group'
                              ? `${selectedConversation.groupInfo?.memberCount} members`
                              : selectedConversation.type === 'discussion'
                              ? `${selectedConversation.discussionInfo?.participants} participants`
                              : selectedConversation.type === 'random' && selectedConversation.randomChatInfo
                              ? (
                                <span className="flex items-center">
                                  {selectedConversation.randomChatInfo.participants[0].personalityTags.length > 0 && (
                                    <span className="flex items-center mr-2">
                                      {selectedConversation.randomChatInfo.participants[0].personalityTags.map((tag, index) => (
                                        <span key={index} className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded mr-1">
                                          {tag}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                  <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                    {selectedConversation.randomChatInfo.participants[0].mood === 'any' 
                                      ? 'Open to chat' 
                                      : selectedConversation.randomChatInfo.participants[0].mood}
                                  </span>
                                </span>
                              )
                              : selectedConversation.isOnline
                              ? 'Online'
                              : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {selectedConversation.type === 'random' && selectedConversation.randomChatInfo && (
                          <div className="flex items-center px-2 py-1 bg-amber-50 text-amber-800 rounded-md mr-2">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">
                              {formatRemainingTime(remainingTime)}
                            </span>
                          </div>
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
                        {selectedConversation.type === 'discussion' && (
                          <button className="p-2 text-gray-500 hover:text-gray-700">
                            <TagIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button className="p-2 text-gray-500 hover:text-gray-700">
                          <CogIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    {selectedConversation.type === 'discussion' && (
                      <div className="mt-3">
                        <div className="flex mt-2 space-x-2">
                          <button className="flex items-center text-xs text-blue-600 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100">
                            <PencilIcon className="h-3 w-3 mr-1" />
                            Add to notes
                          </button>
                          <button className="flex items-center text-xs text-amber-600 px-2 py-1 rounded-md bg-amber-50 hover:bg-amber-100">
                            <CalendarDaysIcon className="h-3 w-3 mr-1" />
                            Plan meetup
                          </button>
                          <button className="flex items-center text-xs text-green-600 px-2 py-1 rounded-md bg-green-50 hover:bg-green-100">
                            <UsersIcon className="h-3 w-3 mr-1" />
                            Invite members
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedConversation.type === 'random' && selectedConversation.randomChatInfo && (
                      <div className="mt-3">
                        {/* Icebreaker */}
                        {selectedConversation.randomChatInfo.icebreaker && (
                          <div className="bg-blue-50 rounded-md p-3 mb-2">
                            <div className="flex items-start">
                              <QuestionMarkCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                              <div>
                                <h4 className="text-xs font-medium text-blue-800 mb-1">Icebreaker Question</h4>
                                <p className="text-sm text-gray-700">{selectedConversation.randomChatInfo.icebreaker}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap mt-2 gap-2">
                          {selectedConversation.randomChatInfo.participants[0].interests.map((interest, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  {messageCategory === 'direct' && selectedConversation ? (
                    <DirectMessaging 
                      conversation={{
                        id: selectedConversation.id,
                        type: 'direct',
                        participants: [
                          {
                            id: 'current-user', // This should ideally come from authentication
                            name: 'You',
                            isOnline: true,
                          },
                          {
                            id: selectedConversation.id,
                            name: selectedConversation.name,
                            avatar: selectedConversation.avatar,
                            isOnline: selectedConversation.isOnline,
                            isTyping: selectedConversation.isTyping,
                          }
                        ],
                        lastMessage: {
                          content: selectedConversation.lastMessage,
                          sender: selectedConversation.id,
                          timestamp: selectedConversation.timestamp,
                          status: 'delivered'
                        },
                        unreadCount: selectedConversation.unreadCount || 0,
                        isPinned: selectedConversation.isPinned || false,
                        isMuted: selectedConversation.isMuted || false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      }}
                      userId="current-user"
                      userName="You"
                    />
                  ) : (
                    <>
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
                    </>
                  )}

                  {/* Message Input - Only show for non-direct messages */}
                  {!(messageCategory === 'direct' && selectedConversation) && (
                  <div className="p-4 border-t border-gray-200">
                      {/* Show expired chat UI if the time is up */}
                      {(timeExpired || remainingTime <= 0) && selectedConversation?.type === 'random' ? (
                        <div className="p-6 text-center">
                          <div className="mb-3">
                            <ClockIcon className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                            <h3 className="text-lg font-medium mb-1">Chat Time Expired</h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Would you like to continue this conversation?
                            </p>
                          </div>
                          <div className="flex justify-center space-x-4">
                            <button 
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              onClick={() => setTimeExpired(false)} // In real app, this would send a connection request
                            >
                              Send Connection Request
                            </button>
                            <button 
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                              onClick={() => {
                                setSelectedConversation(null);
                                setTimeExpired(false);
                              }}
                            >
                              End Chat
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {selectedConversation?.type === 'random' && (
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex space-x-2">
                                <button className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center">
                                  <FlagIcon className="h-3 w-3 mr-1" />
                                  Report
                                </button>
                                <button className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 flex items-center">
                                  <XCircleIcon className="h-3 w-3 mr-1" />
                                  Block
                                </button>
                              </div>
                              <button className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 flex items-center font-medium">
                                <ShieldExclamationIcon className="h-3 w-3 mr-1" />
                                Panic Exit
                              </button>
                            </div>
                          )}
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
                          
                          {selectedConversation?.type === 'random' && (
                            <div className="mt-2 text-xs text-gray-500 flex items-center">
                              <ShieldCheckIcon className="h-3 w-3 mr-1 text-green-600" /> 
                              <span>PII is automatically blocked in anonymous mode</span>
                  </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 mt-16">
                  Select a conversation to start chatting
                </div>
              )}

              {activeTab === 'messages' && messageCategory === 'random' && !selectedConversation && (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  {isRandomChatSetupOpen ? (
                    <div className="w-full max-w-lg bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col preference-panel modal-container overflow-x-hidden max-h-[90vh]">
                      <h3 className="text-lg font-medium mb-2 sticky top-0 bg-white z-10">Random Chat Preferences</h3>
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1 modal-body max-h-[calc(90vh-7rem)]">
                        {/* Interests selection */}
                        <div className="mb-3">
                          <label htmlFor="interestsInput" className="font-medium text-sm text-gray-700">
                            Select Your Interests
                          </label>
                          <input
                            type="text"
                            id="interestsInput"
                            name="interests"
                            placeholder="Type your interests separated by commas (e.g., mental health, art, science)"
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={randomChatPreferences.interestsInput || ""}
                            onChange={e =>
                              setRandomChatPreferences(prev => ({
                                ...prev,
                                interestsInput: e.target.value,
                                interests: e.target.value
                                  .split(',')
                                  .map(s => s.trim())
                                  .filter(Boolean)
                              }))
                            }
                          />
                          <div className="mt-2">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                name="surpriseMe"
                                className="form-checkbox h-4 w-4 text-blue-600"
                                checked={randomChatPreferences.showSurpriseMe}
                                onChange={e =>
                                  setRandomChatPreferences(prev => ({
                                    ...prev,
                                    showSurpriseMe: e.target.checked
                                  }))
                                }
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Surprise Me (completely random matching)
                              </span>
                            </label>
            </div>
          </div>
                        {/* Anonymity */}
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-1">Anonymity Level</h4>
                          <div className="flex flex-col space-y-1">
                            <label className="flex items-center gap-2 leading-relaxed radio-option">
                              <input
                                type="radio"
                                name="anonymity"
                                checked={randomChatPreferences.anonymityLevel === 'anonymous'}
                                onChange={() => 
                                  setRandomChatPreferences(prev => ({
                                    ...prev,
                                    anonymityLevel: 'anonymous'
                                  }))
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="flex items-center gap-1">
                                <EyeSlashIcon className="h-4 w-4" />
                                Completely Anonymous
                              </span>
                            </label>
                            <label className="flex items-center gap-2 leading-relaxed radio-option">
                              <input
                                type="radio"
                                name="anonymity"
                                checked={randomChatPreferences.anonymityLevel === 'pseudonym'}
                                onChange={() => 
                                  setRandomChatPreferences(prev => ({
                                    ...prev,
                                    anonymityLevel: 'pseudonym'
                                  }))
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="flex items-center gap-1">
                                <UserIcon className="h-4 w-4" />
                                Use a Pseudonym
                              </span>
                            </label>
                            <label className="flex items-center gap-2 leading-relaxed radio-option">
                              <input
                                type="radio"
                                name="anonymity"
                                checked={randomChatPreferences.anonymityLevel === 'real'}
                                onChange={() => 
                                  setRandomChatPreferences(prev => ({
                                    ...prev,
                                    anonymityLevel: 'real'
                                  }))
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className="flex items-center gap-1">
                                <EyeIcon className="h-4 w-4" />
                                Reveal Identity (mutual approval required)
                              </span>
                            </label>
        </div>
      </div>
                        {/* Location radius */}
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-1">Location Radius</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => 
                                setRandomChatPreferences(prev => ({
                                  ...prev,
                                  locationRadius: 'nearby'
                                }))
                              }
                              className={`flex items-center justify-center px-2 py-1 text-xs rounded-md w-full ${
                                randomChatPreferences.locationRadius === 'nearby'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              Nearby
                            </button>
                            <button
                              onClick={() => 
                                setRandomChatPreferences(prev => ({
                                  ...prev,
                                  locationRadius: 'country'
                                }))
                              }
                              className={`flex items-center justify-center px-2 py-1 text-xs rounded-md w-full ${
                                randomChatPreferences.locationRadius === 'country'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <BuildingLibraryIcon className="h-4 w-4 mr-1" />
                              Same Country
                            </button>
                            <button
                              onClick={() => 
                                setRandomChatPreferences(prev => ({
                                  ...prev,
                                  locationRadius: 'language'
                                }))
                              }
                              className={`flex items-center justify-center px-2 py-1 text-xs rounded-md w-full ${
                                randomChatPreferences.locationRadius === 'language'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <LanguageIcon className="h-4 w-4 mr-1" />
                              Same Language
                            </button>
                            <button
                              onClick={() => 
                                setRandomChatPreferences(prev => ({
                                  ...prev,
                                  locationRadius: 'global'
                                }))
                              }
                              className={`flex items-center justify-center px-2 py-1 text-xs rounded-md w-full ${
                                randomChatPreferences.locationRadius === 'global'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <GlobeAltIcon className="h-4 w-4 mr-1" />
                              Global
                            </button>
                          </div>
                        </div>
                        {/* Icebreaker selection */}
                        <div className="mb-3">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium mb-1">Select an Icebreaker (optional)</h4>
                            <button 
                              onClick={generateRandomIcebreaker}
                              className="text-xs text-blue-600 flex items-center"
                            >
                              <ArrowPathIcon className="h-3 w-3 mr-1" /> 
                              Randomize
                            </button>
                          </div>
                          <select
                            value={selectedIcebreaker}
                            onChange={(e) => setSelectedIcebreaker(e.target.value)}
                            className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select an icebreaker...</option>
                            {icebreakers.map((icebreaker, index) => (
                              <option key={index} value={icebreaker}>
                                {icebreaker}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="pt-2 bg-white sticky bottom-0 z-20 flex justify-between gap-2 border-t mt-2 button-container">
                        <button
                          onClick={() => setIsRandomChatSetupOpen(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 btn btn-outline"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleStartRandomChat}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 btn btn-primary"
                        >
                          Find Random Chat
                        </button>
                      </div>
                    </div>
                  ) : searchingForRandomChat ? (
                    <div className="text-center">
                      <div className="animate-pulse mb-4">
                        <SparklesIcon className="h-12 w-12 mx-auto text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Searching for a random match...</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Finding someone with similar interests. This should only take a moment.
                      </p>
                      <button
                        onClick={() => setSearchingForRandomChat(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="text-center max-w-md">
                      <div className="mb-6">
                        <SparklesIcon className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                        <h3 className="text-xl font-medium mb-2">Random Chat</h3>
                        <p className="text-gray-500 mb-4">
                          Connect with someone new based on shared interests or pure randomness. 
                          Conversations are time-limited for purposeful interactions.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-sm mb-2">Random Chat Features:</h4>
                        <ul className="space-y-2 text-sm text-gray-600 text-left">
                          <li className="flex items-start">
                            <TagIcon className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                            <span>Interest-based matching for meaningful conversations</span>
                          </li>
                          <li className="flex items-start">
                            <ClockIcon className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                            <span>Time-limited chats to keep interactions focused</span>
                          </li>
                          <li className="flex items-start">
                            <LockClosedIcon className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                            <span>Privacy options with anonymity controls</span>
                          </li>
                          <li className="flex items-start">
                            <ShieldExclamationIcon className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                            <span>Safety features including PII protection and report options</span>
                          </li>
                        </ul>
                      </div>
                      
                      <button
                        onClick={() => setIsRandomChatSetupOpen(true)}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-3"
                      >
                        Start a Random Chat
                      </button>
                      <p className="text-xs text-gray-500">
                        Limited to 10 random chats per day for a better experience
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* 3. Show expert profile modal and booking modal */}
      {showExpertProfile && selectedExpert && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative ${styles.modalContainer}`}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowExpertProfile(null)}><XCircleIcon className="h-6 w-6" /></button>
            <div className="flex gap-6">
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-blue-600">
                {selectedExpert.avatar ? <img src={selectedExpert.avatar} alt={selectedExpert.name} className="h-24 w-24 rounded-full object-cover" /> : selectedExpert.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-semibold text-gray-900">{selectedExpert.name}</span>
                  {selectedExpert.verified && <ShieldCheckIcon className="h-5 w-5 text-blue-500" title="Verified" />}
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{selectedExpert.badge}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">{selectedExpert.credentials.join(', ')}</div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {selectedExpert.specialties.map((tag: string) => (
                    <span key={tag} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span className={selectedExpert.availability === 'available' ? 'text-green-600' : selectedExpert.availability === 'offline' ? 'text-gray-400' : 'text-amber-500'}>
                    {selectedExpert.availability === 'available' ? 'Online' : selectedExpert.availability === 'offline' ? 'Offline' : 'By Appointment'}
                  </span>
                  <span>•</span>
                  <span>{selectedExpert.languages.join(', ')}</span>
                  <span>•</span>
                  <span>{selectedExpert.rating}★ ({selectedExpert.reviews} reviews)</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{selectedExpert.summary}</div>
                <a href={selectedExpert.portfolio} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Portfolio</a>
              </div>
            </div>
            <div className={`mt-6 flex gap-4 ${styles.buttonContainer}`}>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => { setShowBookingModal(true); setShowExpertProfile(null); }}>Book Session</button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200" onClick={() => setShowExpertProfile(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* 4. Show booking modal */}
      {showBookingModal && selectedExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative ${styles.modalContainer}`}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowBookingModal(false)}><XCircleIcon className="h-6 w-6" /></button>
            <h2 className="text-xl font-semibold mb-2">Book a Session with {selectedExpert.name}</h2>
            <div className="mb-4 text-sm text-gray-600">Choose session type and time:</div>
            <div className="space-y-2 mb-4">
              <button className="w-full px-4 py-2 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">1:1 Session (15 min)</button>
              <button className="w-full px-4 py-2 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">1:1 Session (30 min)</button>
              <button className="w-full px-4 py-2 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">1:1 Session (60 min)</button>
              {selectedExpert.groupSessions && <button className="w-full px-4 py-2 rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100">Group Q&A Slot</button>}
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Pick a time slot:</label>
              <select className="w-full border rounded p-2">
                <option>{selectedExpert.nextAvailable}</option>
                <option>Tomorrow, 5:00 PM</option>
                <option>Friday, 11:00 AM</option>
              </select>
            </div>
            <div className={`flex gap-2 mb-4 ${styles.buttonContainer}`}>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Confirm Booking</button>
              <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200" onClick={() => setShowBookingModal(false)}>Cancel</button>
            </div>
            <div className="text-xs text-gray-500">You can set reminders and sync with Google Calendar after booking.</div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @media (max-width: 640px) {
          .modal-container {
            width: 100% !important;
            padding: 1rem !important;
          }
          .button-container {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  )
} 
