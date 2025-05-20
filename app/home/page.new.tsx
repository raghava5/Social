'use client'

import { usePosts } from '@/contexts/PostsContext';
import { useState, useEffect } from 'react';
import { Post } from '@/types';
import { CreatePost } from '@/components/CreatePost';
import { EmptyFeed } from '@/components/EmptyFeed';
import { renderPostCard } from '@/utils/renderPostCard';
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

export default function Home() {
  const { posts: allPosts, loading, error, createPost } = usePosts();
  const [priorityFeed, setPriorityFeed] = useState<Post[]>([]);

  useEffect(() => {
    if (allPosts.length > 0) {
      buildPriorityFeed(allPosts);
    } else {
      setPriorityFeed([]);
    }
  }, [allPosts]);

  const handlePostSubmit = async (formData: FormData) => {
    try {
      // Call the createPost function from usePosts hook
      const success = await createPost(formData);
      
      if (success) {
        // The post will be added to the feed through the createPost function
        // and the WebSocket connection
        console.log('Post created successfully');
      } else {
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-12 gap-4 p-4">
        {/* Main Feed - Updated with Priority-Based Feed */}
        <div className="col-span-9 col-start-4 space-y-4">
          {/* Create Post */}
          <CreatePost onSubmit={handlePostSubmit} />

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading posts...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && allPosts.length === 0 && <EmptyFeed />}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p>Error loading posts: {error}</p>
            </div>
          )}

          {/* Priority-Based Feed */}
          {!loading && !error && allPosts.length > 0 && (
            <div className="space-y-4">
              {priorityFeed.map(post => renderPostCard(post))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 