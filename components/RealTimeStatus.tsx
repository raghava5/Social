import { useState, useEffect } from 'react'
import socketManager from '../lib/socket-manager'

interface RealTimeStatusProps {
  className?: string
}

export default function RealTimeStatus({ className = '' }: RealTimeStatusProps) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const checkConnection = () => {
      const isConnected = socketManager.isConnected()
      setConnected(isConnected)
      setConnecting(false)
    }

    // Check initial state
    checkConnection()

    // Set up periodic checks
    const interval = setInterval(checkConnection, 2000)

    // Listen for socket events if available
    const socket = socketManager.getSocket()
    if (socket) {
      socket.on('connect', () => {
        setConnected(true)
        setConnecting(false)
      })
      
      socket.on('connecting', () => {
        setConnecting(true)
        setConnected(false)
      })
      
      socket.on('disconnect', () => {
        setConnected(false)
        setConnecting(false)
      })
      
      socket.on('connect_error', () => {
        setConnected(false)
        setConnecting(false)
      })
    }

    return () => {
      clearInterval(interval)
      if (socket) {
        socket.off('connect')
        socket.off('connecting')
        socket.off('disconnect')
        socket.off('connect_error')
      }
    }
  }, [])

  if (connecting) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-yellow-600">Connecting...</span>
      </div>
    )
  }

  if (connected) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-green-600">Live</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      <span className="text-sm text-red-600">Offline</span>
    </div>
  )
} 