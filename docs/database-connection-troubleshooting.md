# Database Connection Troubleshooting Guide

## Fixed Issues

The database connection issues in the application have been resolved by implementing the following changes:

1. Updated the `.env.local` file to use the Supabase pooler URL instead of direct connection
2. Created a centralized database client architecture in `lib/db.ts`
3. Updated all Prisma imports to use the centralized client
4. Added proper connection pooling and SSL configuration

## How to Test Connection

Our verification tests show that database connections are working properly:

```
$ node scripts/verify-all-connections.js

🔍 Comprehensive Database Connection Test
========================================
   postgres package: ✅ SUCCESS
   Prisma Client: ✅ SUCCESS

✅ ALL TESTS PASSED! Your database connection is working properly.
```

## Common Errors and Solutions

### 1. "Can't reach database server at `db.ivjtrpazmmppjcqdzibm.supabase.co:5432`"

This error occurs when the application is trying to connect directly to the database server instead of using the connection pooler.

**Solution:**
- Check your `.env.local` file and ensure it's using the pooler URL
- Run `node scripts/fix-db-url.js` to update the DATABASE_URL
- Restart your Next.js server: `npm run dev`

### 2. Browser Caching Issues

Sometimes browsers cache API responses or application state, leading to persistent errors even after fixing the underlying issues.

**Solution:**
- Clear browser cache and cookies
- Open browser developer tools (F12) and check the Network tab
- Verify that API requests are not being served from cache
- Try using incognito/private browsing mode

### 3. Authentication Issues

Some API endpoints require authentication, which might cause redirect to the login page.

**Solution:**
- Make sure you're logged in
- Check that your auth token is valid
- For testing APIs without a UI, use tools like Postman or curl with proper auth headers

## Environment Setup

Your environment should be configured as follows:

1. In `.env.local`:
```
DATABASE_URL=postgresql://postgres.ivjtrpazmmppjcqdzibm:***@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20&sslmode=require
```

2. Import pattern in your files:
```typescript
// CORRECT: Use centralized client
import { prisma, sql } from '@/lib/db'

// INCORRECT: Don't import directly
import { PrismaClient } from '@prisma/client'
```

## Next Steps

If you're still experiencing issues:

1. Look for any files importing PrismaClient directly:
   ```
   node scripts/fix-all-prisma-imports.js
   ```

2. Check for environment variables in the Next.js process:
   ```
   node scripts/check-nextjs-env.js
   ```

3. Make sure you're using the latest code and have restarted the Next.js server
   ```
   git pull
   npm install
   npm run dev
   ```

4. Verify that your application is properly authenticated when making API calls

## Browser-Side Debugging

For the home page post creation problem:

1. Open browser developer tools (F12)
2. Go to the Network tab
3. Try creating a post and observe the network request
4. Check the request payload and response
5. Look for any error messages in the console

This should help identify if there are any remaining issues with database connections or authentication. 