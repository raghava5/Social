// Text analysis utilities for sentiment, intent, topic detection and spoke tagging

// Simple intent categories
export type IntentType = 'question' | 'help_request' | 'greeting' | 'gratitude' | 'information' | 'unknown';

// Nine Spokes System
export type SpokeType = 'Spiritual' | 'Mental' | 'Physical' | 'Personal' | 'Professional' | 'Financial' | 'Social' | 'Mindfulness' | 'Leadership';

// Spoke keyword mapping
const SPOKE_KEYWORDS: Record<SpokeType, string[]> = {
  'Spiritual': ['god', 'prayer', 'faith', 'soul', 'spirit', 'divine', 'blessed', 'gratitude', 'meditation', 'worship', 'church', 'temple', 'scripture', 'purpose', 'meaning', 'peace'],
  'Mental': ['anxiety', 'depression', 'stress', 'therapy', 'counseling', 'psychology', 'mental health', 'mind', 'thoughts', 'emotions', 'feelings', 'overwhelmed', 'panic', 'worry', 'calm'],
  'Physical': ['exercise', 'workout', 'fitness', 'gym', 'running', 'training', 'health', 'nutrition', 'diet', 'weight', 'muscle', 'cardio', 'strength', 'energy', 'stamina', 'athletic'],
  'Personal': ['growth', 'development', 'self-improvement', 'goals', 'habits', 'discipline', 'motivation', 'confidence', 'self-esteem', 'identity', 'values', 'personality', 'character', 'music', 'piano', 'guitar', 'singing', 'art', 'creative', 'hobby', 'skill', 'learning', 'practice', 'talent', 'passion'],
  'Professional': ['work', 'career', 'job', 'business', 'office', 'colleagues', 'boss', 'promotion', 'salary', 'skills', 'productivity', 'deadlines', 'meeting', 'project', 'client'],
  'Financial': ['money', 'budget', 'savings', 'investment', 'income', 'expenses', 'debt', 'loan', 'bank', 'financial', 'wealth', 'economy', 'stocks', 'retirement'],
  'Social': ['friends', 'family', 'relationship', 'dating', 'marriage', 'social', 'community', 'people', 'connection', 'love', 'friendship', 'partner', 'gathering', 'party'],
  'Mindfulness': ['mindfulness', 'meditation', 'awareness', 'present', 'moment', 'breathe', 'breathing', 'zen', 'peaceful', 'calm', 'centered', 'grounded', 'observe', 'attention'],
  'Leadership': ['leadership', 'leader', 'team', 'management', 'decision', 'responsibility', 'authority', 'influence', 'inspire', 'motivate', 'guide', 'mentor', 'vision', 'strategy']
};

export interface TextAnalysisResult {
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  intent: {
    type: IntentType;
    confidence: number;
  };
  topics: string[];
  toxicity: {
    isToxic: boolean;
    score: number;
  };
  spokeTag: {
    spoke: SpokeType;
    confidence: number;
    reasoning: string;
  };
}

// Spoke detection function
export function detectSpoke(text: string): { spoke: SpokeType; confidence: number; reasoning: string } {
  const normalizedText = text.toLowerCase();
  const spokeScores: Record<SpokeType, { score: number; matches: string[] }> = {
    'Spiritual': { score: 0, matches: [] },
    'Mental': { score: 0, matches: [] },
    'Physical': { score: 0, matches: [] },
    'Personal': { score: 0, matches: [] },
    'Professional': { score: 0, matches: [] },
    'Financial': { score: 0, matches: [] },
    'Social': { score: 0, matches: [] },
    'Mindfulness': { score: 0, matches: [] },
    'Leadership': { score: 0, matches: [] }
  };

  // Score each spoke based on keyword matches
  Object.entries(SPOKE_KEYWORDS).forEach(([spoke, keywords]) => {
    const spokeKey = spoke as SpokeType;
    keywords.forEach(keyword => {
      if (normalizedText.includes(keyword)) {
        spokeScores[spokeKey].score += 1;
        spokeScores[spokeKey].matches.push(keyword);
      }
    });
  });

  // Find the spoke with the highest score
  const sortedSpokes = Object.entries(spokeScores)
    .sort(([, a], [, b]) => b.score - a.score)
    .filter(([, data]) => data.score > 0);

  if (sortedSpokes.length === 0) {
    return {
      spoke: 'Personal',
      confidence: 0.3,
      reasoning: 'No specific keywords found, defaulting to Personal development'
    };
  }

  const [topSpoke, topData] = sortedSpokes[0];
  const confidence = Math.min(topData.score / 5, 1);
  const reasoning = `Matched keywords: ${topData.matches.slice(0, 3).join(', ')}`;

  return {
    spoke: topSpoke as SpokeType,
    confidence,
    reasoning
  };
}

