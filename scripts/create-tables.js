#!/usr/bin/env node
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

console.log('🔧 Creating database tables with SQL...');

// Read .env file to get DATABASE_URL
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);

if (!dbUrlMatch) {
  console.error('❌ Could not find DATABASE_URL in .env file');
  process.exit(1);
}

const connectionString = dbUrlMatch[1];
console.log(`Using database at: ${new URL(connectionString).host}`);

// Create SQL client
const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

async function main() {
  try {
    console.log('Creating User table...');
    
    // Create User table
    await sql`
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
    
    console.log('Creating Profile table...');
    
    // Create Profile table
    await sql`
      CREATE TABLE IF NOT EXISTS "Profile" (
        "id" TEXT PRIMARY KEY,
        "userId" UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "work" TEXT,
        "education" TEXT,
        "relationshipStatus" TEXT,
        "interests" TEXT,
        "about" TEXT,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('Creating test user...');
    
    // Create a test user
    const testUser = await sql`
      INSERT INTO "User" (
        "username", 
        "email", 
        "passwordHash", 
        "firstName", 
        "lastName"
      )
      VALUES (
        ${'testuser' + Date.now()}, 
        ${'test' + Date.now() + '@example.com'}, 
        'test-hash', 
        'Test', 
        'User'
      )
      RETURNING *;
    `;
    
    console.log(`✅ Created test user with ID: ${testUser[0].id}`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    return { success: false, error };
  } finally {
    await sql.end();
    console.log('Database connection closed');
  }
}

main()
  .then(result => {
    if (result.success) {
      console.log('✅ Database tables created successfully!');
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 