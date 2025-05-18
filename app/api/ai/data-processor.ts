import { createClient } from '@supabase/supabase-js';
import { EventType, TrackingEvent } from './activity-tracking';
import { generateEmbedding, storeEmbedding } from './embedding';

interface ProcessedUserProfile {
  userId: string;
  interests: string[];
  categoryPreferences: Record<string, number>;
  activityHistory: string[];
  contentInteractions: {
    contentId: string;
    interactionType: string;
    timestamp: string;
  }[];
  lastUpdated: string;
}

/**
 * Data Processor for turning raw tracking events into usable insights
 */
class DataProcessor {
  private supabase: any = null;
  private isInitialized = false;
  
  /**
   * Initialize the data processor
   */
  initialize() {
    if (this.isInitialized) return;
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    
    this.isInitialized = true;
  }
  
  /**
   * Process a batch of events and update user profiles
   */
  async processBatch(events: TrackingEvent[]): Promise<number> {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    if (!this.supabase) {
      console.warn('Cannot process events: Supabase client not initialized');
      return 0;
    }
    
    // Group events by user
    const eventsByUser: Record<string, TrackingEvent[]> = {};
    
    for (const event of events) {
      const userId = event.properties.userId;
      if (!userId) continue; // Skip events without a user ID
      
      if (!eventsByUser[userId]) {
        eventsByUser[userId] = [];
      }
      
      eventsByUser[userId].push(event);
    }
    
    // Process events for each user
    let processedCount = 0;
    
    for (const [userId, userEvents] of Object.entries(eventsByUser)) {
      try {
        await this.processUserEvents(userId, userEvents);
        processedCount += userEvents.length;
      } catch (error) {
        console.error(`Error processing events for user ${userId}:`, error);
      }
    }
    
    return processedCount;
  }
  
  /**
   * Process events for a single user
   */
  async processUserEvents(userId: string, events: TrackingEvent[]): Promise<void> {
    // Get current user profile or create new one if it doesn't exist
    const userProfile = await this.getUserProfile(userId);
    
    // Update profile based on events
    for (const event of events) {
      this.updateProfileWithEvent(userProfile, event);
    }
    
    // Update last updated timestamp
    userProfile.lastUpdated = new Date().toISOString();
    
    // Store updated profile
    await this.storeUserProfile(userProfile);
    
    // Generate and store embedding for the user
    await this.updateUserEmbedding(userProfile);
  }
  
  /**
   * Get user profile from database or create new one if it doesn't exist
   */
  async getUserProfile(userId: string): Promise<ProcessedUserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching user profile:', error);
    }
    
    if (data) {
      return data as ProcessedUserProfile;
    }
    
    // Create new profile if not found
    return {
      userId,
      interests: [],
      categoryPreferences: {},
      activityHistory: [],
      contentInteractions: [],
      lastUpdated: new Date().toISOString()
    };
  }
  
  /**
   * Update user profile based on a single event
   */
  updateProfileWithEvent(profile: ProcessedUserProfile, event: TrackingEvent): void {
    const { type, properties } = event;
    
    switch (type) {
      case 'content_view':
        // Add to content interactions
        if (properties.contentId && properties.contentType) {
          profile.contentInteractions.push({
            contentId: properties.contentId,
            interactionType: 'view',
            timestamp: properties.timestamp || new Date().toISOString()
          });
          
          // Limit to last 50 interactions
          if (profile.contentInteractions.length > 50) {
            profile.contentInteractions = profile.contentInteractions.slice(-50);
          }
        }
        break;
        
      case 'activity_start':
      case 'activity_complete':
        // Track activity history
        if (properties.activityId) {
          profile.activityHistory.push(properties.activityId);
          
          // Limit to last 30 activities
          if (profile.activityHistory.length > 30) {
            profile.activityHistory = profile.activityHistory.slice(-30);
          }
          
          // Update category preferences
          if (properties.spokeId) {
            profile.categoryPreferences[properties.spokeId] = 
              (profile.categoryPreferences[properties.spokeId] || 0) + 
              (type === 'activity_complete' ? 2 : 1); // Weight completions higher
          }
        }
        break;
        
      case 'recommendation_click':
        // Update interests based on recommendation clicks
        if (properties.recommendationId) {
          // Here we would ideally fetch the recommendation details
          // For now, just add it to content interactions
          profile.contentInteractions.push({
            contentId: properties.recommendationId,
            interactionType: 'click',
            timestamp: properties.timestamp || new Date().toISOString()
          });
        }
        break;
        
      case 'search_query':
        // Extract potential interests from search queries
        if (properties.searchQuery) {
          const keywords = properties.searchQuery
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3);
            
          // Add keywords as interests if not already present
          for (const keyword of keywords) {
            if (!profile.interests.includes(keyword)) {
              profile.interests.push(keyword);
              
              // Limit to 50 interests
              if (profile.interests.length > 50) {
                profile.interests.shift(); // Remove oldest
              }
            }
          }
        }
        break;
    }
  }
  
  /**
   * Store user profile to database
   */
  async storeUserProfile(profile: ProcessedUserProfile): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .upsert(profile, { onConflict: 'userId' });
      
    if (error) {
      console.error('Error storing user profile:', error);
      throw error;
    }
  }
  
  /**
   * Update user embedding for recommendation engine
   */
  async updateUserEmbedding(profile: ProcessedUserProfile): Promise<void> {
    // Generate text representation of user profile
    const profileText = [
      ...profile.interests,
      ...profile.activityHistory,
      ...Object.entries(profile.categoryPreferences)
        .map(([category, score]) => `${category}:${score}`)
    ].join(' ');
    
    // Generate embedding
    const embedding = await generateEmbedding(profileText);
    
    // Store embedding
    await storeEmbedding(
      profile.userId,
      'user',
      embedding,
      {
        lastUpdated: profile.lastUpdated,
        interestCount: profile.interests.length,
        activityCount: profile.activityHistory.length
      }
    );
  }
}

// Singleton instance
const dataProcessor = new DataProcessor();

export default dataProcessor;

// Scheduled processing function to be called by cron
export async function processTrackedEvents(): Promise<{
  processedCount: number, 
  status: string
}> {
  try {
    dataProcessor.initialize();
    
    // Fetch unprocessed events
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('user_events')
      .select('*')
      .eq('processed', false)
      .limit(100);
      
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      return { processedCount: 0, status: 'No unprocessed events found' };
    }
    
    // Process events
    const processedCount = await dataProcessor.processBatch(data);
    
    // Mark events as processed
    const eventIds = data.map(event => event.id);
    await supabase
      .from('user_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .in('id', eventIds);
    
    return { processedCount, status: 'Success' };
  } catch (error) {
    console.error('Error processing tracked events:', error);
    return { 
      processedCount: 0, 
      status: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 