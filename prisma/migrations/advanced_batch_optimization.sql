-- 🚀 ADVANCED BATCH AGGREGATION OPTIMIZATION
-- Adds specialized indexes for batch queries and cursor-based pagination
-- Expected improvement: 3-4 seconds -> under 1 second for cold cache

-- 🚀 ADVANCED INDEXES FOR BATCH AGGREGATION QUERIES

-- Likes aggregation optimization
CREATE INDEX IF NOT EXISTS "likes_post_aggregation" ON "Like" ("postId") INCLUDE ("userId", "createdAt");

-- Comments aggregation optimization  
CREATE INDEX IF NOT EXISTS "comments_post_aggregation" ON "Comment" ("postId", "isDeleted") INCLUDE ("createdAt", "userId");

-- User likes batch checking
CREATE INDEX IF NOT EXISTS "likes_user_batch" ON "Like" ("userId", "postId");

-- Author batch lookup optimization
CREATE INDEX IF NOT EXISTS "users_batch_lookup" ON "User" ("id") INCLUDE ("firstName", "lastName", "profileImageUrl", "avatar");

-- 🚀 CURSOR-BASED PAGINATION OPTIMIZATION

-- Post ID cursor for efficient pagination
CREATE INDEX IF NOT EXISTS "posts_id_cursor" ON "Post" ("id", "createdAt" DESC);

-- Latest comments per post (for DISTINCT ON queries)
CREATE INDEX IF NOT EXISTS "comments_latest_per_post" ON "Comment" ("postId", "createdAt" DESC) WHERE "isDeleted" = false;

-- 🚀 PARTIAL INDEXES FOR BETTER PERFORMANCE

-- Active posts only (most common query pattern)
CREATE INDEX IF NOT EXISTS "posts_active_only" ON "Post" ("createdAt" DESC) WHERE "isDeleted" = false;

-- Non-deleted comments only  
CREATE INDEX IF NOT EXISTS "comments_active_only" ON "Comment" ("postId", "createdAt" DESC) WHERE "isDeleted" = false;

-- 🚀 POSTGRESQL QUERY OPTIMIZATION

-- Refresh statistics for optimal query planning
ANALYZE "Post";
ANALYZE "Comment"; 
ANALYZE "Like";
ANALYZE "User"; 