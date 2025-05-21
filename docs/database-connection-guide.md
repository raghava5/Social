# Database Connection Guide

## Overview

This guide addresses common database connection issues in the Social app, particularly "Can't reach database server" errors that may occur when posting content from the home page.

## Problem

The application was experiencing database connection issues due to:

1. Direct imports of PrismaClient from '@prisma/client' in various files
2. Multiple, uncoordinated PrismaClient instances being created
3. Some instances using incorrect database URLs or connection parameters
4. Missing proper connection pooling configuration

## Solution

We've implemented a centralized database client architecture:

### 1. Centralized Clients

The application now has two main database client files:

- `lib/db.ts`: The main entry point that exports both Prisma and Postgres clients
- `lib/prisma.ts`: Handles Prisma client initialization with proper configuration
- `lib/postgres.ts`: Handles raw SQL connection with proper configuration

### 2. Connection Parameters

We've updated the database connection to use:

- Pooled connections via Supabase's connection pooler (`pooler.supabase.com`)
- Proper SSL settings
- Connection pool limits and timeouts
- Consistent error handling

### 3. Import Guidelines

When working with the database:

- Always import from `@/lib/db` instead of `@prisma/client`
- Use `import { prisma } from '@/lib/db'` for Prisma ORM operations
- Use `import { sql } from '@/lib/db'` for raw SQL queries

## Testing Your Connection

We've created several test scripts to verify database connectivity:

1. `scripts/verify-all-connections.js` - Tests both Prisma and Postgres connections
2. Test endpoints:
   - `/api/postgres-test` - Tests direct postgres connection
   - `/api/prisma-test` - Tests prisma connection

## Common Issues

### Error: "Can't reach database server at `db.ivjtrpazmmppjcqdzibm.supabase.co:5432`"

This usually means:
- You're using a direct database connection instead of the connection pooler
- The file is importing PrismaClient directly rather than using the centralized client

### Fix:

1. Update the imports:
   ```typescript
   // WRONG
   import { PrismaClient } from '@prisma/client'
   const prisma = new PrismaClient()

   // RIGHT
   import { prisma } from '@/lib/db'
   ```

2. Run the database connection finder script to locate problematic files:
   ```
   node scripts/fix-all-prisma-imports.js
   ```

3. Apply fixes automatically:
   ```
   node scripts/fix-all-prisma-imports.js --fix
   ```

4. Restart the development server:
   ```
   npm run dev
   ```

## Environment Setup

Ensure your `.env.local` file has the correct DATABASE_URL format:

```
DATABASE_URL=postgresql://postgres.ivjtrpazmmppjcqdzibm:password@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20&sslmode=require
```

Key points:
- Use `pooler.supabase.com` instead of direct `db.ivjtrpazmmppjcqdzibm.supabase.co`
- Include `pgbouncer=true` parameter
- Set appropriate connection limits and timeouts
- Enable SSL with `sslmode=require` 