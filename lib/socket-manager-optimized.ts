/**
 * Optimized Socket Manager - Prevents memory leaks and multiple connections
 */

import { io, Socket } from 'socket.io-client';

export class OptimizedSocketManager {
  private static instance: OptimizedSocketManager;
  private socket: Socket | null = null;
  private connecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connected = false;

  private constructor() {}

  public static getInstance(): OptimizedSocketManager {
    if (!OptimizedSocketManager.instance) {
      OptimizedSocketManager.instance = new OptimizedSocketManager();
    }
    return OptimizedSocketManager.instance;
  }

  public async connect(userId?: string): Promise<Socket | null> {
    if (typeof window === 'undefined') {
      console.warn('Socket connection attempted on server side');
      return null;
    }

    // Return existing socket if already connected
    if (this.socket && this.socket.connected) {
      console.log('✅ Using existing socket connection');
      return this.socket;
    }

    // Prevent multiple connection attempts
    if (this.connecting) {
      console.log('⏳ Socket connection already in progress');
      return this.waitForConnection();
    }

    this.connecting = true;

    try {
      console.log('🔌 Initializing optimized socket connection...');

      // Clean up any existing socket
      await this.disconnect();

      // Create new socket with optimized settings
      this.socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        upgrade: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000,
        forceNew: false, // Reuse existing connection if possible
        // Add userId for authentication
        query: userId ? { userId } : {}
      });

      // Set up optimized event handlers
      this.setupEventHandlers();

      // Wait for connection
      await this.waitForConnection();

      // Start heartbeat to keep connection alive
      this.startHeartbeat();

      console.log('✅ Optimized socket connection established');
      return this.socket;

    } catch (error) {
      console.error('❌ Failed to establish socket connection:', error);
      this.connecting = false;
      return null;
    } finally {
      this.connecting = false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.connecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.connected = false;
      
      // Clear heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        this.reconnectWithBackoff();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.connected = false;
      this.connecting = false;
      this.reconnectWithBackoff();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Socket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Socket reconnection failed after maximum attempts');
      this.connected = false;
    });

    // Heartbeat response
    this.socket.on('pong', () => {
      // Connection is alive
    });
  }

  private async waitForConnection(): Promise<Socket | null> {
    if (!this.socket) return null;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Socket connection timeout'));
      }, 20000);

      if (this.socket!.connected) {
        clearTimeout(timeout);
        resolve(this.socket);
        return;
      }

      const onConnect = () => {
        clearTimeout(timeout);
        this.socket!.off('connect_error', onError);
        resolve(this.socket);
      };

      const onError = (error: any) => {
        clearTimeout(timeout);
        this.socket!.off('connect', onConnect);
        reject(error);
      };

      this.socket!.once('connect', onConnect);
      this.socket!.once('connect_error', onError);
    });
  }

  private reconnectWithBackoff(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Maximum reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    }, delay);
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  public on(event: string, listener: Function): void {
    if (!this.socket) {
      console.warn('Cannot add listener: socket not initialized');
      return;
    }

    // Track listeners for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    this.socket.on(event, listener as any);
  }

  public off(event: string, listener: Function): void {
    if (!this.socket) return;

    this.socket.off(event, listener as any);

    // Remove from tracking
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(listener);
      
      // Clean up empty sets
      if (this.listeners.get(event)!.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public emit(event: string, data?: any): void {
    if (!this.socket || !this.socket.connected) {
      console.warn(`Cannot emit event "${event}": socket not connected`);
      return;
    }

    this.socket.emit(event, data);
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  public async disconnect(): Promise<void> {
    console.log('🔌 Disconnecting socket...');

    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Remove all tracked listeners
    for (const [event, listeners] of this.listeners) {
      listeners.forEach(listener => {
        this.socket?.off(event, listener as any);
      });
    }
    this.listeners.clear();

    // Disconnect socket
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.connected = false;
    this.connecting = false;
    this.reconnectAttempts = 0;

    console.log('✅ Socket disconnected and cleaned up');
  }

  public async destroy(): Promise<void> {
    await this.disconnect();
    OptimizedSocketManager.instance = null as any;
  }
}

// Export singleton instance
export const optimizedSocketManager = OptimizedSocketManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', async () => {
    await optimizedSocketManager.disconnect();
  });

  // Cleanup on visibility change (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, potentially disconnect or reduce activity
      console.log('Page hidden, maintaining socket connection with reduced activity');
    } else {
      // Page is visible again, ensure connection is active
      if (!optimizedSocketManager.isConnected()) {
        console.log('Page visible, reconnecting socket...');
        optimizedSocketManager.connect();
      }
    }
  });
} 