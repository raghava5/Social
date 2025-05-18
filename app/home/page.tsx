'use client'

import { useState, useEffect } from 'react'
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  VideoCameraIcon,
  PhotoIcon,
  FaceSmileIcon,
  ClockIcon,
  AcademicCapIcon,
  LightBulbIcon,
  SparklesIcon,
  FireIcon,
  StarIcon,
  HandRaisedIcon,
  GlobeAltIcon,
  MapPinIcon,
  MegaphoneIcon,
  WrenchIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline'
import TopNav from '../components/TopNav'

// Types for priority-based feed
type PostType = 'help-request' | 'spend-time' | 'user-post' | 'campaign' | 'activity' | 'tool' | 'game';

interface Author {
  id: string;
  name: string;
  avatar?: string;
}

interface Post {
  id: string;
  type: PostType;
  author: Author;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  spoke?: string;
  location?: string;
  distance?: string;
  urgency?: 'high' | 'medium' | 'low';
  category?: string;
  tags?: string[];
}

// Dummy data for demonstration
const spokes = [
  { id: 1, name: 'Spiritual', progress: 75, color: 'bg-purple-500' },
  { id: 2, name: 'Mental', progress: 60, color: 'bg-blue-500' },
  { id: 3, name: 'Physical', progress: 85, color: 'bg-green-500' },
  { id: 4, name: 'Personal', progress: 45, color: 'bg-pink-500' },
  { id: 5, name: 'Professional', progress: 70, color: 'bg-yellow-500' },
  { id: 6, name: 'Financial', progress: 55, color: 'bg-red-500' },
  { id: 7, name: 'Social', progress: 80, color: 'bg-indigo-500' },
  { id: 8, name: 'Mindfulness', progress: 65, color: 'bg-teal-500' },
  { id: 9, name: 'Leadership', progress: 50, color: 'bg-orange-500' },
]

const prompts = [
  { id: 1, text: 'What are you grateful for today?', spoke: 'Spiritual' },
  { id: 2, text: 'Take 5 minutes to practice mindfulness', spoke: 'Mental' },
  { id: 3, text: 'Go for a 15-minute walk', spoke: 'Physical' },
]

const liveEvents = [
  { id: 1, title: 'Morning Meditation', time: '8:00 AM', participants: 45 },
  { id: 2, title: 'Financial Planning Workshop', time: '2:00 PM', participants: 23 },
]

const trendingItems = [
  { id: 1, title: 'Mindful Living Challenge', type: 'challenge', participants: 120 },
  { id: 2, title: 'Financial Freedom Group', type: 'group', members: 89 },
  { id: 3, title: 'Daily Wisdom Quotes', type: 'content', likes: 256 },
]

// New recommendations data
const recommendations = [
  { 
    id: 1, 
    title: 'The Power of Now', 
    type: 'book', 
    author: 'Eckhart Tolle' 
  },
  { 
    id: 2, 
    title: 'Meditation for Beginners', 
    type: 'course', 
    duration: '30 mins' 
  },
  { 
    id: 3, 
    title: 'Mindful Living Workshop', 
    type: 'course', 
    duration: '2 hours' 
  },
];

// Priority-based feed data
const helpRequestPosts: Post[] = [
  {
    id: 'help1',
    type: 'help-request',
    author: {
      id: '1',
      name: 'David Chen',
      avatar: '/avatars/david.jpg'
    },
    content: 'Looking for someone to help my elderly neighbor with grocery shopping this weekend. She has mobility issues and needs assistance.',
    likes: 12,
    comments: 4,
    shares: 2,
    timestamp: '1 hour ago',
    spoke: 'Social',
    location: 'Downtown',
    distance: '0.8 miles away',
    urgency: 'high',
    tags: ['elderly', 'groceries', 'weekend']
  },
  {
    id: 'help2',
    type: 'help-request',
    author: {
      id: '2',
      name: 'Sara Miller',
      avatar: '/avatars/sara.jpg'
    },
    content: 'Need advice on helping my teenager with anxiety. Looking for resources or someone experienced with adolescent mental health.',
    likes: 18,
    comments: 7,
    shares: 3,
    timestamp: '3 hours ago',
    spoke: 'Mental',
    location: 'Westside',
    distance: '1.2 miles away',
    urgency: 'medium',
    tags: ['mental health', 'teenager', 'anxiety']
  }
];

