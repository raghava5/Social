import { NextResponse } from 'next/server'
import sql from '@/db'

export async function GET() {
  try {
    // Parse connection info (safely)
    const connectionUrl = process.env.DATABASE_URL || ''
    const urlParts = new URL(connectionUrl)
    
    // Test the connection with a simple query
    const result = await sql`SELECT NOW(), current_database(), current_user`
    
    return NextResponse.json({
      success: true,
      message: 'Postgres connection successful',
      timestamp: result[0].now,
      connectionInfo: {
        host: urlParts.hostname,
        port: urlParts.port,
        database: urlParts.pathname.replace('/', ''),
        user: urlParts.username,
        hostIP: await getHostIP(urlParts.hostname)
      }
    })
  } catch (error: any) {
    console.error('Postgres connection error:', error)
    
    // Try to parse connection info even if connection fails
    let connectionInfo = {
      host: 'unknown',
      port: 'unknown'
    }
    
    try {
      const connectionUrl = process.env.DATABASE_URL || ''
      const urlParts = new URL(connectionUrl)
      connectionInfo = {
        host: urlParts.hostname,
        port: urlParts.port
      }
    } catch (parseError) {
      console.error('Failed to parse DATABASE_URL:', parseError)
    }
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      connectionInfo
    }, { 
      status: 500 
    })
  }
}

// Helper function to get the IP address of a host
async function getHostIP(hostname: string): Promise<string> {
  try {
    // This is running on the server, so we can use DNS to resolve the hostname
    const { promisify } = await import('util')
    const { lookup } = await import('dns')
    const dnsLookup = promisify(lookup)
    
    const result = await dnsLookup(hostname)
    return result.address
  } catch (error) {
    console.error('Error resolving hostname:', error)
    return 'Could not resolve IP'
  }
} 