// Basic text analysis function with spoke detection
export async function analyzeText(text: string): Promise<TextAnalysisResult> {
  const normalizedText = text.toLowerCase();
  
  // Basic sentiment (simplified)
  const positiveWords = ['happy', 'great', 'amazing', 'good', 'love', 'excellent'];
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'horrible'];
  
  let sentiment = 0;
  positiveWords.forEach(word => {
    if (normalizedText.includes(word)) sentiment += 1;
  });
  negativeWords.forEach(word => {
    if (normalizedText.includes(word)) sentiment -= 1;
  });
  
  const sentimentScore = Math.max(-1, Math.min(1, sentiment / 3));
  let sentimentLabel: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (sentimentScore > 0.2) sentimentLabel = 'positive';
  if (sentimentScore < -0.2) sentimentLabel = 'negative';
  
  // Basic intent detection
  let intentType: IntentType = 'information';
  let intentConfidence = 0.6;
  
  if (normalizedText.includes('?')) {
    intentType = 'question';
    intentConfidence = 0.8;
  } else if (normalizedText.match(/^(hi|hello|hey)/)) {
    intentType = 'greeting';
    intentConfidence = 0.9;
  } else if (normalizedText.includes('help')) {
    intentType = 'help_request';
    intentConfidence = 0.7;
  } else if (normalizedText.includes('thank')) {
    intentType = 'gratitude';
    intentConfidence = 0.8;
  }
  
  // Basic topics
  const topics: string[] = [];
  if (normalizedText.includes('work') || normalizedText.includes('job')) topics.push('professional');
  if (normalizedText.includes('friend') || normalizedText.includes('family')) topics.push('social');
  if (normalizedText.includes('money') || normalizedText.includes('budget')) topics.push('financial');
  
  // Detect spoke
  const spokeTag = detectSpoke(text);

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
      isToxic: false,
      score: 0
    },
    spokeTag
  };
}

// Analyze conversation for smart replies
export async function analyzeConversation(messages: string[]): Promise<{
  context: string;
  tone: 'formal' | 'casual' | 'supportive' | 'professional';
  suggestedReplies: string[];
}> {
  const lastMessage = messages[messages.length - 1] || '';
  const normalizedText = lastMessage.toLowerCase();
  
  // Determine tone
  let tone: 'formal' | 'casual' | 'supportive' | 'professional' = 'casual';
  if (normalizedText.includes('please') || normalizedText.includes('thank you')) {
    tone = 'formal';
  } else if (normalizedText.includes('help') || normalizedText.includes('support')) {
    tone = 'supportive';
  } else if (normalizedText.includes('work') || normalizedText.includes('business')) {
    tone = 'professional';
  }
  
  // Generate context
  const context = `Conversation about ${messages.length > 1 ? 'ongoing discussion' : 'initial message'}`;
  
  // Generate suggested replies based on tone and content
  const suggestedReplies: string[] = [];
  
  if (normalizedText.includes('?')) {
    suggestedReplies.push("That's a great question!");
    suggestedReplies.push("Let me think about that...");
    suggestedReplies.push("I'd be happy to help with that.");
  } else if (normalizedText.includes('thank')) {
    suggestedReplies.push("You're welcome!");
    suggestedReplies.push("Happy to help!");
    suggestedReplies.push("Anytime!");
  } else {
    suggestedReplies.push("That's interesting!");
    suggestedReplies.push("Tell me more about that.");
    suggestedReplies.push("I understand.");
  }
  
  return {
    context,
    tone,
    suggestedReplies
  };
}

// Summarize text content
export async function summarizeText(text: string, maxLength: number = 100): Promise<{
  summary: string;
  keyPoints: string[];
  wordCount: number;
}> {
  const words = text.split(/\s+/);
  const wordCount = words.length;
  
  // Simple summarization - take first few sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const maxSentences = Math.max(1, Math.floor(maxLength / 20));
  const summarySentences = sentences.slice(0, maxSentences);
  const summary = summarySentences.join('. ') + (summarySentences.length > 0 ? '.' : '');
  
  // Extract key points (simple approach - look for important words)
  const keyWords = ['important', 'key', 'main', 'significant', 'crucial', 'essential'];
  const keyPoints: string[] = [];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    if (keyWords.some(word => lowerSentence.includes(word))) {
      keyPoints.push(sentence.trim());
    }
  });
  
  // If no key points found, use first few sentences
  if (keyPoints.length === 0 && sentences.length > 0) {
    keyPoints.push(sentences[0].trim());
  }
  
  return {
    summary: summary.length > maxLength ? summary.substring(0, maxLength) + '...' : summary,
    keyPoints: keyPoints.slice(0, 3), // Limit to 3 key points
    wordCount
  };
} 