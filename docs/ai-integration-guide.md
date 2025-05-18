# Seven Spokes AI Integration Guide

This guide explains how to integrate the AI capabilities of Seven Spokes into your components and pages.

## Overview

Seven Spokes includes several AI features that can enhance the user experience:

1. **Personalized Recommendations** - Content and activity recommendations based on user behavior
2. **Smart Content Summarization** - Automatic summarization of longer content
3. **Activity Tracking** - Tracking user interactions to improve recommendations
4. **User Affinity Matching** - Connecting users with similar interests

## Activity Tracking

The activity tracking system collects data on user interactions to improve recommendations.

### Import and Basic Usage

```typescript
import { 
  trackPageView, 
  trackContentView, 
  trackActivityStart, 
  trackActivityComplete,
  trackRecommendationInteraction,
  trackFeedback
} from '@/app/api/ai/activity-tracking';

// Track a page view
trackPageView('/dashboard', userId);

// Track content view
trackContentView('content-123', 'article', userId);

// Track activity start/complete
trackActivityStart('activity-123', 'physical', userId);
trackActivityComplete('activity-123', 'physical', 300, userId); // 300 seconds completion time

// Track recommendation interactions
trackRecommendationInteraction('rec-123', 'click', 2, userId); // Position 2 in the list
```

### Available Tracking Methods

| Method | Description | Example Use Case |
|--------|-------------|-----------------|
| `trackPageView` | Track user viewing a page | Track dashboard visits |
| `trackContentView` | Track content consumption | Track article reading |
| `trackActivityStart` | Track beginning an activity | Track meditation session start |
| `trackActivityComplete` | Track completing an activity | Track workout completion |
| `trackRecommendationInteraction` | Track interaction with recommendations | Track clicks on suggested content |
| `trackFeedback` | Track user feedback | Track ratings and comments |

## Recommendations

The recommendation system provides personalized content and activity suggestions.

### AI Recommendations Component

The easiest way to add recommendations is with the `AIRecommendations` component:

```typescript
import AIRecommendations from '@/app/components/AIRecommendations';

// In your component:
<AIRecommendations userId={currentUser.id} />

// Category-specific recommendations:
<AIRecommendations userId={currentUser.id} category="physical" />
```

### Direct API Access

For more control, you can call the recommendations API directly:

```typescript
// Get personalized recommendations
const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser.id,
    type: 'activities', // or 'connections' or 'next_action'
    categories: ['physical', 'mental'], // optional filter
    limit: 5 // optional limit
  })
});

const { recommendations } = await response.json();
```

## Text Analysis

The text analysis services provide sentiment analysis, summarization, and more.

### Content Summarization

```typescript
// Get a summary of content
const response = await fetch('/api/ai/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: longArticleText,
    maxLength: 150 // optional max summary length
  })
});

const { summary } = await response.json();
```

### Sentiment Analysis

```typescript
// Analyze sentiment of text
const response = await fetch('/api/ai/sentiment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: userComment
  })
});

const { sentiment, score } = await response.json();
// sentiment is 'positive', 'neutral', or 'negative'
// score is a number between -1 and 1
```

## User Affinity Matching

Connect users with similar interests:

```typescript
// Find users with similar interests
const response = await fetch('/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser.id,
    type: 'connections',
    limit: 10
  })
});

const { recommendations } = await response.json();
// recommendations contains users with similar interests
```

## Admin Dashboard

The AI admin dashboard allows monitoring and management of the AI systems:

- **URL**: `/admin/ai`
- **Features**: 
  - Monitoring event processing
  - Tracking recommendation performance
  - Manually triggering data processing

## Best Practices

1. **Always Include User ID**: When tracking events, always include the user ID when available
2. **Track Meaningful Actions**: Focus on tracking actions that indicate user preferences
3. **Use Category Filters**: When showing recommendations, filter by relevant categories for the current context
4. **Respect Privacy**: Only use tracking data for improving user experience, never for external sharing

## Data Processing Pipeline

The data processing pipeline converts raw tracking events into user profiles:

1. **Collection**: Events are collected via tracking methods
2. **Processing**: Events are processed into user profiles
3. **Embedding**: User profiles are converted to embeddings for similarity matching
4. **Recommendation**: Embeddings are used to generate personalized recommendations

## Troubleshooting

If recommendations aren't working as expected:

1. Check that tracking events are being recorded
2. Verify the user has sufficient interaction history
3. Try using the fallback recommendations API
4. Check the admin dashboard for system status

## Further Development

To extend the AI capabilities:

1. Add new event types to the tracking system
2. Enhance the recommendation algorithms
3. Implement additional text analysis features
4. Create more specialized recommendation types 