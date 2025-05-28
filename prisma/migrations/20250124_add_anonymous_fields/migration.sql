-- Add new fields to Post table
ALTER TABLE "Post" ADD COLUMN "title" TEXT;
ALTER TABLE "Post" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "Post" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "Post" ADD COLUMN "isAnonymous" BOOLEAN NOT NULL DEFAULT false;

-- Add indexes for performance
CREATE INDEX "Post_isAnonymous_createdAt_idx" ON "Post"("isAnonymous", "createdAt" DESC);
CREATE INDEX "Post_latitude_longitude_idx" ON "Post"("latitude", "longitude"); 