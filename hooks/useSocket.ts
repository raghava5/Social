import { useEffect, useRef } from 'react'
import io, { Socket } from 'socket.io-client'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socket',
    })
    socketRef.current = socket

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  return socketRef.current
} 