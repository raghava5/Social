import { useEffect, useRef } from 'react'
import io, { Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    })

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Connected to socket server')
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const joinRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', roomId)
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', roomId)
    }
  }

  const sendMessage = (data: {
    roomId: string
    message: string
    userId: string
    userName: string
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', data)
    }
  }

  const onReceiveMessage = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('receive_message', callback)
    }
  }

  const emitTyping = (data: { roomId: string; userId: string; isTyping: boolean }) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', data)
    }
  }

  const onUserTyping = (callback: (data: { userId: string; isTyping: boolean }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user_typing', callback)
    }
  }

  const updateStatus = (data: { userId: string; status: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('status_change', data)
    }
  }

  const onStatusChange = (callback: (data: { userId: string; status: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user_status_change', callback)
    }
  }

  return {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    sendMessage,
    onReceiveMessage,
    emitTyping,
    onUserTyping,
    updateStatus,
    onStatusChange
  }
} 