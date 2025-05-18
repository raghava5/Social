import { NextRequest, NextResponse } from 'next/server'
import { analyzeConversation } from '../ai/text-analysis'

interface SmartRepliesRequest {
  messages: string[]
  userId: string
  conversationId?: string
  recipientId?: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json() as SmartRepliesRequest
    
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Valid messages array is required' },
        { status: 400 }
      )
    }
    
    // Generate reply suggestions based on conversation context
    const conversationAnalysis = await analyzeConversation(body.messages)
    
    // Get suggested responses from the analysis
    const suggestions = conversationAnalysis.suggestedResponses || []
    
    // If we don't have suggestions from the analysis, generate fallbacks based on intent
    if (suggestions.length === 0) {
      const lastMessage = body.messages[body.messages.length - 1]
      const fallbackSuggestions = generateFallbackSuggestions(lastMessage, conversationAnalysis.topTopics)
      
      return NextResponse.json({
        suggestions: fallbackSuggestions,
        sentiment: conversationAnalysis.overallSentiment,
        topics: conversationAnalysis.topTopics
      })
    }
    
    // Return the suggestions
    return NextResponse.json({
      suggestions,
      sentiment: conversationAnalysis.overallSentiment,
      topics: conversationAnalysis.topTopics
    })
  } catch (error) {
    console.error('Error generating smart replies:', error)
    return NextResponse.json(
      { error: 'Failed to generate reply suggestions' },
      { status: 500 }
    )
  }
}

function generateFallbackSuggestions(lastMessage: string, topics: string[]): string[] {
  // Simple fallback logic based on message content
  const lowerCaseMessage = lastMessage.toLowerCase()
  
  // Check for questions
  if (lowerCaseMessage.includes('?')) {
    return [
      "That's a good question. Let me think about it.",
      "I'm not entirely sure, but I'd love to discuss it more.",
      "Interesting question! What are your thoughts?"
    ]
  }
  
  // Check for greetings
  if (
    lowerCaseMessage.includes('hi') ||
    lowerCaseMessage.includes('hello') ||
    lowerCaseMessage.includes('hey')
  ) {
    return [
      "Hi there! How are you doing today?",
      "Hello! How's your day going?",
      "Hey! What's on your mind?"
    ]
  }
  
  // If message is short, it might be a brief statement
  if (lastMessage.split(' ').length < 5) {
    return [
      "Tell me more about that.",
      "I'd love to hear more details.",
      "That's interesting. What happened next?"
    ]
  }
  
  // Generic responses with topic awareness if available
  if (topics.length > 0) {
    const topicReplies: Record<string, string[]> = {
      'spiritual': [
        "I appreciate your perspective on spiritual growth.",
        "That's a meaningful insight about spirituality.",
        "How has this affected your spiritual practice?"
      ],
      'mental': [
        "Mental well-being is so important. How are you feeling about it?",
        "That's a thoughtful perspective on mental health.",
        "Have you tried any specific mental wellness practices?"
      ],
      'physical': [
        "Physical health is fundamental. What's been working well for you?",
        "That's a good approach to physical wellness.",
        "Have you noticed improvements in your physical routine?"
      ],
      'financial': [
        "Financial stability is definitely important. What's your next step?",
        "That's a practical approach to finances.",
        "Have you set specific financial goals?"
      ],
      'professional': [
        "Career growth takes time and intention. What's your focus area?",
        "That's a solid professional perspective.",
        "Have you considered mentorship in your professional journey?"
      ],
      'relational': [
        "Relationships require nurturing. How are you approaching that?",
        "That's a thoughtful way to consider relationships.",
        "Have you had meaningful conversations about this?"
      ],
      'emotional': [
        "Emotional awareness is powerful. How are you processing these feelings?",
        "That's a healthy way to approach emotions.",
        "Have you found effective ways to manage emotional wellbeing?"
      ]
    }
    
    // Return suggestions related to the top topic if available
    const topTopic = topics[0]
    if (topicReplies[topTopic]) {
      return topicReplies[topTopic]
    }
  }
  
  // Default generic responses
  return [
    "Thanks for sharing that with me.",
    "I understand where you're coming from.",
    "That makes a lot of sense."
  ]
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  )
} 