export type PostType = 'help-request' | 'spend-time' | 'user-post' | 'campaign' | 'activity' | 'tool' | 'game';

export interface Author {
  id: string;
  name: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    avatar?: string;
  };
}

export interface Post {
  id: string;
  type: PostType;
  author: Author;
  content: string;
  images?: string;
  videos?: string;
  likes: number;
  comments: number;
  commentsList: Comment[];
  shares: number;
  timestamp: string;
  spoke?: string;
  location?: string;
  distance?: string;
  urgency?: 'high' | 'medium' | 'low';
  category?: string;
  tags?: string[];
  feeling?: string;
  isLikedByCurrentUser?: boolean;
}

export interface Spoke {
  id: number;
  name: string;
  progress: number;
  color: string;
}

export interface Prompt {
  id: number;
  text: string;
  spoke: string;
}

export interface LiveEvent {
  id: number;
  title: string;
  time: string;
  participants: number;
}

export interface TrendingItem {
  id: number;
  title: string;
  type: string;
  participants?: number;
  members?: number;
  likes?: number;
}

export interface Recommendation {
  id: number;
  title: string;
  type: string;
  author?: string;
  duration?: string;
} 