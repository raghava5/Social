import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiRequest } from 'next'
import { NextApiResponse } from 'next'

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer
    }
  }
}

let io: SocketIOServer | null = null

export const getIO = () => {
  return io
}

export const initSocket = (server: NetServer) => {
  if (!io) {
    io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Join room
      socket.on('join-room', (roomId) => {
        socket.join(roomId)
        console.log(`Socket ${socket.id} joined room ${roomId}`)
      })

      // Leave room
      socket.on('leave-room', (roomId) => {
        socket.leave(roomId)
        console.log(`Socket ${socket.id} left room ${roomId}`)
      })

      // Handle messages
      socket.on('send-message', (message) => {
        io?.emit('receive-message', message)
      })

      // Handle typing status
      socket.on('typing-start', (data) => {
        socket.broadcast.emit('user-typing', {
          userId: data.userId,
          isTyping: true,
        })
      })

      socket.on('typing-stop', (data) => {
        socket.broadcast.emit('user-typing', {
          userId: data.userId,
          isTyping: false,
        })
      })

      // Handle user status
      socket.on('status-change', (data) => {
        socket.broadcast.emit('user-status-change', data)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    // Make io instance available globally
    ;(global as any).io = io
  }
  return io
}

// Helper functions for real-time features
export const emitEvent = (eventName: string, data: any) => {
  io?.emit(eventName, data)
}

export const joinRoom = (roomId: string) => {
  io?.emit('join-room', roomId)
}

export const leaveRoom = (roomId: string) => {
  io?.emit('leave-room', roomId)
}

export const sendMessage = (message: any) => {
  io?.emit('send-message', message)
}

export const startTyping = (data: { userId: string }) => {
  io?.emit('typing-start', data)
}

export const stopTyping = (data: { userId: string }) => {
  io?.emit('typing-stop', data)
}

export const changeStatus = (data: { userId: string; status: string }) => {
  io?.emit('status-change', data)
}

export default io 