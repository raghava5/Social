/**
 * Enhanced Spoke Detection System
 * Designed to handle minimal content where traditional keyword matching fails
 */

interface SpokeMatch {
  spoke: string;
  score: number;
  matches: string[];
  confidence: 'high' | 'medium' | 'low';
  method: 'exact' | 'fuzzy' | 'contextual' | 'ai' | 'semantic';
}

/**
 * Enhanced keyword sets with common variations and contextual clues
 */
const ENHANCED_SPOKE_KEYWORDS = {
  'Spiritual': {
    primary: ['spiritual', 'meditation', 'prayer', 'faith', 'soul', 'mindfulness', 'zen', 'enlightenment', 'divine', 'sacred', 'peace', 'wisdom', 'blessing'],
    contextual: ['pray', 'god', 'universe', 'chakra', 'karma', 'temple', 'church', 'peaceful', 'calm', 'serene'],
    fuzzy: ['spirit', 'meditat', 'religi', 'believ']
  },
  'Mental': {
    primary: ['mental', 'psychology', 'anxiety', 'depression', 'therapy', 'counseling', 'mind', 'thoughts', 'emotions', 'stress', 'wellbeing', 'cognitive', 'brain'],
    contextual: ['think', 'thinking', 'feel', 'feeling', 'mood', 'relax', 'worry', 'happy', 'sad', 'frustrated'],
    fuzzy: ['psycho', 'emotion', 'mental', 'brain']
  },
  'Physical': {
    primary: ['fitness', 'workout', 'exercise', 'gym', 'health', 'running', 'yoga', 'sports', 'physical', 'body', 'strength', 'training', 'muscle', 'cardio'],
    contextual: ['jog', 'jogging', 'walk', 'walking', 'swim', 'swimming', 'run', 'bike', 'hiking', 'stretch', 'lift', 'dance', 'active'],
    fuzzy: ['fit', 'train', 'sport', 'exercis', 'health']
  },
  'Personal': {
    primary: ['personal', 'self', 'growth', 'development', 'goals', 'habits', 'reflection', 'journal', 'diary', 'improvement', 'learning', 'skills'],
    contextual: ['learn', 'study', 'education', 'tutorial', 'course', 'lesson', 'practice', 'read', 'book', 'skill', 'hobby', 'cook', 'cooking', 'english', 'language'],
    fuzzy: ['learn', 'develop', 'grow', 'improv', 'skill']
  },
  'Professional': {
    primary: ['work', 'career', 'job', 'professional', 'business', 'office', 'meeting', 'project', 'team', 'leadership', 'workplace', 'corporate', 'management'],
    contextual: ['interview', 'client', 'presentation', 'strategy', 'deadline', 'boss', 'colleague', 'salary'],
    fuzzy: ['employ', 'career', 'profession', 'busines']
  },
  'Financial': {
    primary: ['money', 'financial', 'investment', 'savings', 'budget', 'income', 'expenses', 'wealth', 'economy', 'finance'],
    contextual: ['cost', 'price', 'dollar', 'economic', 'invest', 'save', 'spend', 'buy', 'sell', 'bank', 'loan'],
    fuzzy: ['financ', 'econom', 'money', 'invest']
  },
  'Social': {
    primary: ['friends', 'family', 'social', 'relationships', 'community', 'networking', 'people', 'connection', 'love', 'friendship'],
    contextual: ['together', 'group', 'children', 'parents', 'mother', 'father', 'brother', 'sister', 'friend', 'party', 'gathering'],
    fuzzy: ['social', 'friend', 'famil', 'relat']
  },
  'Societal': {
    primary: ['society', 'politics', 'news', 'social issues', 'community service', 'volunteering', 'activism', 'charity', 'justice', 'equality'],
    contextual: ['government', 'public', 'volunteer', 'help', 'community', 'activism', 'protest', 'voting'],
    fuzzy: ['politic', 'societ', 'communit', 'activ']
  },
  'Fun & Recreation': {
    primary: ['fun', 'entertainment', 'games', 'movies', 'music', 'travel', 'adventure', 'hobby', 'recreation', 'leisure'],
    contextual: ['vacation', 'party', 'celebration', 'enjoy', 'game', 'movie', 'song', 'trip', 'holiday', 'beach', 'nature'],
    fuzzy: ['entertain', 'recreat', 'vacat', 'holid']
  }
};

/**
 * Contextual patterns for ultra-short content
 */
