import { generateEmbedding, findSimilarItems } from './embedding';

// Types for recommendation system
interface User {
  id: string;
  interests: string[];
  recentActivities: {
    activityId: string;
    timestamp: string;
    completed: boolean;
  }[];
  progress: Record<string, number>; // spoke -> progress
}

interface RecommendationItem {
  id: string;
  type: 'activity' | 'post' | 'user' | 'group';
  title: string;
  description?: string;
  similarity?: number;
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Professional';
}

interface RecommendationOptions {
  userId: string;
  limit?: number;
  categories?: string[];
  excludeIds?: string[];
  includeRecentlyViewed?: boolean;
}

/**
 * Recommends activities based on user profile and recent activity
 */
export async function recommendActivities(
  options: RecommendationOptions
): Promise<RecommendationItem[]> {
  const { userId, limit = 10, categories, excludeIds = [], includeRecentlyViewed = false } = options;
  
  try {
    // In a real implementation, you would fetch the user from your database
    // Here we'll simulate it for demonstration
    const user = await fetchUserProfile(userId);
    
    // Generate a combined profile embedding
    const userProfileText = [
      ...user.interests,
      ...user.recentActivities.map(a => a.activityId)
    ].join(' ');
    
    // Get embedding for user profile
    const profileEmbedding = await generateEmbedding(userProfileText);
    
    // Find similar activities using embedding
    const similarActivities = await findSimilarItems(profileEmbedding, 'activity', limit * 2);
    
    // Filter out excluded IDs and apply category filters
    let recommendations = similarActivities
      .filter(item => !excludeIds.includes(item.metadata.id))
      .filter(item => !categories || categories.includes(item.metadata.category))
      .map(item => ({
        id: item.metadata.id,
        type: 'activity' as const,
        title: item.metadata.title,
        description: item.metadata.description,
        similarity: item.similarity,
        category: item.metadata.category,
        level: item.metadata.level
      }));
    
    // If we need to include recently viewed items, add them at the beginning
    if (includeRecentlyViewed) {
      const recentViewedIds = user.recentActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3)
        .map(a => a.activityId);
      
      // Filter out any recently viewed that are already in recommendations
      const newRecentlyViewed = recentViewedIds.filter(
        id => !recommendations.some(r => r.id === id) && !excludeIds.includes(id)
      );
      
      if (newRecentlyViewed.length > 0) {
        // Fetch details for recently viewed activities
        const recentActivities = await fetchActivitiesByIds(newRecentlyViewed);
        recommendations = [...recentActivities, ...recommendations];
      }
    }
    
    // Apply user-specific ranking algorithm
    recommendations = rankRecommendationsByUserPreferences(recommendations, user);
    
    // Return the limited number of recommendations
    return recommendations.slice(0, limit);
  } catch (error) {
    console.error('Error recommending activities:', error);
    return [];
  }
}

/**
 * Recommend users to connect with based on similar interests and activities
 */
export async function recommendConnections(
  options: RecommendationOptions
): Promise<RecommendationItem[]> {
  const { userId, limit = 10, excludeIds = [] } = options;
  
  try {
    // Get user profile
    const user = await fetchUserProfile(userId);
    
    // Generate user profile text
    const userProfileText = [
      ...user.interests,
      ...Object.keys(user.progress)
    ].join(' ');
    
    // Get embedding for user profile
    const profileEmbedding = await generateEmbedding(userProfileText);
    
    // Find similar users using embedding
    const similarUsers = await findSimilarItems(profileEmbedding, 'user', limit * 2);
    
    // Filter out excluded IDs (e.g., users already connected with)
    const recommendations = similarUsers
      .filter(item => item.object_id !== userId && !excludeIds.includes(item.object_id))
      .map(item => ({
        id: item.object_id,
        type: 'user' as const,
        title: item.metadata.name,
        description: item.metadata.bio,
        similarity: item.similarity
      }))
      .slice(0, limit);
    
    return recommendations;
  } catch (error) {
    console.error('Error recommending connections:', error);
    return [];
  }
}

/**
 * Suggest next best action for user based on their progress in the seven spokes
 */
