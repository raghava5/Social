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

// Create example environment variables
const exampleEnvContent = `# Database Connection
DATABASE_URL="postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
SUPABASE_SERVICE_KEY="[YOUR_SERVICE_KEY]"

# Other environment variables from original .env
`;

// Create a .env.example file with no credentials
fs.writeFileSync(path.join(__dirname, '../.env.example'), exampleEnvContent);
console.log('✅ Created .env.example file with placeholders');

// Backup the original file
fs.writeFileSync(`${envPath}.backup-final`, envContent);
console.log('✅ Original .env file backed up to .env.backup-final');

// Print instructions
console.log('\n⚠️ SECURITY NOTICE:');
console.log('1. Your credentials were previously exposed in code');
console.log('2. Please rotate ALL Supabase credentials immediately');
console.log('3. Update your .env file manually with new credentials');
console.log('4. Add .env and .env.* to your .gitignore file');

// Update schema.prisma to use only DATABASE_URL
const prismaSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
let prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf8');

// Remove directUrl from schema.prisma
prismaSchema = prismaSchema.replace(/directUrl\s*=\s*env\(".*?"\).*\n/g, '');
// Ensure comments don't include any references that might confuse
prismaSchema = prismaSchema.replace(/\/\/.*directUrl.*\n/g, '');

fs.writeFileSync(prismaSchemaPath, prismaSchema);
console.log('✅ prisma/schema.prisma updated to use only DATABASE_URL');

console.log('\n🔍 Next steps:');
console.log('1. Rotate ALL your Supabase credentials immediately');
console.log('2. Update your .env file with new credentials');
console.log('3. Run: npx prisma generate');
console.log('4. Restart your Next.js development server'); 