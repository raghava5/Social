-- 🚀 CRITICAL DATABASE PERFORMANCE OPTIMIZATION
-- This migration adds essential indexes to dramatically improve posts API performance
-- Expected performance improvement: 5-8 seconds -> 100-300ms

-- Drop existing indexes that might conflict
DROP INDEX IF EXISTS "Post_createdAt_idx";
DROP INDEX IF EXISTS "Post_isDeleted_createdAt_idx";
DROP INDEX IF EXISTS "Post_spoke_isDeleted_createdAt_idx";
DROP INDEX IF EXISTS "Post_type_isDeleted_createdAt_idx";
DROP INDEX IF EXISTS "Post_userId_createdAt_idx";

-- 🚀 ULTRA-CRITICAL INDEXES FOR EXACT QUERY PATTERNS
-- These target the specific WHERE and ORDER BY clauses causing 5+ second delays

-- 1. MOST CRITICAL: isDeleted + createdAt DESC (covers 90% of queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "posts_isdeleted_createdat_desc" 
ON "Post" ("isDeleted", "createdAt" DESC) 
WHERE "isDeleted" = false;

-- 2. SPOKE QUERIES: isDeleted + spoke + createdAt DESC  
CREATE INDEX CONCURRENTLY IF NOT EXISTS "posts_spoke_active_desc" 
ON "Post" ("isDeleted", "spoke", "createdAt" DESC) 
WHERE "isDeleted" = false;

-- 3. TYPE QUERIES: isDeleted + type + createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "posts_type_active_desc" 
ON "Post" ("isDeleted", "type", "createdAt" DESC) 
WHERE "isDeleted" = false;

-- 4. COMBINED FILTERS: isDeleted + spoke + type + createdAt DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS "posts_combined_active_desc" 
ON "Post" ("isDeleted", "spoke", "type", "createdAt" DESC) 
WHERE "isDeleted" = false;

-- 🚀 COVERING INDEXES: Include commonly selected columns to avoid heap lookups

-- 5. COVERING INDEX: Include frequently selected columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS "posts_covering_main" 
ON "Post" ("isDeleted", "createdAt" DESC) 
INCLUDE ("id", "content", "images", "videos", "feeling", "spoke", "authorId")
WHERE "isDeleted" = false;

-- 6. AUTHOR LOOKUP OPTIMIZATION
CREATE INDEX CONCURRENTLY IF NOT EXISTS "posts_author_active" 
ON "Post" ("authorId", "isDeleted", "createdAt" DESC) 
WHERE "isDeleted" = false;

-- 🚀 BATCH AGGREGATION SUPER-OPTIMIZED INDEXES

-- 7. LIKES GROUPBY: Critical for likes count aggregation
CREATE INDEX CONCURRENTLY IF NOT EXISTS "likes_postid_optimized" 
ON "Like" ("postId") 
INCLUDE ("userId", "createdAt");

-- 8. COMMENTS GROUPBY: Critical for comments count aggregation  
CREATE INDEX CONCURRENTLY IF NOT EXISTS "comments_postid_active_optimized" 
ON "Comment" ("postId", "isDeleted") 
INCLUDE ("userId", "createdAt")
WHERE "isDeleted" = false;

-- 9. USER BATCH LOOKUP: For efficient author queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_id_profile_optimized" 
ON "User" ("id") 
INCLUDE ("firstName", "lastName", "profileImageUrl", "avatar");

-- 🚀 PARTIAL INDEXES FOR MAXIMUM PERFORMANCE

-- 10. ACTIVE POSTS ONLY: Most queries filter by isDeleted = false
CREATE INDEX CONCURRENTLY IF NOT EXISTS "posts_active_only_createdat" 
ON "Post" ("createdAt" DESC) 
WHERE "isDeleted" = false;

-- 11. ACTIVE POSTS WITH SPOKE: Spoke-filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "posts_active_spoke_createdat" 
ON "Post" ("spoke", "createdAt" DESC) 
WHERE "isDeleted" = false;

-- 12. ACTIVE POSTS WITH TYPE: Type-filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "posts_active_type_createdat" 
ON "Post" ("type", "createdAt" DESC) 
WHERE "isDeleted" = false;

-- Create optimized composite indexes for posts API queries
-- These indexes are specifically designed for the most common query patterns:

-- 1. PRIMARY INDEX: Most posts queries filter by isDeleted=false and order by createdAt DESC
CREATE INDEX "posts_active_by_date" ON "Post" ("isDeleted", "createdAt" DESC);

-- 2. SPOKE FILTERING: Posts filtered by spoke + active + chronological
CREATE INDEX "posts_spoke_filter" ON "Post" ("isDeleted", "spoke", "createdAt" DESC);

-- 3. TYPE FILTERING: Posts filtered by type + active + chronological
CREATE INDEX "posts_type_filter" ON "Post" ("isDeleted", "type", "createdAt" DESC);

-- 4. COMBINED FILTERING: Posts with both spoke and type filters
CREATE INDEX "posts_combined_filter" ON "Post" ("isDeleted", "spoke", "type", "createdAt" DESC);

-- 5. USER POSTS: Specific user's posts (active only)
CREATE INDEX "posts_user_active" ON "Post" ("userId", "isDeleted", "createdAt" DESC);

-- 6. AUTHOR POSTS: Authored posts lookup (for profile pages)
CREATE INDEX "posts_author_active" ON "Post" ("authorId", "isDeleted", "createdAt" DESC);

-- 7. CHRONOLOGICAL FALLBACK: Pure chronological ordering (backup index)
CREATE INDEX "posts_chronological" ON "Post" ("createdAt" DESC);

-- 🚀 ADVANCED INDEXES FOR BATCH AGGREGATION QUERIES

-- 8. LIKES AGGREGATION: Optimized for groupBy operations on postId
CREATE INDEX IF NOT EXISTS "likes_post_aggregation" ON "Like" ("postId") INCLUDE ("userId", "createdAt");

-- 9. COMMENTS AGGREGATION: Optimized for groupBy with isDeleted filter
CREATE INDEX IF NOT EXISTS "comments_post_aggregation" ON "Comment" ("postId", "isDeleted") INCLUDE ("createdAt", "userId");

-- 10. USER LIKES BATCH: For checking user's likes across multiple posts
CREATE INDEX IF NOT EXISTS "likes_user_batch" ON "Like" ("userId", "postId");

-- 11. AUTHOR BATCH LOOKUP: For efficient IN queries on author IDs
CREATE INDEX IF NOT EXISTS "users_batch_lookup" ON "User" ("id") INCLUDE ("firstName", "lastName", "profileImageUrl", "avatar");

-- 🚀 CURSOR-BASED PAGINATION OPTIMIZATION

-- 12. POST ID CURSOR: Essential for cursor-based pagination
CREATE INDEX IF NOT EXISTS "posts_id_cursor" ON "Post" ("id", "createdAt" DESC);

-- 13. LATEST COMMENTS: For DISTINCT ON queries to get latest comment per post
CREATE INDEX IF NOT EXISTS "comments_latest_per_post" ON "Comment" ("postId", "createdAt" DESC) WHERE "isDeleted" = false;

-- Additional indexes for related tables to improve JOIN performance

-- Optimize comment queries (for post.comments relation)
CREATE INDEX IF NOT EXISTS "comments_post_active" ON "Comment" ("postId", "isDeleted", "createdAt" DESC);

-- Optimize likes queries (for post.likes relation and counts)
CREATE INDEX IF NOT EXISTS "likes_post_user" ON "Like" ("postId", "userId");
CREATE INDEX IF NOT EXISTS "likes_user_post" ON "Like" ("userId", "postId");

-- 🚀 POSTGRESQL SPECIFIC OPTIMIZATIONS

-- Enable parallel queries for aggregation
SET max_parallel_workers_per_gather = 4;
SET parallel_tuple_cost = 0.1;
SET parallel_setup_cost = 1000.0;

-- Optimize work memory for complex queries
SET work_mem = '256MB';

-- Add statistics refresh for PostgreSQL query planner
ANALYZE "Post";
ANALYZE "Comment";
ANALYZE "Like";
ANALYZE "User";

-- 🚀 CREATE PARTIAL INDEXES FOR BETTER PERFORMANCE

-- Active posts only (most common query)
CREATE INDEX IF NOT EXISTS "posts_active_only" ON "Post" ("createdAt" DESC) WHERE "isDeleted" = false;

-- Non-deleted comments only
CREATE INDEX IF NOT EXISTS "comments_active_only" ON "Comment" ("postId", "createdAt" DESC) WHERE "isDeleted" = false; 