export async function suggestNextAction(userId: string): Promise<RecommendationItem[]> {
  try {
    // Get user profile
    const user = await fetchUserProfile(userId);
    
    // Find the spoke with least progress
    const spokeProgress = Object.entries(user.progress);
    spokeProgress.sort((a, b) => a[1] - b[1]);
    
    const focusSpoke = spokeProgress[0][0];
    
    // Get activities for the focus spoke
    const spokeActivities = await fetchActivitiesBySpokeAndLevel(
      focusSpoke, 
      calculateUserLevel(user.progress[focusSpoke])
    );
    
    return spokeActivities.slice(0, 3).map(activity => ({
      id: activity.id,
      type: 'activity' as const,
      title: activity.title,
      description: `This will help progress your ${focusSpoke} spoke`,
      category: focusSpoke
    }));
  } catch (error) {
    console.error('Error suggesting next action:', error);
    return [];
  }
}

/**
 * Calculate user level based on progress
 */
function calculateUserLevel(progress: number): 'Beginner' | 'Intermediate' | 'Professional' {
  if (progress < 30) return 'Beginner';
  if (progress < 70) return 'Intermediate';
  return 'Professional';
}

/**
 * Mock function to fetch user profile
 * In production, this would query your database
 */
async function fetchUserProfile(userId: string): Promise<User> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return {
    id: userId,
    interests: ['meditation', 'fitness', 'finance', 'reading'],
    recentActivities: [
      { activityId: 'act1', timestamp: new Date().toISOString(), completed: true },
      { activityId: 'act2', timestamp: new Date().toISOString(), completed: false },
      { activityId: 'act3', timestamp: new Date().toISOString(), completed: false }
    ],
    progress: {
      'spiritual': 45,
      'mental': 60,
      'emotional': 30,
      'physical': 75,
      'financial': 50,
      'professional': 40,
      'relational': 55
    }
  };
}

/**
 * Mock function to fetch activities by IDs
 * In production, this would query your database
 */
async function fetchActivitiesByIds(activityIds: string[]): Promise<RecommendationItem[]> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Mock data - in production this would come from your database
  return activityIds.map(id => ({
    id,
    type: 'activity' as const,
    title: `Activity ${id}`,
    description: 'Sample activity description',
    category: ['spiritual', 'mental', 'emotional', 'physical', 'financial', 'professional', 'relational'][
      Math.floor(Math.random() * 7)
    ],
    level: ['Beginner', 'Intermediate', 'Professional'][
      Math.floor(Math.random() * 3)
    ] as 'Beginner' | 'Intermediate' | 'Professional'
  }));
}

/**
 * Mock function to fetch activities by spoke and level
 * In production, this would query your database
 */
async function fetchActivitiesBySpokeAndLevel(
  spoke: string, 
  level: 'Beginner' | 'Intermediate' | 'Professional'
): Promise<RecommendationItem[]> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Mock data - in production this would come from your database
  return Array(5).fill(0).map((_, i) => ({
    id: `${spoke}-${level}-${i}`,
    type: 'activity' as const,
    title: `${level} ${spoke} activity ${i+1}`,
    description: `A ${level.toLowerCase()} level activity for the ${spoke} spoke`,
    category: spoke,
    level
  }));
}

/**
 * Rank recommendations by user preferences
 */
function rankRecommendationsByUserPreferences(
  recommendations: RecommendationItem[],
  user: User
): RecommendationItem[] {
  return recommendations.sort((a, b) => {
    // Calculate a score for each recommendation
    const scoreA = calculateUserPreferenceScore(a, user);
    const scoreB = calculateUserPreferenceScore(b, user);
    return scoreB - scoreA;
  });
}

/**
 * Calculate a preference score for a recommendation
 */
function calculateUserPreferenceScore(
  recommendation: RecommendationItem,
  user: User
): number {
  let score = recommendation.similarity || 0.5;
  
  // Boost score if in user's interests
  if (recommendation.category && user.interests.includes(recommendation.category.toLowerCase())) {
    score += 0.2;
  }
  
  // Adjust score based on level appropriateness
  if (recommendation.category && recommendation.level) {
    const userLevel = calculateUserLevel(user.progress[recommendation.category] || 0);
    if (userLevel === recommendation.level) {
      score += 0.1;
    } else if (
      (userLevel === 'Beginner' && recommendation.level === 'Intermediate') ||
      (userLevel === 'Intermediate' && recommendation.level === 'Professional')
    ) {
      score += 0.05; // Slightly boost "stretch" recommendations
    }
  }
  
  return score;
}

// Export types
export type {
  User,
  RecommendationItem,
  RecommendationOptions
}; 