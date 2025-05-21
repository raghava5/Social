// Import the central prisma client instead of creating a new one
import { prisma } from '@/lib/db'

// Re-export the prisma client
export { prisma } 