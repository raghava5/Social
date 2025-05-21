import { PrismaClient } from '@prisma/client'

// Log the DATABASE_URL being used (partially, for security)
const dbUrl = process.env.DATABASE_URL || ''
try {
  const url = new URL(dbUrl)
  console.log(`Prisma connecting to: ${url.hostname}:${url.port}`)
} catch (e) {
  console.error('Invalid DATABASE_URL:', dbUrl ? 'present but invalid' : 'missing')
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || 
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma 