-- Baseline migration
-- This migration represents the current state of the database including Sponsor and CarouselConfig tables

-- Note: All tables already exist in the database
-- This is a baseline migration to establish migration history

-- Sponsor table structure (already exists)
-- CREATE TABLE IF NOT EXISTS "sponsors" (
--   "id" TEXT NOT NULL PRIMARY KEY,
--   "name" TEXT NOT NULL,
--   "logoUrl" TEXT NOT NULL,
--   "website" TEXT NOT NULL,
--   "category" TEXT NOT NULL,
--   "isActive" BOOLEAN NOT NULL DEFAULT true,
--   "sortOrder" INTEGER NOT NULL DEFAULT 0,
--   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   "updatedAt" TIMESTAMP(3) NOT NULL
-- );

-- CarouselConfig table structure (already exists)
-- CREATE TABLE IF NOT EXISTS "carousel_configs" (
--   "id" TEXT NOT NULL PRIMARY KEY,
--   "scrollSpeed" INTEGER NOT NULL DEFAULT 20,
--   "pauseOnHover" BOOLEAN NOT NULL DEFAULT true,
--   "updatedAt" TIMESTAMP(3) NOT NULL,
--   "updatedBy" TEXT
-- );

-- Indexes (already exist)
-- CREATE INDEX IF NOT EXISTS "sponsors_isActive_sortOrder_idx" ON "sponsors"("isActive", "sortOrder");
