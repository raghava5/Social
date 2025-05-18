import { NextRequest, NextResponse } from 'next/server';

// In a real app, these would be persistent queues
// For this demo, we'll use in-memory storage
interface MessageQueue {
  [userId: string]: {
    messages: any[];
    statusUpdates: any[];
    typingUpdates: any[];
    lastPolled: number;
  };
}

const messageQueues: MessageQueue = {};

// Helper to get or create a user's message queue
const getUserQueue = (userId: string) => {
  if (!messageQueues[userId]) {
    messageQueues[userId] = {
      messages: [],
      statusUpdates: [],
      typingUpdates: [],
      lastPolled: Date.now()
    };
  }
  return messageQueues[userId];
};

// Add a message to a user's queue
export const queueMessageForUser = (userId: string, message: any) => {
  const queue = getUserQueue(userId);
  queue.messages.push(message);
  
  // Clean up old messages (keep last 100)
  if (queue.messages.length > 100) {
    queue.messages = queue.messages.slice(-100);
  }
};

// Add a status update to a user's queue
export const queueStatusUpdateForUser = (userId: string, status: any) => {
  const queue = getUserQueue(userId);
  
  // Replace any existing status for the same user
  const existingIndex = queue.statusUpdates.findIndex(
    (s: any) => s.userId === status.userId
  );
  
  if (existingIndex !== -1) {
    queue.statusUpdates[existingIndex] = status;
  } else {
    queue.statusUpdates.push(status);
  }
  
  // Clean up old statuses (keep last 50)
  if (queue.statusUpdates.length > 50) {
    queue.statusUpdates = queue.statusUpdates.slice(-50);
  }
};

// Add a typing update to a user's queue
export const queueTypingUpdateForUser = (userId: string, typingStatus: any) => {
  const queue = getUserQueue(userId);
  
  // Replace any existing typing status for the same user/conversation
  const existingIndex = queue.typingUpdates.findIndex(
    (t: any) => t.userId === typingStatus.userId && t.conversationId === typingStatus.conversationId
  );
  
  if (existingIndex !== -1) {
    queue.typingUpdates[existingIndex] = typingStatus;
  } else {
    queue.typingUpdates.push(typingStatus);
  }
  
  // Clean up old typing updates (keep last 20)
  if (queue.typingUpdates.length > 20) {
    queue.typingUpdates = queue.typingUpdates.slice(-20);
  }
};

// POST handler for polling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const queue = getUserQueue(userId);
    const lastPolled = queue.lastPolled;
    
    // Update last polled time
    queue.lastPolled = Date.now();
    
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
export function GET(request: NextRequest) {
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