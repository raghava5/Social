const { PrismaClient } = require('@prisma/client')

async function runMigration() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Adding anonymous posting fields to Post table...')
    
    // Add new fields to Post table
    await prisma.$executeRaw`ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "title" TEXT;`
    await prisma.$executeRaw`ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;`
    await prisma.$executeRaw`ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;`
    await prisma.$executeRaw`ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "isAnonymous" BOOLEAN NOT NULL DEFAULT false;`
    
    console.log('✅ Successfully added new fields')
    
    // Add indexes for performance
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Post_isAnonymous_createdAt_idx" ON "Post"("isAnonymous", "createdAt" DESC);`
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Post_latitude_longitude_idx" ON "Post"("latitude", "longitude");`
      console.log('✅ Successfully added indexes')
    } catch (indexError) {
      console.log('⚠️ Indexes may already exist:', indexError.message)
    }
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

runMigration() 