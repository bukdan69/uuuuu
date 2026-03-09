-- Verification Script: Check status of bandar to penjual migration
-- Run this script BEFORE and AFTER the migration to verify success

-- 1. Check current app_role enum values
SELECT 'Current app_role enum values:' as info;
SELECT unnest(enum_range(NULL::app_role)) as role_value;

-- 2. Count records by role
SELECT 'User role distribution:' as info;
SELECT role, COUNT(*) as count 
FROM user_roles 
GROUP BY role
ORDER BY role;

-- 3. Check for 'bandar' records (should be 0 after migration)
SELECT 'Count of bandar records (should be 0 after migration):' as info;
SELECT COUNT(*) as bandar_count 
FROM user_roles 
WHERE role = 'bandar';

-- 4. Check for 'penjual' records (should be > 0 after migration if there were bandar users)
SELECT 'Count of penjual records:' as info;
SELECT COUNT(*) as penjual_count 
FROM user_roles 
WHERE role = 'penjual';

-- 5. Sample of user_roles records (first 10)
SELECT 'Sample user_roles records:' as info;
SELECT id, user_id, role, created_at 
FROM user_roles 
ORDER BY created_at DESC 
LIMIT 10;
