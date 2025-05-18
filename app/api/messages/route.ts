import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In a real app, you would interact with a database
// For this demo, we'll use in-memory storage
const messages: any[] = [];
const conversations: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before');
    
    // Filter messages by conversation ID
    let filteredMessages = messages.filter(msg => msg.conversationId === conversationId);
    
    // If 'before' is provided, only return messages before that timestamp
    if (before) {
      filteredMessages = filteredMessages.filter(msg => new Date(msg.timestamp) < new Date(before));
    }
    
    // Sort by timestamp (newest last)
    filteredMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Limit number of messages
    filteredMessages = filteredMessages.slice(-limit);
    
    return NextResponse.json({ 
      messages: filteredMessages,
      hasMore: filteredMessages.length === limit 
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationId, sender, attachments = [], replyToId } = body;
    
    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'Message content or attachments are required' }, { status: 400 });
    }
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }
    
    if (!sender || !sender.id) {
      return NextResponse.json({ error: 'Sender information is required' }, { status: 400 });
    }
    
    // Create a new message
    const newMessage = {
      id: uuidv4(),
      conversationId,
      content: content || '',
      sender,
      timestamp: new Date().toISOString(),
      status: 'sent',
      isEdited: false,
      isDeleted: false,
      reactions: [],
      attachments: attachments || [],
      readBy: [sender.id],
      deliveredTo: [sender.id],
      ...(replyToId ? { replyTo: { id: replyToId } } : {})
    };
    
    // Save message
    messages.push(newMessage);
    
    // Update conversation's last message
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.lastMessage = {
        content: content || 'Sent an attachment',
        sender: sender.id,
        timestamp: newMessage.timestamp
      };
      conversation.updatedAt = newMessage.timestamp;
    }
    
    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, status, content, isDeleted, reaction } = body;
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }
    
    // Find the message
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    const message = messages[messageIndex];
    
    // Update message properties based on what was provided
    if (status) {
      message.status = status;
    }
    
    if (content !== undefined) {
      message.content = content;
      message.isEdited = true;
    }
    
    if (isDeleted !== undefined) {
      message.isDeleted = isDeleted;
    }
    
    if (reaction) {
      const { emoji, userId, username } = reaction;
      
      // Check if the user already reacted with this emoji
      const existingReactionIndex = message.reactions.findIndex(
        (r: any) => r.userId === userId && r.emoji === emoji
      );
      
      if (existingReactionIndex !== -1) {
        // Remove existing reaction
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Add new reaction
        message.reactions.push({
          emoji,
          userId,
          username,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Save the updated message
    messages[messageIndex] = message;
    
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const forEveryone = searchParams.get('forEveryone') === 'true';
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }
    
    // Find the message
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    if (forEveryone) {
      // Mark as deleted for everyone
      messages[messageIndex].isDeleted = true;
      messages[messageIndex].content = '';
    } else {
      // Remove from the array (only for the requesting user)
      // In a real app with a database, you'd add a 'deletedFor' array of user IDs
      messages.splice(messageIndex, 1);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
} 