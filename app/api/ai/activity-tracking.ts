import { createClient } from '@supabase/supabase-js';

// Event types that we track in the system
export type EventType = 
  // Content interaction events
  | 'page_view'
  | 'content_view' 
  | 'content_complete'
  | 'content_share'
  
  // User action events
  | 'activity_start'
  | 'activity_complete'
  | 'activity_abandon'
  
  // Engagement events
  | 'search_query'
  | 'recommendation_click'
  | 'recommendation_ignore' 
  | 'recommendation_dismiss'
  
  // Feedback events
  | 'feedback_submit'
  | 'rating_submit';

// Properties that can be attached to events
export interface EventProperties {
  // General properties
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  url?: string;
  
  // Content properties
  contentId?: string;
  contentType?: string;
  contentCategory?: string;
  
  // Activity properties
  activityId?: string;
  spokeId?: string;
  subcategoryId?: string;
  activityLevel?: string;
  completionTime?: number;
  
  // Search properties
  searchQuery?: string;
  searchResultCount?: number;
  
  // Recommendation properties
  recommendationId?: string;
  recommendationType?: string;
  position?: number;
  
  // Feedback properties
  feedbackText?: string;
  feedbackType?: string;
  rating?: number;
  
  // Custom properties
  [key: string]: any;
}

// Event interface
export interface TrackingEvent {
  id?: string;
  type: EventType;
  properties: EventProperties;
  createdAt?: string;
}

/**
 * Tracking service for collecting user activity data
 */
class TrackingService {
  private queue: TrackingEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private supabase: any = null;
  private isInitialized = false;
  
  /**
   * Initialize the tracking service
   */
  initialize() {
    if (this.isInitialized) return;
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    
    // Set up auto-flush interval (every 30 seconds)
    this.flushInterval = setInterval(() => this.flush(), 30000);
    
    this.isInitialized = true;
  }
  
  /**
   * Track an event
   */
  async track(type: EventType, properties: EventProperties): Promise<boolean> {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    // Ensure we have the timestamp
    const event: TrackingEvent = {
      type,
      properties: {
        ...properties,
        timestamp: properties.timestamp || new Date().toISOString()
      }
    };
    
    // Add to queue
    this.queue.push(event);
    
    // If queue gets too big, flush immediately
    if (this.queue.length >= 20) {
      this.flush();
    }
    
    return true;
  }
  
  /**
   * Flush the queue to storage
   */
  async flush(): Promise<boolean> {
    if (this.queue.length === 0) return true;
    
    // Take events from queue
    const events = [...this.queue];
    this.queue = [];
    
    // Store in Supabase if available
    if (this.supabase) {
      try {
        const { error } = await this.supabase
          .from('user_events')
          .insert(events);
          
        if (error) {
          console.error('Error storing events:', error);
          // Put events back in queue for retry
          this.queue = [...events, ...this.queue];
          return false;
        }
      } catch (err) {
        console.error('Failed to store events:', err);
        // Put events back in queue for retry
        this.queue = [...events, ...this.queue];
        return false;
      }
    } else {
      // Just log events if no storage is available
      console.log('Events would be stored (development mode):', events);
    }
    
    return true;
  }
  
  /**
   * Clean up resources when service is no longer needed
   */
  cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Final flush
    this.flush();
  }
}

// Singleton instance
const trackingService = new TrackingService();

// Export singleton
export default trackingService;

// Convenience tracking functions
export const trackPageView = (url: string, userId?: string) => {
  return trackingService.track('page_view', {
    url,
    userId
  });
};

export const trackContentView = (contentId: string, contentType: string, userId?: string) => {
  return trackingService.track('content_view', {
    contentId,
    contentType,
    userId
  });
};

export const trackActivityStart = (activityId: string, spokeId: string, userId?: string) => {
  return trackingService.track('activity_start', {
    activityId,
    spokeId,
    userId
  });
};

export const trackActivityComplete = (
  activityId: string, 
  spokeId: string, 
  completionTime: number,
  userId?: string
) => {
  return trackingService.track('activity_complete', {
    activityId,
    spokeId,
    completionTime,
    userId
  });
};

export const trackRecommendationInteraction = (
  recommendationId: string,
  type: 'click' | 'ignore' | 'dismiss',
  position: number,
  userId?: string
) => {
  const eventType = `recommendation_${type}` as EventType;
  
  return trackingService.track(eventType, {
    recommendationId,
    position,
    userId
  });
};

export const trackFeedback = (
  feedbackType: string,
  feedbackText: string,
  contentId?: string,
  userId?: string
) => {
  return trackingService.track('feedback_submit', {
    feedbackType,
    feedbackText,
    contentId,
    userId
  });
};

export const trackRating = (
  contentId: string,
  contentType: string,
  rating: number,
  userId?: string
) => {
  return trackingService.track('rating_submit', {
    contentId,
    contentType,
    rating,
    userId
  });
}; 