const CONTEXTUAL_PATTERNS = {
  'Physical': [
    /\b(jog|run|walk|swim|bike|hike|exercise|workout|gym|fitness)\b/i,
    /\b(start|begin|going|do|doing)\s+(jog|run|walk|swim|bike|hike|exercise|workout)/i,
    /\b(morning|evening)\s+(jog|run|walk|swim|bike|exercise)/i
  ],
  'Personal': [
    /\b(learn|study|practice|read|cook|develop)\b/i,
    /\b(english|language|skill|hobby|cooking|reading)\b/i,
    /\b(start|begin|going|do|doing)\s+(learn|study|practice|read|cook)/i,
    /\b(some|new)\s+(english|language|skill|hobby)/i
  ],
  'Social': [
    /\b(family|friend|people|together|group|party|gathering)\b/i,
    /\b(with|meet|visit|see)\s+(family|friend|people)/i
  ],
  'Fun & Recreation': [
    /\b(fun|enjoy|vacation|holiday|travel|adventure|game|movie|music)\b/i,
    /\b(going|visit|see)\s+(beach|nature|park|movie|concert)/i
  ]
};

/**
 * Enhanced spoke detection with multiple analysis methods
 */
export async function enhancedSpokeDetection(content: string, hasMedia: boolean = false): Promise<SpokeMatch | null> {
  console.log(`🔍 Enhanced spoke detection for: "${content}" (${content.length} chars, hasMedia: ${hasMedia})`);
  
  const results: SpokeMatch[] = [];
  
  // Method 1: Exact keyword matching (highest confidence)
  const exactMatch = await exactKeywordAnalysis(content);
  if (exactMatch) results.push(exactMatch);
  
  // Method 2: Fuzzy/partial matching for short content
  if (content.length <= 50) {
    const fuzzyMatch = await fuzzyKeywordAnalysis(content);
    if (fuzzyMatch) results.push(fuzzyMatch);
  }
  
  // Method 3: Contextual pattern matching for ultra-short content
  if (content.length <= 30) {
    const contextualMatch = await contextualPatternAnalysis(content);
    if (contextualMatch) results.push(contextualMatch);
  }
  
  // Method 4: Semantic similarity for challenging cases
  if (content.length <= 40 && results.length === 0) {
    const semanticMatch = await semanticSimilarityAnalysis(content);
    if (semanticMatch) results.push(semanticMatch);
  }
  
  // Method 5: AI fallback for minimal content
  if (content.length <= 50 && results.length === 0) {
    const aiMatch = await aiBasedAnalysis(content, hasMedia);
    if (aiMatch) results.push(aiMatch);
  }
  
  // Select best match based on confidence and method priority
  if (results.length === 0) {
    console.log(`❌ No spoke detected after all methods`);
    return null;
  }
  
  const bestMatch = selectBestMatch(results);
  console.log(`✅ Best match: ${bestMatch.spoke} (${bestMatch.confidence}, ${bestMatch.method})`);
  
  return bestMatch;
}

/**
 * Method 1: Exact keyword matching with word boundaries
 */
async function exactKeywordAnalysis(content: string): Promise<SpokeMatch | null> {
  const contentLower = content.toLowerCase();
  let bestMatch: SpokeMatch | null = null;
  let maxScore = 0;
  
  for (const [spoke, keywords] of Object.entries(ENHANCED_SPOKE_KEYWORDS)) {
    let score = 0;
    const matches: string[] = [];
    
    for (const keyword of keywords.primary) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const foundMatches = contentLower.match(regex);
      if (foundMatches) {
        score += foundMatches.length * 2; // High weight for exact matches
        matches.push(keyword);
      }
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = {
        spoke,
        score,
        matches,
        confidence: score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low',
        method: 'exact'
      };
    }
  }
  
  return bestMatch && maxScore >= 1 ? bestMatch : null;
}

/**
 * Method 2: Fuzzy matching for partial keywords in short content
 */
async function fuzzyKeywordAnalysis(content: string): Promise<SpokeMatch | null> {
  const contentLower = content.toLowerCase();
  let bestMatch: SpokeMatch | null = null;
  let maxScore = 0;
  
  for (const [spoke, keywords] of Object.entries(ENHANCED_SPOKE_KEYWORDS)) {
    let score = 0;
    const matches: string[] = [];
    
    // Check contextual keywords with lower threshold
    for (const keyword of keywords.contextual) {
      if (contentLower.includes(keyword)) {
        score += 1.5; // Medium weight for contextual matches
        matches.push(`contextual:${keyword}`);
      }
    }
    
    // Check fuzzy matches
    for (const fuzzyKeyword of keywords.fuzzy) {
      if (contentLower.includes(fuzzyKeyword)) {
        score += 1; // Lower weight for fuzzy matches
        matches.push(`fuzzy:${fuzzyKeyword}`);
      }
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = {
        spoke,
        score,
        matches,
        confidence: score >= 3 ? 'medium' : 'low',
        method: 'fuzzy'
      };
    }
  }
  
  return bestMatch && maxScore >= 1 ? bestMatch : null;
}

