# Database Migration: Rename 'bandar' to 'penjual'

## Overview

This migration renames the 'bandar' role to 'penjual' throughout the database to use correct and professional Indonesian terminology.

## What This Migration Does

1. **Adds 'penjual' to app_role enum**: Safely adds the new enum value without disrupting existing data
2. **Updates all user_roles records**: Changes all records with role = 'bandar' to role = 'penjual'
3. **Preserves data integrity**: All user data and role assignments remain intact

## How to Run

### Option 1: Using psql (Recommended for Production)

```bash
psql $DATABASE_URL -f prisma/migrations/rename_bandar_to_penjual.sql
```

### Option 2: Using Supabase SQL Editor

1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `rename_bandar_to_penjual.sql`
4. Paste and execute

### Option 3: Using Prisma Migrate (if using Prisma migrations)

```bash
# This migration is a raw SQL migration
# You may need to create a Prisma migration wrapper
npx prisma migrate dev --name rename_bandar_to_penjual
```

## Verification

After running the migration, verify it was successful:

```sql
-- Check that 'penjual' enum value exists
SELECT unnest(enum_range(NULL::app_role));

-- Verify no 'bandar' records remain (should return 0)
SELECT COUNT(*) FROM user_roles WHERE role = 'bandar';

-- Verify 'penjual' records exist (should show count of migrated users)
SELECT COUNT(*) FROM user_roles WHERE role = 'penjual';

-- View all roles to confirm
SELECT role, COUNT(*) as count 
FROM user_roles 
GROUP BY role;
```

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Add 'bandar' back to enum (if removed)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'bandar';

-- Revert records back to 'bandar'
UPDATE user_roles 
SET role = 'bandar' 
WHERE role = 'penjual';
```

## Safety Notes

- This migration is **non-destructive** - it only adds a new enum value and updates existing records
- The 'bandar' enum value is **NOT removed** by default for safety
- All user permissions and access rights remain unchanged
- No user sessions are affected - users do not need to re-authenticate

## Next Steps

After running this migration:

1. Update the Prisma schema comment in `prisma/schema.prisma`
2. Update TypeScript code to use `isPenjual()` instead of `isBandar()`
3. Update API endpoints and responses
4. Update UI labels and display text
5. Run `npx prisma generate` to regenerate Prisma client types

See the bugfix spec in `.kiro/specs/rename-bandar-to-penjual/` for complete implementation details.
