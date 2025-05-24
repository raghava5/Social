import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  console.log('Testing direct PostgreSQL connection...');
  
  // Use environment variables instead of hardcoded credentials
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Attempting connection...');
    const client = await pool.connect();
    
    // Try to create the User table directly
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS "User" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "username" TEXT UNIQUE NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "bio" TEXT,
        "profileImageUrl" TEXT,
        "coverImageUrl" TEXT,
        "dateOfBirth" TIMESTAMP WITH TIME ZONE,
        "location" TEXT,
        "website" TEXT,
        "phoneNumber" TEXT,
        "isVerified" BOOLEAN DEFAULT false,
        "isPrivate" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "lastLogin" TIMESTAMP WITH TIME ZONE,
        "name" TEXT,
        "avatar" TEXT
      );
    `;
    
    await client.query(createTableQuery);
    const result = await client.query('SELECT NOW()');
    client.release();

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL connection and table creation successful',
      timestamp: result.rows[0].now
    });
  } catch (error: any) {
    console.error('PostgreSQL connection/creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { 
      status: 500 
    });
  } finally {
    await pool.end();
  }
} 