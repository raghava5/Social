#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Prisma connection issues...');

// Path to .env file
const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env file not found!');
  process.exit(1);
}

// Read current .env content
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract connection info
const projectRef = 'ivjtrpazmmppjcqdzibm';
const password = '9mEHjDPtMkUYKOz7';

// Create the properly formatted connections per Supabase docs
const poolerUrl = `postgres://postgres.${projectRef}:${password}@aws-0-us-east-2.pooler.supabase.com:5432/postgres`;

// Define the new environment content with ONLY the pooler URL for both DATABASE_URL and url
const newEnvContent = `# Database Connection
DATABASE_URL="${poolerUrl}"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://ivjtrpazmmppjcqdzibm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2anRycGF6bW1wcGpjcWR6aWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDg5NDMsImV4cCI6MjA2MzMyNDk0M30.E3ta1b2uIKGLjUlbi91252wgEzyVi_0De3LHLmhKjF4"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2anRycGF6bW1wcGpjcWR6aWJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc0ODk0MywiZXhwIjoyMDYzMzI0OTQzfQ.5trSf35FR2Ze-kf69zEaQdHnBALasymKQ7Q9koGYe5E"

# Other variables preserved from original .env
` + envContent.replace(/DATABASE_URL=.*(\r?\n|$)/g, '')
  .replace(/DIRECT_URL=.*(\r?\n|$)/g, '')
  .replace(/NEXT_PUBLIC_SUPABASE_URL=.*(\r?\n|$)/g, '')
  .replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*(\r?\n|$)/g, '')
  .replace(/SUPABASE_SERVICE_KEY=.*(\r?\n|$)/g, '');

// Backup the original file
fs.writeFileSync(`${envPath}.backup-final`, envContent);
console.log('✅ Original .env file backed up to .env.backup-final');

// Write the new .env file
fs.writeFileSync(envPath, newEnvContent);
console.log('✅ .env file updated with correct configuration');

// Update schema.prisma to use only DATABASE_URL
const prismaSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
let prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf8');

// Remove directUrl from schema.prisma
prismaSchema = prismaSchema.replace(/directUrl\s*=\s*env\(".*?"\).*\n/g, '');
// Ensure comments don't include any references that might confuse
prismaSchema = prismaSchema.replace(/\/\/.*directUrl.*\n/g, '');

fs.writeFileSync(prismaSchemaPath, prismaSchema);
console.log('✅ prisma/schema.prisma updated to use only DATABASE_URL');

// Regenerate Prisma client
try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error);
}

console.log('\n🔍 Next steps:');
console.log('1. Restart your Next.js development server');
console.log('2. Clear your browser cache');
console.log('3. Test your application by making a post') 