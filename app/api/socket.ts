import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiRequest } from 'next';
import { v4 as uuidv4 } from 'uuid';

// Store online users and their active connections
interface User {
  id: string;
  socketId: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  isDeleted?: boolean;
}

// In-memory storage (in a real app, this would be a database)
const users: Record<string, User> = {};
const messages: Message[] = [];

// Socket.io instance
let io: any;

export function initSocketServer(server: HTTPServer) {
  if (io) {
    console.log('Socket server already initialized');
    return;
  }

  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: any) => {
    console.log('New client connected:', socket.id);

    // User connects and authenticates
    socket.on('user:connect', ({ userId }: { userId: string }) => {
      // Store user connection
      users[userId] = {
        id: userId,
        socketId: socket.id,
        isOnline: true,
        lastSeen: new Date(),
      };

      // Broadcast user online status to relevant users
      socket.broadcast.emit('user:status', {
        userId,
        isOnline: true,
      });

      console.log(`User ${userId} connected with socket ${socket.id}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // Find user by socket ID
      const userId = Object.keys(users).find(
        (id) => users[id].socketId === socket.id
      );

      if (userId) {
        users[userId].isOnline = false;
        users[userId].lastSeen = new Date();

        // Broadcast offline status
        socket.broadcast.emit('user:status', {
          userId,
          isOnline: false,
          lastSeen: users[userId].lastSeen,
        });

        console.log(`User ${userId} disconnected`);
      }
    });

    // Message events
    socket.on('message:send', (message: any, callback: Function) => {
      const messageId = message.id || uuidv4();
      const timestamp = new Date();

      // Store message
      const newMessage = {
        ...message,
        id: messageId,
        timestamp,
        status: 'sent',
      };

      messages.push(newMessage);

      // Find recipients
      const recipientIds = message.recipientIds || [];
      
      // Send to recipients
      recipientIds.forEach((recipientId: string) => {
        const recipient = users[recipientId];
        if (recipient && recipient.socketId) {
          io.to(recipient.socketId).emit('message:new', newMessage);
        }
      });

      // Acknowledge message sent
      if (callback) {
        callback({ success: true, messageId });
      }
    });

    // Message delivered
    socket.on('message:delivered', ({ messageId, userId, conversationId }: any) => {
      // Update message status (in a real app)
      
      // Notify original sender
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        const senderSocketId = users[message.senderId]?.socketId;
        if (senderSocketId) {
          io.to(senderSocketId).emit('message:delivered', { messageId, userId });
        }
      }
    });

    // Message read
    socket.on('message:read', ({ messageId, userId, conversationId }: any) => {
      // Update message status (in a real app)
      
      // Notify original sender
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        const senderSocketId = users[message.senderId]?.socketId;
        if (senderSocketId) {
          io.to(senderSocketId).emit('message:read', { messageId, userId });
        }
      }
    });

    // Typing indicator
    socket.on('typing:update', (status: any) => {
      // Find recipient's socket
      if (status.conversationId) {
        // In a real app, you'd look up conversation participants
        // For now, broadcast to everyone
        socket.broadcast.emit('typing:update', status);
      }
    });

    // Message edit
    socket.on('message:edit', ({ messageId, content, conversationId }: any, callback: Function) => {
      // Update message (in a real app)
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        message.content = content;
        
        // Notify recipients
        socket.broadcast.emit('message:edited', { messageId, content });
        
        if (callback) {
          callback({ success: true });
        }
      } else if (callback) {
        callback({ success: false, error: 'Message not found' });
      }
    });

    // Message delete
    socket.on('message:delete', ({ messageId, forEveryone, conversationId }: any, callback: Function) => {
      // Delete/update message (in a real app)
      const index = messages.findIndex(msg => msg.id === messageId);
      if (index !== -1) {
        if (forEveryone) {
          // Mark as deleted but don't remove
          messages[index] = { ...messages[index], isDeleted: true };
          socket.broadcast.emit('message:deleted', { messageId, forEveryone });
        } else {
          // Only delete for the requester in a real app
        }
        
        if (callback) {
          callback({ success: true });
        }
      } else if (callback) {
        callback({ success: false, error: 'Message not found' });
      }
    });

    // Message reaction
    socket.on('message:react', ({ messageId, emoji, conversationId, userId }: any, callback: Function) => {
      // Update reactions (in a real app)
      socket.broadcast.emit('message:reaction', { messageId, emoji, userId });
      
      if (callback) {
        callback({ success: true });
      }
    });
  });

  console.log('Socket server initialized');
  return io;
}

export function getSocketIO() {
  if (!io) {
    throw new Error('Socket server not initialized');
  }
  return io;
}

// Helper for Next.js API routes
export const config = {
  api: {
    bodyParser: false,
  },
}; 