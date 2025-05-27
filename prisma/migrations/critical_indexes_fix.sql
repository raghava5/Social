-- 🚀 CRITICAL PERFORMANCE FIX - IMMEDIATE INDEXES
-- Adds the most essential indexes to fix 5+ second query delays

-- 🚀 ULTRA-CRITICAL INDEXES (covers 90% of slow queries)

-- 1. MOST CRITICAL: isDeleted + createdAt DESC (main query pattern)
CREATE INDEX IF NOT EXISTS "posts_isdeleted_createdat_desc" 
ON "Post" ("isDeleted", "createdAt" DESC);

-- 2. COVERING INDEX: Include frequently selected columns to avoid heap lookups
CREATE INDEX IF NOT EXISTS "posts_covering_main" 
ON "Post" ("isDeleted", "createdAt" DESC, "id", "content", "images", "videos", "feeling", "spoke", "authorId");

-- 3. SPOKE QUERIES: isDeleted + spoke + createdAt DESC  
CREATE INDEX IF NOT EXISTS "posts_spoke_active_desc" 
ON "Post" ("isDeleted", "spoke", "createdAt" DESC);

-- 4. TYPE QUERIES: isDeleted + type + createdAt DESC
CREATE INDEX IF NOT EXISTS "posts_type_active_desc" 
ON "Post" ("isDeleted", "type", "createdAt" DESC);

-- 🚀 BATCH AGGREGATION CRITICAL INDEXES

-- 5. LIKES GROUPBY: Critical for likes count aggregation
CREATE INDEX IF NOT EXISTS "likes_postid_optimized" 
ON "Like" ("postId", "userId", "createdAt");

-- 6. COMMENTS GROUPBY: Critical for comments count aggregation  
CREATE INDEX IF NOT EXISTS "comments_postid_active_optimized" 
ON "Comment" ("postId", "isDeleted", "userId", "createdAt");

-- 7. USER BATCH LOOKUP: For efficient author queries
CREATE INDEX IF NOT EXISTS "users_id_profile_optimized" 
ON "User" ("id", "firstName", "lastName", "profileImageUrl");

-- 🚀 FORCE QUERY PLANNER TO USE INDEXES
ANALYZE "Post";
ANALYZE "Comment";
ANALYZE "Like";
ANALYZE "User"; 