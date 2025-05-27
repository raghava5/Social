/**
 * Simple Test for Enhanced Spoke Detection Logic
 * Tests the core logic without requiring the full server
 */

// Mock the enhanced spoke detection logic locally
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
 * Simplified enhanced spoke detection
 */
function simpleEnhancedSpokeDetection(content, hasMedia = false) {
  console.log(`🔍 Testing enhanced detection for: "${content}" (${content.length} chars)`);
  
  const results = [];
  
  // Method 1: Exact keyword matching
  const exactMatch = exactKeywordAnalysis(content);
  if (exactMatch) results.push(exactMatch);
  
  // Method 2: Fuzzy matching for short content
  if (content.length <= 50) {
    const fuzzyMatch = fuzzyKeywordAnalysis(content);
    if (fuzzyMatch) results.push(fuzzyMatch);
  }
  
  // Method 3: Contextual pattern matching for ultra-short content
  if (content.length <= 30) {
    const contextualMatch = contextualPatternAnalysis(content);
    if (contextualMatch) results.push(contextualMatch);
  }
  
  // Method 4: Semantic similarity for challenging cases
  if (content.length <= 40 && results.length === 0) {
    const semanticMatch = semanticSimilarityAnalysis(content);
    if (semanticMatch) results.push(semanticMatch);
  }
  
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
function exactKeywordAnalysis(content) {
  const contentLower = content.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;
  
  for (const [spoke, keywords] of Object.entries(ENHANCED_SPOKE_KEYWORDS)) {
    let score = 0;
    const matches = [];
    
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
function fuzzyKeywordAnalysis(content) {
  const contentLower = content.toLowerCase();
  let bestMatch = null;
  let maxScore = 0;
  
  for (const [spoke, keywords] of Object.entries(ENHANCED_SPOKE_KEYWORDS)) {
    let score = 0;
    const matches = [];
    
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
function contextualPatternAnalysis(content) {
  console.log(`🎯 Contextual pattern analysis for: "${content}"`);
  
  for (const [spoke, patterns] of Object.entries(CONTEXTUAL_PATTERNS)) {
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        console.log(`🎯 Pattern match found: ${spoke} - matched "${match[0]}"`);
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
function semanticSimilarityAnalysis(content) {
  const semanticMappings = {
    'Physical': ['start jog', 'begin exercise', 'go running', 'do workout', 'physical activity'],
    'Personal': ['learn english', 'study language', 'develop skill', 'personal growth', 'self improvement'],
    'Social': ['meet friends', 'family time', 'social activity', 'group gathering'],
    'Fun & Recreation': ['have fun', 'enjoy time', 'recreation activity', 'leisure time']
  };
  
  const contentLower = content.toLowerCase().trim();
  
  for (const [spoke, phrases] of Object.entries(semanticMappings)) {
    for (const phrase of phrases) {
      // Simple similarity check
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
 * Select the best match from multiple results
 */
function selectBestMatch(results) {
  // Priority order: exact > contextual > semantic > fuzzy
  const methodPriority = { exact: 4, contextual: 3, semantic: 2, fuzzy: 1 };
  
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
 * Run tests
 */
function runTests() {
  console.log('🧪 Testing Enhanced Spoke Detection Logic...\n');
  
  const testCases = [
    {
      content: "hi image, lets start the jog",
      expected: "Physical",
      description: "Actual failing post #1 - should detect 'jog' as Physical"
    },
    {
      content: "hi lets learn some english",
      expected: "Personal", 
      description: "Actual failing post #2 - should detect 'learn english' as Personal"
    },
    {
      content: "going to gym",
      expected: "Physical",
      description: "Short physical activity"
    },
    {
      content: "family dinner",
      expected: "Social",
      description: "Family activity"
    },
    {
      content: "work meeting",
      expected: "Professional",
      description: "Work activity"
    },
    {
      content: "save money",
      expected: "Financial",
      description: "Financial activity"
    },
    {
      content: "morning run",
      expected: "Physical",
      description: "Physical exercise"
    },
    {
      content: "study session",
      expected: "Personal",
      description: "Learning activity"
    },
    {
      content: "meditation time",
      expected: "Spiritual",
      description: "Spiritual practice"
    },
    {
      content: "hello world",
      expected: null, // Should fail
      description: "Generic greeting - should fail"
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  console.log(`Running ${totalTests} test cases...\n`);
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📝 Test ${i + 1}: "${testCase.content}"`);
    console.log(`   Expected: ${testCase.expected || 'No detection'}`);
    console.log(`   Description: ${testCase.description}`);
    
    const result = simpleEnhancedSpokeDetection(testCase.content, testCase.content.includes('image'));
    
    if (result && result.spoke === testCase.expected) {
      console.log(`   ✅ PASSED: Detected "${result.spoke}" (${result.confidence}, ${result.method})`);
      passedTests++;
    } else if (!result && testCase.expected === null) {
      console.log(`   ✅ PASSED: Correctly failed to detect spoke`);
      passedTests++;
    } else {
      console.log(`   ❌ FAILED: Expected "${testCase.expected}", got "${result?.spoke || 'none'}"`);
    }
    
    console.log(); // Empty line for readability
  }
  
  // Summary
  console.log('📊 TEST SUMMARY:');
  console.log(`✅ Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Enhanced spoke detection is working correctly.');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('⚠️ Most tests passed. Enhanced spoke detection looks good!');
  } else {
    console.log('🚨 Multiple tests failed. Enhanced spoke detection needs improvements.');
  }
  
  return { passed: passedTests, total: totalTests, percentage: Math.round(passedTests/totalTests*100) };
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests, simpleEnhancedSpokeDetection }; 