const spendTimePosts: Post[] = [
  {
    id: 'time1',
    type: 'spend-time',
    author: {
      id: '3',
      name: 'James Wilson',
      avatar: '/avatars/james.jpg'
    },
    content: 'Looking for a hiking buddy this Saturday at Redwood Trails. All experience levels welcome!',
    image: '/images/hiking.jpg',
    likes: 9,
    comments: 3,
    shares: 1,
    timestamp: '5 hours ago',
    spoke: 'Physical',
    location: 'Redwood Trails',
    distance: '3.5 miles away',
    tags: ['hiking', 'nature', 'weekend']
  },
  {
    id: 'time2',
    type: 'spend-time',
    author: {
      id: '4',
      name: 'Mia Johnson',
      avatar: '/avatars/mia.jpg'
    },
    content: 'Starting a weekly meditation circle at Community Park. Join us every Wednesday at 6pm to practice mindfulness together.',
    likes: 22,
    comments: 8,
    shares: 5,
    timestamp: '1 day ago',
    spoke: 'Mindfulness',
    location: 'Community Park',
    distance: '1.7 miles away',
    tags: ['meditation', 'mindfulness', 'weekly']
  }
];

// User posts from different spokes
const userPosts: Post[] = spokes.map((spoke, index) => ({
  id: `user${index}`,
  type: 'user-post',
  author: {
    id: `${index + 5}`,
    name: `User ${index + 1}`,
    avatar: `/avatars/user${index + 1}.jpg`
  },
  content: `Sharing my progress on my ${spoke.name} journey. Today I'm focusing on ${index % 2 === 0 ? 'self-improvement' : 'helping others'}.`,
  image: index % 3 === 0 ? `/images/post${index + 1}.jpg` : undefined,
  likes: Math.floor(Math.random() * 50) + 5,
  comments: Math.floor(Math.random() * 15) + 1,
  shares: Math.floor(Math.random() * 8),
  timestamp: `${Math.floor(Math.random() * 23) + 1} hours ago`,
  spoke: spoke.name,
  tags: [spoke.name.toLowerCase(), 'journey', 'progress']
}));

const campaignPosts: Post[] = [
  {
    id: 'campaign1',
    type: 'campaign',
    author: {
      id: 'mh-foundation',
      name: 'Mental Health Foundation',
      avatar: '/avatars/mhf.jpg'
    },
    content: 'Join our Mental Health Awareness Month campaign. Learn to recognize signs of stress and anxiety and discover self-care practices.',
    image: '/images/mental-health.jpg',
    likes: 156,
    comments: 43,
    shares: 78,
    timestamp: '2 days ago',
    spoke: 'Mental',
    tags: ['mental health', 'awareness', 'self-care']
  }
];

const activityPosts: Post[] = spokes.map((spoke, index) => ({
  id: `activity${index}`,
  type: 'activity',
  author: {
    id: 'social-activities',
    name: `${spoke.name} Activities`,
    avatar: '/avatars/activities.jpg'
  },
  content: `Try this ${spoke.name} activity: ${index % 2 === 0 ? 'Meditation and mindfulness practice' : 'Connect with nature through a mindful walk'}.`,
  likes: Math.floor(Math.random() * 30) + 10,
  comments: Math.floor(Math.random() * 10) + 2,
  shares: Math.floor(Math.random() * 5) + 1,
  timestamp: `${Math.floor(Math.random() * 5) + 1} days ago`,
  spoke: spoke.name,
  category: 'beginner',
  tags: [spoke.name.toLowerCase(), 'activity', 'beginner']
}));

const toolPosts: Post[] = spokes.map((spoke, index) => ({
  id: `tool${index}`,
  type: 'tool',
  author: {
    id: 'social-tools',
    name: `${spoke.name} Tools`,
    avatar: '/avatars/tools.jpg'
  },
  content: `Discover this ${spoke.name} tool: ${index % 2 === 0 ? 'Habit Tracker App' : 'Journaling Template'} to enhance your well-being journey.`,
  image: index % 4 === 0 ? `/images/tool${index + 1}.jpg` : undefined,
  likes: Math.floor(Math.random() * 25) + 15,
  comments: Math.floor(Math.random() * 8) + 3,
  shares: Math.floor(Math.random() * 12) + 4,
  timestamp: `${Math.floor(Math.random() * 7) + 1} days ago`,
  spoke: spoke.name,
  tags: [spoke.name.toLowerCase(), 'tool', 'resources']
}));

