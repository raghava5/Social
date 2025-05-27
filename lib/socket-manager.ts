import { io, Socket } from 'socket.io-client'

class SocketManager {
  private static instance: SocketManager
  private socket: Socket | null = null
  private connected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  connect(userId?: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      // Return existing connection if available
      if (this.socket && this.connected) {
        console.log('📡 Using existing WebSocket connection')
        resolve(this.socket)
        return
      }

      // Cleanup any existing connection
      this.disconnect()

      console.log('🔌 Initializing new WebSocket connection...')

      this.socket = io('http://localhost:3000', {
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 10000,
        forceNew: true, // Force new connection
      })

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected successfully')
        this.connected = true
        this.reconnectAttempts = 0

        // Authenticate if userId provided
        if (userId) {
          this.socket!.emit('authenticate', { 
            userId,
            token: localStorage.getItem('authToken') || 'dummy-token' 
          })
        }

        resolve(this.socket!)
      })

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error)
        this.connected = false
        
        this.reconnectAttempts++
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`))
        }
      })

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`)
        this.connected = true
        this.reconnectAttempts = 0
      })

      this.socket.on('authenticated', () => {
        console.log('✅ WebSocket authenticated')
      })

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason)
        this.connected = false
        
        // Auto-reconnect if disconnected unexpectedly
        if (reason === 'io server disconnect') {
          console.log('🔄 Server disconnected, attempting reconnection...')
          setTimeout(() => this.reconnect(userId), this.reconnectDelay)
        }
      })

      // Set timeout for connection
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('WebSocket connection timeout'))
        }
      }, 15000)
    })
  }

  private reconnect(userId?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`🔄 Attempting reconnect ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`)
      this.connect(userId).catch(console.error)
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...')
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.connected && this.socket?.connected === true
  }

  // Emit events with error handling
  emit(event: string, data: any): boolean {
    if (this.socket && this.connected) {
      this.socket.emit(event, data)
      return true
    } else {
      console.warn(`⚠️ Cannot emit ${event}: WebSocket not connected`)
      return false
    }
  }

  // Listen to events
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  // Remove event listeners
  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }
}

export default SocketManager.getInstance() 