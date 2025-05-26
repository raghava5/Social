/**
 * WebSocket Manager for Real-Time Updates
 * Handles broadcasting of real-time events across the application
 */

class WebSocketManager {
  private io: any = null

  /**
   * Initialize the WebSocket manager with Socket.IO instance
   */
  initialize(socketIO: any) {
    this.io = socketIO
    console.log('🔌 WebSocket Manager initialized')
  }

  /**
   * Broadcast an event to all connected clients
   */
  async broadcast(event: string, data: any) {
    try {
      if (this.io) {
        this.io.emit(event, data)
        console.log(`📡 Broadcasted ${event}:`, data)
      } else if (global.io) {
        global.io.emit(event, data)
        console.log(`📡 Broadcasted ${event} via global.io:`, data)
      } else {
        console.warn('⚠️ No WebSocket connection available for broadcasting')
      }
    } catch (error) {
      console.error('❌ WebSocket broadcast failed:', error)
    }
  }

  /**
   * Broadcast to specific user
   */
  async broadcastToUser(userId: string, event: string, data: any) {
    try {
      if (this.io) {
        this.io.to(userId).emit(event, data)
        console.log(`📡 Broadcasted ${event} to user ${userId}:`, data)
      } else if (global.io) {
        global.io.to(userId).emit(event, data)
        console.log(`📡 Broadcasted ${event} to user ${userId} via global.io:`, data)
      } else {
        console.warn('⚠️ No WebSocket connection available for user broadcasting')
      }
    } catch (error) {
      console.error('❌ WebSocket user broadcast failed:', error)
    }
  }

  /**
   * Broadcast to specific room
   */
  async broadcastToRoom(room: string, event: string, data: any) {
    try {
      if (this.io) {
        this.io.to(room).emit(event, data)
        console.log(`📡 Broadcasted ${event} to room ${room}:`, data)
      } else if (global.io) {
        global.io.to(room).emit(event, data)
        console.log(`📡 Broadcasted ${event} to room ${room} via global.io:`, data)
      } else {
        console.warn('⚠️ No WebSocket connection available for room broadcasting')
      }
    } catch (error) {
      console.error('❌ WebSocket room broadcast failed:', error)
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return !!(this.io || global.io)
  }

  /**
   * Get connected clients count
   */
  getConnectedCount(): number {
    try {
      if (this.io) {
        return this.io.engine.clientsCount || 0
      } else if (global.io) {
        return global.io.engine.clientsCount || 0
      }
      return 0
    } catch (error) {
      console.error('❌ Failed to get connected count:', error)
      return 0
    }
  }
}

// Export singleton instance
export const websocketManager = new WebSocketManager()
export default websocketManager 