/**
 * Method 3: Contextual pattern matching for ultra-short content
 */
async function contextualPatternAnalysis(content: string): Promise<SpokeMatch | null> {
  console.log(`🎯 Contextual pattern analysis for: "${content}"`);
  
  for (const [spoke, patterns] of Object.entries(CONTEXTUAL_PATTERNS)) {
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        console.log(`🎯 Pattern match found: ${spoke} - ${pattern} matched "${match[0]}"`);
        return {
          spoke,
          score: 2,
          matches: [`pattern:${match[0]}`],
          confidence: 'medium',
          method: 'contextual'
        };
      }
    }
  }
  
  return null;
}

/**
 * Method 4: Semantic similarity analysis for challenging cases
 */
async function semanticSimilarityAnalysis(content: string): Promise<SpokeMatch | null> {
  // This is a simplified semantic analysis - in a real implementation,
  // you would use embeddings or transformer models
  
  const semanticMappings = {
    'Physical': ['start jog', 'begin exercise', 'go running', 'do workout', 'physical activity'],
    'Personal': ['learn english', 'study language', 'develop skill', 'personal growth', 'self improvement'],
    'Social': ['meet friends', 'family time', 'social activity', 'group gathering'],
    'Fun & Recreation': ['have fun', 'enjoy time', 'recreation activity', 'leisure time']
  };
  
  const contentLower = content.toLowerCase().trim();
  
  for (const [spoke, phrases] of Object.entries(semanticMappings)) {
    for (const phrase of phrases) {
      // Simple similarity check - could be enhanced with Levenshtein distance
      if (contentLower.includes(phrase.split(' ')[0]) && contentLower.includes(phrase.split(' ')[1])) {
        return {
          spoke,
          score: 1.5,
          matches: [`semantic:${phrase}`],
          confidence: 'medium',
          method: 'semantic'
        };
      }
    }
  }
  
  return null;
}

/**
 * Method 5: AI-based analysis for minimal content
 */
async function aiBasedAnalysis(content: string, hasMedia: boolean): Promise<SpokeMatch | null> {
  try {
    console.log(`🤖 AI analysis for minimal content: "${content}"`);
    
    const response = await fetch('http://localhost:3000/api/ai/detect-spoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: content,
        isMinimalContent: true,
        hasMedia,
        context: 'Enhanced spoke detection for very short content that may need contextual inference'
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.spoke && result.confidence > 0.3) { // Lower threshold for AI on minimal content
        return {
          spoke: result.spoke,
          score: result.confidence * 2,
          matches: [`ai:${result.analysis || 'AI classification'}`],
          confidence: result.confidence > 0.7 ? 'high' : result.confidence > 0.5 ? 'medium' : 'low',
          method: 'ai'
        };
      }
    }

    return null;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return null;
  }
}

/**
 * Select the best match from multiple results
 */
function selectBestMatch(results: SpokeMatch[]): SpokeMatch {
  // Priority order: exact > contextual > semantic > fuzzy > ai
  const methodPriority = { exact: 5, contextual: 4, semantic: 3, fuzzy: 2, ai: 1 };
  
  return results.reduce((best, current) => {
    // First compare by confidence level
    if (current.confidence === 'high' && best.confidence !== 'high') return current;
    if (best.confidence === 'high' && current.confidence !== 'high') return best;
    
    // Then by method priority
    if (methodPriority[current.method] > methodPriority[best.method]) return current;
    if (methodPriority[best.method] > methodPriority[current.method]) return best;
    
    // Finally by score
    return current.score > best.score ? current : best;
  });
}

/**
 * Test the enhanced detection with example minimal content
 */
export async function testEnhancedDetection() {
  const testCases = [
    "hi image, lets start the jog",
    "hi lets learn some english",
    "going to gym",
    "family dinner",
    "work meeting",
    "save money",
    "hello world"
  ];
  
  console.log('🧪 Testing enhanced spoke detection...');
  
  for (const content of testCases) {
    console.log(`\n📝 Testing: "${content}"`);
    const result = await enhancedSpokeDetection(content, false);
    if (result) {
      console.log(`✅ Result: ${result.spoke} (${result.confidence}, ${result.method})`);
    } else {
      console.log(`❌ No spoke detected`);
    }
  }
} 