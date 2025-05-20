import { Server } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { Server as HTTPSServer } from 'https'

export function initializeSocketServer(server: HTTPServer | HTTPSServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling']
  })

  // Connection handler
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join room
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId)
      console.log(`User ${socket.id} joined room ${roomId}`)
    })

    // Leave room
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId)
      console.log(`User ${socket.id} left room ${roomId}`)
    })

    // Handle messages
    socket.on('send_message', (data: any) => {
      io.to(data.roomId).emit('receive_message', data)
    })

    // Handle typing status
    socket.on('typing', (data: any) => {
      socket.to(data.roomId).emit('user_typing', {
        userId: data.userId,
        isTyping: data.isTyping
      })
    })

    // Handle user status changes
    socket.on('status_change', (data: any) => {
      io.emit('user_status_change', {
        userId: data.userId,
        status: data.status
      })
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
} 