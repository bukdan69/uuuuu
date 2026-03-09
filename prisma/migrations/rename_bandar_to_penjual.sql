-- Migration: Rename 'bandar' role to 'penjual'
-- This migration updates the app_role enum and all existing records
-- to use the correct Indonesian terminology for seller/merchant role

-- Step 1: Add 'penjual' to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'penjual';

-- Step 2: Update all existing user_roles records from 'bandar' to 'penjual'
UPDATE user_roles 
SET role = 'penjual' 
WHERE role = 'bandar';

-- Step 3: Verify the migration
-- This query should return 0 rows after successful migration
-- SELECT COUNT(*) FROM user_roles WHERE role = 'bandar';

-- Step 4 (OPTIONAL - COMMENTED FOR SAFETY): Remove 'bandar' from enum
-- Removing enum values in PostgreSQL requires recreating the enum type
-- This is commented out for safety and can be done later if needed
-- 
-- BEGIN;
-- 
-- -- Create a temporary enum with only the new values
-- CREATE TYPE app_role_new AS ENUM ('user', 'admin', 'penjual');
-- 
-- -- Update the column to use the new enum type
-- ALTER TABLE user_roles 
--   ALTER COLUMN role TYPE app_role_new 
--   USING role::text::app_role_new;
-- 
-- -- Drop the old enum and rename the new one
-- DROP TYPE app_role;
-- ALTER TYPE app_role_new RENAME TO app_role;
-- 
-- COMMIT;
