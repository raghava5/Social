import { Server } from 'socket.io'
import { NextResponse } from 'next/server'

// Store the Socket.IO server instance
let io: any

if (!(global as any).io) {
  (global as any).io = new Server({
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })
  io = (global as any).io
  io.listen(3001) // Different port from Next.js
  
  io.on('connection', (socket: any) => {
    console.log('Client connected')
    
    socket.on('disconnect', () => {
      console.log('Client disconnected')
    })
  })
} else {
  io = (global as any).io
}

export async function GET() {
  return NextResponse.json({ message: 'WebSocket server is running' })
} 