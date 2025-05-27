import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import {
  Message,
  Conversation,
  MessageEvent,
  TypingStatus,
  MessageStatus,
  OnlineStatus,
  MessageAttachment
} from './types';

class MessagingService {
  private socket: Socket | null = null;
  private userId: string = '';
  private isConnected: boolean = false;
  private messageCallbacks: ((message: Message) => void)[] = [];
  private typingCallbacks: ((status: TypingStatus) => void)[] = [];
  private statusCallbacks: ((status: OnlineStatus) => void)[] = [];
  private deliveryCallbacks: ((messageId: string, status: MessageStatus) => void)[] = [];
  private offlineQueue: MessageEvent[] = [];
  
  constructor() {
    // Initialize offline storage
    this.loadOfflineQueue();
    
    // Check connection status periodically
    setInterval(() => {
      this.checkConnectionStatus();
    }, 30000); // Every 30 seconds
  }
  
  // Initialize the messaging service with user ID
  async initialize(userId: string): Promise<boolean> {
    this.userId = userId;
    
    try {
      // Connect to socket server
      await this.connect();
      return true;
    } catch (error) {
      console.error('Failed to initialize messaging service:', error);
      
      // Fallback to polling if socket fails
      this.setupPolling();
      
      return false;
    }
  }
  
