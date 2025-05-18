// Text analysis utilities for sentiment, intent and topic detection

// Basic dictionary-based sentiment analysis
// This is a simple implementation that can be replaced with a more sophisticated model
const POSITIVE_WORDS = new Set([
  'happy', 'joy', 'excited', 'amazing', 'great', 'awesome', 'excellent', 'good', 'love', 'like',
  'wonderful', 'fantastic', 'positive', 'beautiful', 'perfect', 'glad', 'delighted', 'grateful'
]);

const NEGATIVE_WORDS = new Set([
  'sad', 'angry', 'upset', 'terrible', 'horrible', 'bad', 'awful', 'disappointed', 'hate', 'dislike',
  'unfortunate', 'poor', 'negative', 'ugly', 'worst', 'sorry', 'regret', 'miserable', 'depressed'
]);

// Simple intent categories
type IntentType = 'question' | 'help_request' | 'greeting' | 'gratitude' | 'information' | 'unknown';

interface TextAnalysisResult {
  sentiment: {
    score: number;  // -1 to 1 range
    label: 'positive' | 'negative' | 'neutral';
  };
  intent: {
    type: IntentType;
    confidence: number;
  };
  topics: string[];
  toxicity: {
    isToxic: boolean;
    score: number; // 0 to 1 range
  };
}

// Basic text analysis function
export async function analyzeText(text: string): Promise<TextAnalysisResult> {
  // Normalize text
  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/);
  
  // Sentiment analysis
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (POSITIVE_WORDS.has(word)) positiveCount++;
    if (NEGATIVE_WORDS.has(word)) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  let sentimentScore = 0;
  if (totalSentimentWords > 0) {
    sentimentScore = (positiveCount - negativeCount) / totalSentimentWords;
  }
  
  let sentimentLabel: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (sentimentScore > 0.2) sentimentLabel = 'positive';
  if (sentimentScore < -0.2) sentimentLabel = 'negative';
  
  // Basic intent detection
  let intentType: IntentType = 'unknown';
  let intentConfidence = 0.5;
  
  if (normalizedText.includes('?') || normalizedText.match(/^(what|how|why|when|who|where|is|are|can|could|would|will)/)) {
    intentType = 'question';
    intentConfidence = 0.8;
  } else if (normalizedText.match(/^(hi|hello|hey|greetings)/)) {
    intentType = 'greeting';
    intentConfidence = 0.9;
  } else if (normalizedText.match(/(help|assist|support|guidance|advice)/)) {
    intentType = 'help_request';
    intentConfidence = 0.7;
  } else if (normalizedText.match(/(thanks|thank you|grateful|appreciate)/)) {
    intentType = 'gratitude';
    intentConfidence = 0.9;
  } else if (words.length > 5) {
    intentType = 'information';
    intentConfidence = 0.6;
  }
  
  // Simplified topic detection (in production, this would use a proper topic model)
  const topics: string[] = [];
  const topicKeywords: Record<string, string[]> = {
    'health': ['health', 'exercise', 'fitness', 'diet', 'wellness', 'workout'],
    'finance': ['money', 'finance', 'budget', 'invest', 'financial', 'savings'],
    'relationships': ['friend', 'family', 'partner', 'relationship', 'social', 'connect'],
    'mental': ['stress', 'anxiety', 'mental', 'meditation', 'mindfulness', 'calm'],
    'spiritual': ['spirit', 'soul', 'faith', 'belief', 'meditation', 'purpose'],
    'professional': ['work', 'job', 'career', 'professional', 'business', 'skill'],
    'emotional': ['emotion', 'feel', 'feeling', 'happy', 'sad', 'angry']
  };
  
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => normalizedText.includes(keyword))) {
      topics.push(topic);
    }
  });
  
  // Basic toxicity detection (simplified)
  const TOXIC_WORDS = new Set([
    'hate', 'stupid', 'idiot', 'dumb', 'jerk', 'loser', 'worthless',
    'kill', 'die', 'attack', 'violent', 'assault'
  ]);
  
  let toxicCount = 0;
  words.forEach(word => {
    if (TOXIC_WORDS.has(word)) toxicCount++;
  });
  
  const toxicityScore = Math.min(toxicCount / words.length * 5, 1);
  
  return {
    sentiment: {
      score: sentimentScore,
      label: sentimentLabel
    },
    intent: {
      type: intentType,
      confidence: intentConfidence
    },
    topics,
    toxicity: {
      isToxic: toxicityScore > 0.3,
      score: toxicityScore
    }
  };
}

// Message analysis for conversation context
export async function analyzeConversation(messages: string[]): Promise<{
  overallSentiment: number;
  topTopics: string[];
  isToxic: boolean;
  suggestedResponses?: string[];
}> {
  const analysisResults = await Promise.all(messages.map(msg => analyzeText(msg)));
  
  // Calculate overall sentiment
  const overallSentiment = analysisResults.reduce((sum, result) => sum + result.sentiment.score, 0) / analysisResults.length;
  
  // Find top topics
  const topicCounts: Record<string, number> = {};
  analysisResults.forEach(result => {
    result.topics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });
  
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => topic);
  
  // Check for toxicity
  const isToxic = analysisResults.some(result => result.toxicity.isToxic);
  
  // Generate suggested responses (placeholder - would be more sophisticated in production)
  const lastMessageAnalysis = analysisResults[analysisResults.length - 1];
  const suggestedResponses: string[] = [];
  
  if (lastMessageAnalysis.intent.type === 'question') {
    suggestedResponses.push("I'm not sure, but I'll find out for you!");
    suggestedResponses.push("That's a good question, let me think about it.");
  } else if (lastMessageAnalysis.intent.type === 'greeting') {
    suggestedResponses.push("Hi there! How are you doing today?");
    suggestedResponses.push("Hello! Hope you're having a great day!");
  } else if (lastMessageAnalysis.intent.type === 'help_request') {
    suggestedResponses.push("I'd be happy to help with that.");
    suggestedResponses.push("Let me see how I can assist you.");
  } else if (lastMessageAnalysis.intent.type === 'gratitude') {
    suggestedResponses.push("You're welcome!");
    suggestedResponses.push("Glad I could help!");
  }
  
  return {
    overallSentiment,
    topTopics,
    isToxic,
    suggestedResponses: suggestedResponses.length > 0 ? suggestedResponses : undefined
  };
}

// Export text summarization function
export async function summarizeText(text: string, maxLength: number = 100): Promise<string> {
  // Simplified extractive summarization
  // In production, this would use a proper summarization model
  
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length <= 3) return text;
  
  // Simple importance scoring by sentence length and position
  const scoredSentences = sentences.map((sentence, index) => {
    const words = sentence.trim().split(/\s+/);
    // Score based on word count (longer = more important) and position (earlier = more important)
    const score = (words.length / 20) + (1 / (index + 1));
    return { sentence, score };
  });
  
  // Sort by score and take top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => text.indexOf(a.sentence) - text.indexOf(b.sentence)) // Restore original order
    .map(item => item.sentence);
  
  let summary = topSentences.join(' ');
  
  // Truncate if still too long
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...';
  }
  
  return summary;
}

// Export all functions
export {
  TextAnalysisResult,
  IntentType
}; 