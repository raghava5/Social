import { PrismaClient } from '@prisma/client'

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined')
}

const createPrismaClient = () => {
  return new PrismaClient({
    // Optimize logging for performance
    log: process.env.NODE_ENV === 'development' 
      ? ['warn', 'error']  // Minimal logging in dev
      : ['error'],         // Error-only in production
    
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
  var prisma: undefined | ReturnType<typeof createPrismaClient>
}

const prisma = globalThis.prisma ?? createPrismaClient()

// Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

export { prisma }

// Re-export types for convenience
export type * from '@prisma/client' 