  // Connect to socket server
  private async connect(): Promise<void> {
    if (this.socket?.connected) {
      this.isConnected = true;
      return;
    }
    
    try {
      // Create socket connection
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
      
      this.socket = socket;
      
      // Setup socket event handlers
      this.setupSocketEvents();
      
      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, 10000);
        
        socket.on('connect', () => {
          clearTimeout(timer);
          resolve();
        });
        
        socket.on('connect_error', (error) => {
          clearTimeout(timer);
          reject(error);
        });
      });
      
      // Connection successful, authenticate
      socket.emit('user:connect', { userId: this.userId });
      
      this.isConnected = true;
      
      // Send any messages that were queued while offline
      this.processOfflineQueue();
      
      return;
    } catch (error) {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }
  
  // Set up socket event handlers
  private setupSocketEvents(): void {
    if (!this.socket) return;
    
    // Handle incoming messages
    this.socket.on('message:new', (message: Message) => {
      this.messageCallbacks.forEach(callback => callback(message));
    });
    
    // Handle message status updates
    this.socket.on('message:delivered', ({ messageId, userId }) => {
      this.deliveryCallbacks.forEach(callback => callback(messageId, 'delivered'));
    });
    
    this.socket.on('message:read', ({ messageId, userId }) => {
      this.deliveryCallbacks.forEach(callback => callback(messageId, 'read'));
    });
    
    // Handle typing indicators
    this.socket.on('typing:update', (status: TypingStatus) => {
      this.typingCallbacks.forEach(callback => callback(status));
    });
    
    // Handle user status updates
    this.socket.on('user:status', (status: OnlineStatus) => {
      this.statusCallbacks.forEach(callback => callback(status));
    });
    
    // Handle edited messages
    this.socket.on('message:edited', ({ messageId, content }) => {
      // Find the message and update it
      // In a real app, you'd update the message in the state
      // For now, notify listeners of a new message event
      const event: MessageEvent = {
        type: 'message_edited',
        messageId,
        content
      };
      
      // Dispatch to callbacks
      this.dispatchEvent(event);
    });
    
    // Handle deleted messages
    this.socket.on('message:deleted', ({ messageId, forEveryone }) => {
      const event: MessageEvent = {
        type: 'message_delete',
        messageId,
        forEveryone
      };
      
      // Dispatch to callbacks
      this.dispatchEvent(event);
    });
    
    // Handle message reactions
    this.socket.on('message:react', ({ messageId, emoji, userId }) => {
      const event: MessageEvent = {
        type: 'message_reaction',
        messageId,
        emoji,
        userId
      };
      
      // Dispatch to callbacks
      this.dispatchEvent(event);
    });
    
    // Handle reconnection
    this.socket.on('reconnect', () => {
      // Re-authenticate after reconnection
      this.socket?.emit('user:connect', { userId: this.userId });
      this.isConnected = true;
      
      // Process any messages that were queued while offline
      this.processOfflineQueue();
    });
    
    // Handle disconnection
    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });
  }
  
  // Send a message
  async sendMessage(
    conversationId: string,
    content: string,
    attachments: MessageAttachment[] = [],
    replyToId?: string
  ): Promise<Message> {
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Create message object
    const message: Message = {
      id: messageId,
      conversationId,
      content,
      sender: {
        id: this.userId,
        name: 'You', // In a real app, get from auth
      },
      timestamp,
      status: 'sent',
      isEdited: false,
      isDeleted: false,
      reactions: [],
      attachments,
      readBy: [this.userId],
      deliveredTo: [this.userId],
      ...(replyToId ? { replyTo: { id: replyToId, content: '', sender: '' } } : {})
    };
    
    // Get recipient IDs (in a real app, you'd look up conversation participants)
    // For now we'll just use a placeholder recipient for demo purposes
    const recipientIds = ['recipient1'];
    
    if (this.isConnected && this.socket) {
      try {
        // Send via socket with acknowledgement
        await new Promise<void>((resolve, reject) => {
          this.socket?.emit('message:send', 
            { 
              ...message, 
              recipientIds
            }, 
            (response: any) => {
              if (response.success) {
                resolve();
              } else {
                reject(new Error('Failed to send message'));
              }
            }
          );
          
          // Timeout for acknowledgement
          setTimeout(() => {
            reject(new Error('Message send timeout'));
          }, 5000);
        });
        
        return message;
      } catch (error) {
        console.error('Error sending message via socket:', error);
        
        // If socket fails, queue for later and try API
        this.queueOfflineEvent({
          type: 'message_send',
          message
        });
        
        return this.sendMessageViaAPI(message);
      }
    } else {
      // Queue for later when connection is restored
      this.queueOfflineEvent({
        type: 'message_send',
        message
      });
      
      // Try to send via API
      return this.sendMessageViaAPI(message);
    }
  }
  
  // Fallback: send message via REST API
  private async sendMessageViaAPI(message: Message): Promise<Message> {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message.content,
          conversationId: message.conversationId,
          sender: {
            id: this.userId,
            name: 'You',
          },
          attachments: message.attachments,
          replyToId: message.replyTo?.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message via API');
      }
      
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error('Error sending message via API:', error);
      
      // Return original message (it will be retried later)
      return message;
    }
  }
  
  // Mark a message as delivered
  markAsDelivered(messageId: string, conversationId: string): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('message:delivered', { messageId, userId: this.userId, conversationId });
    } else {
      this.queueOfflineEvent({
        type: 'message_delivered',
        messageId,
        conversationId
      });
    }
  }
  
  // Mark a message as read
  markAsRead(messageId: string, conversationId: string): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('message:read', { messageId, userId: this.userId, conversationId });
    } else {
      this.queueOfflineEvent({
        type: 'message_read',
        messageId,
        conversationId
      });
    }
  }
  
  // Send typing status
  sendTypingStatus(conversationId: string, isTyping: boolean): void {
    if (this.isConnected && this.socket) {
      this.socket.emit('typing:update', {
        userId: this.userId,
        username: 'You', // In a real app, get from auth
        conversationId,
        isTyping,
        timestamp: new Date().toISOString()
      });
    }
    // We don't queue typing status for offline mode
  }
  
  // Edit a message
  async editMessage(messageId: string, conversationId: string, content: string): Promise<boolean> {
    if (this.isConnected && this.socket) {
      try {
        return new Promise<boolean>((resolve) => {
          this.socket?.emit('message:edit', 
            { messageId, content, conversationId }, 
            (response: any) => {
              resolve(response.success);
            }
          );
          
          // Timeout
          setTimeout(() => {
            resolve(false);
          }, 5000);
        });
      } catch (error) {
        console.error('Error editing message:', error);
        
        // Queue for later
        this.queueOfflineEvent({
          type: 'message_edit',
          messageId,
          content,
          conversationId
        });
        
        return false;
      }
    } else {
      // Queue for later
      this.queueOfflineEvent({
        type: 'message_edit',
        messageId,
        content,
        conversationId
      });
      
      return false;
    }
  }
  
  // Delete a message
  async deleteMessage(messageId: string, conversationId: string, forEveryone: boolean): Promise<boolean> {
    if (this.isConnected && this.socket) {
      try {
        return new Promise<boolean>((resolve) => {
          this.socket?.emit('message:delete', 
            { messageId, forEveryone, conversationId }, 
            (response: any) => {
              resolve(response.success);
            }
          );
          
          // Timeout
          setTimeout(() => {
            resolve(false);
          }, 5000);
        });
      } catch (error) {
        console.error('Error deleting message:', error);
        
        // Queue for later
        this.queueOfflineEvent({
          type: 'message_delete',
          messageId,
          forEveryone,
          conversationId
        });
        
        return false;
      }
    } else {
      // Queue for later
      this.queueOfflineEvent({
        type: 'message_delete',
        messageId,
        forEveryone,
        conversationId
      });
      
      return false;
    }
  }
  
  // Add a reaction to a message
  async addReaction(messageId: string, conversationId: string, emoji: string): Promise<boolean> {
    if (this.isConnected && this.socket) {
      try {
        return new Promise<boolean>((resolve) => {
          this.socket?.emit('message:react', 
            { messageId, emoji, conversationId, userId: this.userId }, 
            (response: any) => {
              resolve(response.success);
            }
          );
          
          // Timeout
          setTimeout(() => {
            resolve(false);
          }, 5000);
        });
      } catch (error) {
        console.error('Error adding reaction:', error);
        
        // Queue for later
        this.queueOfflineEvent({
          type: 'message_reaction',
          messageId,
          emoji,
          conversationId
        });
        
        return false;
      }
    } else {
      // Queue for later
      this.queueOfflineEvent({
        type: 'message_reaction',
        messageId,
        emoji,
        conversationId
      });
      
      return false;
    }
  }
  
  // Subscribe to new messages
  onMessage(callback: (message: Message) => void): () => void {
    this.messageCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Subscribe to typing status changes
  onTypingStatusChange(callback: (status: TypingStatus) => void): () => void {
    this.typingCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Subscribe to user status changes
  onUserStatusChange(callback: (status: OnlineStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Subscribe to message delivery status changes
  onMessageStatusChange(callback: (messageId: string, status: MessageStatus) => void): () => void {
    this.deliveryCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.deliveryCallbacks = this.deliveryCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Dispatch event to appropriate callbacks
  private dispatchEvent(event: MessageEvent): void {
    switch (event.type) {
      case 'message_send':
        if (event.message) {
          this.messageCallbacks.forEach(callback => callback(event.message!));
        }
        break;
        
      case 'message_edit':
        // In a real app, you'd fetch the updated message from the server
        // For now, we'll just notify that the message was edited
        console.log('Message edited:', event.messageId);
        break;
        
      case 'message_delete':
        // In a real app, you'd fetch the updated message from the server
        // For now, we'll just notify that the message was deleted
        console.log('Message deleted:', event.messageId);
        break;
        
      case 'message_reaction':
        // In a real app, you'd fetch the updated message from the server
        // For now, we'll just notify that a reaction was added
        console.log('Message reaction:', event.messageId, event.emoji);
        break;
        
      case 'message_delivered':
        this.deliveryCallbacks.forEach(callback => 
          callback(event.messageId || '', 'delivered')
        );
        break;
        
      case 'message_read':
        this.deliveryCallbacks.forEach(callback => 
          callback(event.messageId || '', 'read')
        );
        break;
    }
  }
  
  // Check connection status and reconnect if needed
  private checkConnectionStatus(): void {
    if (!this.isConnected) {
      this.connect().catch(error => {
        console.error('Failed to reconnect:', error);
        
        // If socket fails, set up polling
        this.setupPolling();
      });
    }
  }
  
  // Set up long polling as fallback
  private setupPolling(): void {
    // Only set up polling if not already polling
    if (this._isPolling) return;
    
    this._isPolling = true;
    this.doPoll();
  }
  
  private _isPolling = false;
  private _pollInterval: NodeJS.Timeout | null = null;
  
  // Do long polling
  private async doPoll(): Promise<void> {
    if (!this._isPolling) return;
    
    try {
      const response = await fetch('/api/messages/poll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Process new messages
        if (data.messages && data.messages.length > 0) {
          data.messages.forEach((message: Message) => {
            this.messageCallbacks.forEach(callback => callback(message));
          });
        }
        
        // Process status updates
        if (data.statusUpdates && data.statusUpdates.length > 0) {
          data.statusUpdates.forEach((status: OnlineStatus) => {
            this.statusCallbacks.forEach(callback => callback(status));
          });
        }
        
        // Process typing updates
        if (data.typingUpdates && data.typingUpdates.length > 0) {
          data.typingUpdates.forEach((status: TypingStatus) => {
            this.typingCallbacks.forEach(callback => callback(status));
          });
        }
      }
    } catch (error) {
      console.error('Error polling messages:', error);
    }
    
    // Schedule next poll
    this._pollInterval = setTimeout(() => this.doPoll(), 3000);
  }
  
  // Stop polling
  private stopPolling(): void {
    this._isPolling = false;
    
    if (this._pollInterval) {
      clearTimeout(this._pollInterval);
      this._pollInterval = null;
    }
  }
  
  // Queue events for offline processing
  private queueOfflineEvent(event: MessageEvent): void {
    this.offlineQueue.push(event);
    
    // Save to local storage
    this.saveOfflineQueue();
  }
  
  // Process offline queue
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;
    
    // Copy queue and clear it
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    this.saveOfflineQueue();
    
    // Process each event
    for (const event of queue) {
      try {
        switch (event.type) {
          case 'message_send':
            if (event.message) {
              await this.sendMessage(
                event.message.conversationId,
                event.message.content,
                event.message.attachments,
                event.message.replyTo?.id
              );
            }
            break;
            
          case 'message_edit':
            if (event.messageId && event.content) {
              await this.editMessage(event.messageId, event.conversationId || '', event.content);
            }
            break;
            
          case 'message_delete':
            if (event.messageId) {
              await this.deleteMessage(
                event.messageId, 
                event.conversationId || '', 
                event.forEveryone || false
              );
            }
            break;
            
          case 'message_reaction':
            if (event.messageId && event.emoji) {
              await this.addReaction(event.messageId, event.conversationId || '', event.emoji);
            }
            break;
            
          case 'message_delivered':
            if (event.messageId) {
              this.markAsDelivered(event.messageId, event.conversationId || '');
            }
            break;
            
          case 'message_read':
            if (event.messageId) {
              this.markAsRead(event.messageId, event.conversationId || '');
            }
            break;
        }
      } catch (error) {
        console.error('Error processing offline event:', error);
        
        // Re-queue failed events
        this.queueOfflineEvent(event);
      }
    }
  }
  
  // Save offline queue to local storage
  private saveOfflineQueue(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(`messaging_queue_${this.userId}`, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }
  
  // Load offline queue from local storage
  private loadOfflineQueue(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const queue = localStorage.getItem(`messaging_queue_${this.userId}`);
      if (queue) {
        this.offlineQueue = JSON.parse(queue);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }
  
  // Generate a conversation key for encryption
  generateConversationKey(): string {
    // In a real app, use a secure key exchange mechanism
    // For demo purposes, we'll just generate a random string
    return uuidv4();
  }
}

// Export singleton instance
const messagingService = new MessagingService();
export default messagingService; 