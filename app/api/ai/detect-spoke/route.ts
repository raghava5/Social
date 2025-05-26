import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const SPOKE_DEFINITIONS = {
  'Spiritual': 'Related to spiritual growth, meditation, prayer, faith, mindfulness, religious practices, enlightenment, and inner peace.',
  'Mental': 'Related to mental health, psychology, emotions, stress management, therapy, counseling, thoughts, and mental well-being.',
  'Physical': 'Related to physical health, fitness, exercise, sports, nutrition, body care, workouts, and physical activities.',
  'Personal': 'Related to personal development, self-improvement, goals, habits, reflection, journaling, and individual growth.',
  'Professional': 'Related to work, career, business, professional development, job-related activities, leadership, and workplace topics.',
  'Financial': 'Related to money, finances, investments, budgeting, wealth building, financial planning, and economic matters.',
  'Social': 'Related to relationships, friendships, family, social interactions, community, networking, and interpersonal connections.',
  'Societal': 'Related to society, politics, social issues, community service, activism, volunteering, justice, and societal change.',
  'Fun & Recreation': 'Related to entertainment, hobbies, games, leisure activities, travel, recreation, fun experiences, and enjoyment.'
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      )
    }

    // Use OpenAI to analyze text and classify into spokes
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert content classifier. Your task is to analyze text content and classify it into one of these 9 "spokes" (life categories):

${Object.entries(SPOKE_DEFINITIONS).map(([spoke, definition]) => `${spoke}: ${definition}`).join('\n')}

Rules:
1. Return ONLY the spoke name (e.g., "Physical", "Mental", "Social")
2. Choose the MOST relevant spoke based on the primary theme
3. If the content doesn't clearly fit any category, return "General"
4. Be concise - return only the spoke name, nothing else
5. Consider the overall context and main focus of the content`
        },
        {
          role: "user",
          content: `Analyze this text and classify it into the most appropriate spoke:\n\n"${text}"`
        }
      ],
      max_tokens: 20,
      temperature: 0.1
    })

    const detectedSpoke = completion.choices[0]?.message?.content?.trim()

    // Validate the response is one of our valid spokes
    const validSpokes = Object.keys(SPOKE_DEFINITIONS)
    const finalSpoke = validSpokes.includes(detectedSpoke || '') ? detectedSpoke : null

    if (finalSpoke) {
      console.log(`🤖 AI detected spoke "${finalSpoke}" for text: "${text.substring(0, 100)}..."`)
    }

    return NextResponse.json({
      spoke: finalSpoke,
      confidence: finalSpoke ? 0.8 : 0.0,
      analysis: `AI classified this content as ${finalSpoke || 'unclassifiable'}`
    })

  } catch (error) {
    console.error('AI spoke detection error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content', spoke: null },
      { status: 500 }
    )
  }
} 