const gamePosts: Post[] = spokes.map((spoke, index) => ({
  id: `game${index}`,
  type: 'game',
  author: {
    id: 'social-games',
    name: `${spoke.name} Games`,
    avatar: '/avatars/games.jpg'
  },
  content: `Try this fun ${spoke.name} mini-game: ${index % 2 === 0 ? 'Gratitude Challenge' : 'Mindfulness Quiz'} to make growth enjoyable.`,
  image: index % 3 === 1 ? `/images/game${index + 1}.jpg` : undefined,
  likes: Math.floor(Math.random() * 40) + 20,
  comments: Math.floor(Math.random() * 12) + 5,
  shares: Math.floor(Math.random() * 8) + 2,
  timestamp: `${Math.floor(Math.random() * 6) + 1} days ago`,
  spoke: spoke.name,
  tags: [spoke.name.toLowerCase(), 'game', 'fun']
}));

export default function Home() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: 'John Doe',
        avatar: '/avatar1.jpg',
      },
      content: 'Just completed my morning meditation! Feeling refreshed and ready for the day. #Spiritual #Mindfulness',
      image: '/post1.jpg',
      likes: 24,
      comments: 5,
      shares: 2,
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      user: {
        name: 'Jane Smith',
        avatar: '/avatar2.jpg',
      },
      content: 'Started a new fitness routine today. Day 1 of 30! 💪 #Physical #Wellness',
      image: '/post2.jpg',
      likes: 45,
      comments: 12,
      shares: 3,
      timestamp: '4 hours ago',
    },
  ])
  
  // Priority-based feed state
  const [priorityFeed, setPriorityFeed] = useState<Post[]>([]);

  // Function to build priority feed
  useEffect(() => {
    // Create the priority-based feed array
    const buildPriorityFeed = () => {
      let feed: Post[] = [];
      
      // Get stored spoke rotation from localStorage or initialize
      let spokeRotation: string[] = [];
      try {
        const storedRotation = localStorage.getItem('spokeRotation');
        if (storedRotation) {
          spokeRotation = JSON.parse(storedRotation);
        }
      } catch (error) {
        console.error("Error retrieving spoke rotation:", error);
      }
      
      // Ensure we have a valid rotation array
      if (!spokeRotation || !Array.isArray(spokeRotation) || spokeRotation.length === 0) {
        // Initialize with random order of all spoke names
        spokeRotation = spokes.map(spoke => spoke.name).sort(() => Math.random() - 0.5);
      }
      
      // Rotate the array by shifting the first element to the end
      // This ensures different spokes are prioritized across sessions
      const firstSpoke = spokeRotation.shift();
      if (firstSpoke) {
        spokeRotation.push(firstSpoke);
      }
      
      // Save updated rotation to localStorage
      try {
        localStorage.setItem('spokeRotation', JSON.stringify(spokeRotation));
      } catch (error) {
        console.error("Error saving spoke rotation:", error);
      }
      
      // Create a set to track used spokes for this display cycle
      const usedSpokes = new Set<string>();
      
      // Helper function to get a post of specific type from an unused spoke
      const getPostFromUnusedSpoke = (posts: Post[], fallbackPosts?: Post[]): Post | null => {
        // First try to find a post with an unused spoke
        const availablePosts = posts.filter(post => post.spoke && !usedSpokes.has(post.spoke));
        
        if (availablePosts.length > 0) {
          // Prioritize posts from spokes in the rotation order
          for (const spokeName of spokeRotation) {
            const matchingPost = availablePosts.find(post => post.spoke === spokeName);
            if (matchingPost) {
              if (matchingPost.spoke) {
                usedSpokes.add(matchingPost.spoke);
              }
              return matchingPost;
            }
          }
          
          // If no match in rotation order, take the first available
          const selectedPost = availablePosts[0];
          if (selectedPost.spoke) {
            usedSpokes.add(selectedPost.spoke);
          }
          return selectedPost;
        }
        
        // If no unused spokes and fallbacks provided, try fallbacks
        if (fallbackPosts && fallbackPosts.length > 0) {
          // Prioritize fallbacks that don't repeat spokes if possible
          const fallbackWithNewSpoke = fallbackPosts.find(post => 
            post.spoke && !usedSpokes.has(post.spoke)
          );
          
          if (fallbackWithNewSpoke) {
            if (fallbackWithNewSpoke.spoke) {
              usedSpokes.add(fallbackWithNewSpoke.spoke);
            }
            return fallbackWithNewSpoke;
          }
          
          // If all spokes used, just take the first fallback
          return fallbackPosts[0];
        }
        
        return null;
      };
      
      // 1️⃣ Help Request (1 post)
      const helpRequest = getPostFromUnusedSpoke(helpRequestPosts);
      if (helpRequest) {
        feed.push(helpRequest);
      }
      
      // 2️⃣ Spend Time With Others (1 post)
      const spendTimePost = getPostFromUnusedSpoke(spendTimePosts);
      if (spendTimePost) {
        feed.push(spendTimePost);
      }
      
      // 3️⃣ User Post (1 post from a different spoke)
      const userPost = getPostFromUnusedSpoke(userPosts);
      if (userPost) {
        feed.push(userPost);
      }
      
      // 4️⃣ Campaign Post (1 post)
      const campaignPost = getPostFromUnusedSpoke(campaignPosts, userPosts); // Fallback to user posts if needed
      if (campaignPost) {
        feed.push(campaignPost);
      }
      
      // 5️⃣ Activity Task (1 post from a different spoke)
      const activityPost = getPostFromUnusedSpoke(activityPosts);
      if (activityPost) {
        feed.push(activityPost);
      }
      
      // 6️⃣ Tool (1 post from a different spoke)
      const toolPost = getPostFromUnusedSpoke(toolPosts);
      if (toolPost) {
        feed.push(toolPost);
      }
      
      // 7️⃣ Game (1 post from a different spoke)
      const gamePost = getPostFromUnusedSpoke(gamePosts);
      if (gamePost) {
        feed.push(gamePost);
      }
      
      // Set the priority feed
      setPriorityFeed(feed);
    };

    buildPriorityFeed();
  }, []);

  // Function to render post based on type
  const renderPostCard = (post: Post) => {
    // Common post footer UI
    const PostFooter = () => (
      <div className="flex justify-between mt-4 pt-4 border-t">
        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
          <HeartIcon className="h-5 w-5" />
          <span>{post.likes} Likes</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
          <ChatBubbleOvalLeftIcon className="h-5 w-5" />
          <span>{post.comments} Comments</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
          <ShareIcon className="h-5 w-5" />
          <span>{post.shares} Shares</span>
        </button>
      </div>
    );

    // Get post type styling
    const getPostStyling = () => {
      switch (post.type) {
        case 'help-request':
          return {
            headerBg: 'bg-red-50',
            headerBorder: 'border-red-200',
            title: 'Help Request',
            icon: <HandRaisedIcon className="h-5 w-5 text-red-600 mr-2" />,
            badge: { bg: 'bg-red-100', text: 'text-red-800' }
          };
        case 'spend-time':
          return {
            headerBg: 'bg-green-50',
            headerBorder: 'border-green-200',
            title: 'Spend Time Together',
            icon: <UserGroupIcon className="h-5 w-5 text-green-600 mr-2" />,
            badge: { bg: 'bg-green-100', text: 'text-green-800' }
          };
        case 'campaign':
          return {
            headerBg: 'bg-purple-50',
            headerBorder: 'border-purple-200',
            title: 'Awareness Campaign',
            icon: <MegaphoneIcon className="h-5 w-5 text-purple-600 mr-2" />,
            badge: { bg: 'bg-purple-100', text: 'text-purple-800' }
          };
        case 'activity':
          return {
            headerBg: 'bg-blue-50',
            headerBorder: 'border-blue-200',
            title: `${post.spoke} Activity`,
            icon: <SparklesIcon className="h-5 w-5 text-blue-600 mr-2" />,
            badge: { bg: 'bg-blue-100', text: 'text-blue-800' }
          };
        case 'tool':
          return {
            headerBg: 'bg-yellow-50',
            headerBorder: 'border-yellow-200',
            title: `${post.spoke} Tool`,
            icon: <WrenchIcon className="h-5 w-5 text-yellow-600 mr-2" />,
            badge: { bg: 'bg-yellow-100', text: 'text-yellow-800' }
          };
        case 'game':
          return {
            headerBg: 'bg-indigo-50',
            headerBorder: 'border-indigo-200',
            title: `${post.spoke} Game`,
            icon: <PuzzlePieceIcon className="h-5 w-5 text-indigo-600 mr-2" />,
            badge: { bg: 'bg-indigo-100', text: 'text-indigo-800' }
          };
        default:
          return {
            headerBg: 'bg-white',
            headerBorder: 'border-gray-200',
            title: 'Post',
            icon: <UserIcon className="h-5 w-5 text-gray-600 mr-2" />,
            badge: { bg: 'bg-gray-100', text: 'text-gray-800' }
          };
      }
    };

    const styling = getPostStyling();

    // Post type badge
    const PostTypeBadge = () => {
      return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styling.badge.bg} ${styling.badge.text}`}>
          {styling.icon}
          <span className="text-xs">{post.type}</span>
        </div>
      );
    };

    // Spoke badge if available
    const SpokeBadge = () => {
      if (!post.spoke) return null;
      
      const spoke = spokes.find(s => s.name === post.spoke);
      const badgeColor = spoke ? spoke.color : "bg-gray-500";
      
      return (
        <div className={`inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-opacity-20 ${badgeColor} text-gray-800`}>
          {post.spoke}
        </div>
      );
    };

    // Location badge if available
    const LocationBadge = () => {
      if (!post.location) return null;
      
      return (
        <div className="inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <MapPinIcon className="h-3 w-3 mr-1" />
          {post.location} {post.distance && `(${post.distance})`}
        </div>
      );
    };

    // Render post card with appropriate styling
    return (
      <div key={post.id} className={`bg-white rounded-lg shadow mb-4 overflow-hidden`}>
        {/* Post header with distinctive styling */}
        <div className={`${styling.headerBg} p-3 border-b ${styling.headerBorder} flex items-center`}>
          {styling.icon}
          <h3 className="font-medium">{styling.title}</h3>
        </div>
        
        {/* Post content */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-300">
                {post.author.avatar && (
                  <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full" />
                )}
              </div>
              <div>
                <p className="font-medium">{post.author.name}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{post.timestamp}</span>
                  <SpokeBadge />
                  <LocationBadge />
                </div>
              </div>
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
          
          <p className="mt-4">{post.content}</p>
          
          {post.image && (
            <div className="mt-4">
              <div className="w-full h-64 bg-gray-300 rounded-lg overflow-hidden">
                <img src={post.image} alt="Post" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {post.tags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <PostFooter />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav />
      <div className="grid grid-cols-12 gap-4 p-4">
        {/* Left Panel */}
        <div className="col-span-3 space-y-4">
          {/* Seven Spokes Health Summary */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Seven Spokes Health</h2>
            <div className="space-y-3">
              {spokes.map((spoke) => (
                <div key={spoke.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{spoke.name}</span>
                    <span>{spoke.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${spoke.color}`}
                      style={{ width: `${spoke.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompts of the Day */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Prompts of the Day</h2>
            <div className="space-y-3">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{prompt.text}</p>
                  <span className="text-xs text-gray-500">{prompt.spoke}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Feed - Updated with Priority-Based Feed */}
        <div className="col-span-6 space-y-4">
          {/* Create Post */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              <input
                type="text"
                placeholder="What's on your mind?"
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none"
              />
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t">
              <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
                <PhotoIcon className="h-6 w-6 text-green-500" />
                <span>Photo/Video</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
                <VideoCameraIcon className="h-6 w-6 text-red-500" />
                <span>Live Video</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
                <FaceSmileIcon className="h-6 w-6 text-yellow-500" />
                <span>Feeling/Activity</span>
              </button>
            </div>
          </div>

          {/* Priority-Based Feed */}
          <div className="space-y-4">
            {priorityFeed.map(post => renderPostCard(post))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-3 space-y-4">
          {/* Live Events */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Live Events</h2>
            <div className="space-y-3">
              {liveEvents.map((event) => (
                <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{event.title}</span>
                    <span className="text-sm text-gray-500">{event.time}</span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {event.participants} participants
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help Exchange */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Help Exchange</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Offer Help
              </button>
              <button className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200">
                Request Help
              </button>
            </div>
          </div>

          {/* Trending */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Trending</h2>
            <div className="space-y-3">
              {trendingItems.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FireIcon className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {item.type === 'challenge' && `${item.participants} participants`}
                    {item.type === 'group' && `${item.members} members`}
                    {item.type === 'content' && `${item.likes} likes`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
            <div className="space-y-3">
              {recommendations.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{item.title}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    {item.type === 'book' && (
                      <>
                        <BookmarkIcon className="h-4 w-4 mr-1" />
                        <span>By {item.author}</span>
                      </>
                    )}
                    {item.type === 'course' && (
                      <>
                        <AcademicCapIcon className="h-4 w-4 mr-1" />
                        <span>{item.duration}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 