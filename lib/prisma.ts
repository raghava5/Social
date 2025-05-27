import { PrismaClient } from '@prisma/client'

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined')
}

try {
  const url = new URL(process.env.DATABASE_URL)
  console.log(`Prisma connecting to: ${url.hostname}:${url.port}`)
  
  // Check if using the correct pooler URL
  if (!url.hostname.includes('pooler.supabase.com')) {
    console.warn('⚠️ Warning: DATABASE_URL does not point to pooler.supabase.com')
  }
} catch (e) {
  console.error('⚠️ Invalid DATABASE_URL format:', e instanceof Error ? e.message : String(e))
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
    errorFormat: 'pretty',
  })
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

export { prisma }
