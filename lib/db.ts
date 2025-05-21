import { prisma } from './prisma'
import sql from './postgres'

// Export both clients from a single file
// This is the only place where database clients should be imported from
export { prisma, sql }

// Re-export types
export type * from '@prisma/client' 