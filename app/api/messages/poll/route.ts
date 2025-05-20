import { NextRequest, NextResponse } from 'next/server';
import { getUserQueue, queueMessageForUser, queueStatusUpdateForUser, queueTypingUpdateForUser } from '../queue';

// POST handler for polling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const queue = getUserQueue(userId);
    
    // Get messages, status updates, and typing updates
    const messages = queue.messages;
    const statusUpdates = queue.statusUpdates;
    const typingUpdates = queue.typingUpdates;
    
    // Clear the queues after reading
    queue.messages = [];
    queue.statusUpdates = [];
    queue.typingUpdates = [];
    
    return NextResponse.json({
      messages,
      statusUpdates,
      typingUpdates,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error polling messages:', error);
    return NextResponse.json({ error: 'Failed to poll messages' }, { status: 500 });
  }
}

// For simulation purposes, we'll add some test data
// In a real app, this would be triggered by actual events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Simulate adding a test message
    if (action === 'test-message') {
      queueMessageForUser(userId, {
        id: `test-${Date.now()}`,
        conversationId: 'test-conversation',
        content: 'This is a test message from the polling API',
        sender: {
          id: 'system',
          name: 'System',
          avatar: null
        },
        timestamp: new Date().toISOString(),
        status: 'sent',
        isEdited: false,
        isDeleted: false,
        reactions: [],
        attachments: [],
        readBy: [],
        deliveredTo: []
      });
      
      return NextResponse.json({ success: true, action: 'added test message' });
    }
    
    // Simulate adding a status update
    if (action === 'test-status') {
      queueStatusUpdateForUser(userId, {
        userId: 'test-user',
        isOnline: true,
        lastSeen: new Date().toISOString()
      });
      
      return NextResponse.json({ success: true, action: 'added test status' });
    }
    
    // Simulate adding a typing update
    if (action === 'test-typing') {
      queueTypingUpdateForUser(userId, {
        userId: 'test-user',
        username: 'Test User',
        conversationId: 'test-conversation',
        isTyping: true,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({ success: true, action: 'added test typing' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
} 