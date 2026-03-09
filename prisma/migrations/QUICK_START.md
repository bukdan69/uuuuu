# Quick Start: Bandar to Penjual Migration

## 🚀 Run the Migration

### Step 1: Backup (Recommended)
```bash
# Create a backup before running migration
pg_dump $DATABASE_URL > backup_before_bandar_to_penjual.sql
```

### Step 2: Run Migration
```bash
# Option A: Using psql
psql $DATABASE_URL -f prisma/migrations/rename_bandar_to_penjual.sql

# Option B: Using Prisma
npx prisma db execute --file prisma/migrations/rename_bandar_to_penjual.sql

# Option C: Using Supabase Dashboard
# Copy contents of rename_bandar_to_penjual.sql and paste in SQL Editor
```

### Step 3: Verify
```bash
# Run verification script
psql $DATABASE_URL -f prisma/migrations/verify_bandar_to_penjual.sql
```

## ✅ Expected Output

After successful migration, you should see:

```
Current app_role enum values:
- user
- admin
- bandar
- penjual

Count of bandar records: 0
Count of penjual records: [number of migrated users]
```

## 📋 What This Does

1. ✅ Adds 'penjual' to app_role enum
2. ✅ Updates all user_roles records from 'bandar' to 'penjual'
3. ✅ Preserves all user data and permissions
4. ✅ No downtime or re-authentication required

## 🔍 Troubleshooting

### Error: "type app_role does not exist"
**Solution**: Run the initial database schema setup first:
```bash
psql $DATABASE_URL -f database-fixes/schema_complete_fixed.sql
```

### Error: "enum value already exists"
**Solution**: This is safe to ignore. The migration is idempotent.

### No records updated
**Solution**: This means there are no users with 'bandar' role yet. This is normal for new databases.

## 📚 More Information

- Full documentation: `README_rename_bandar_to_penjual.md`
- Migration summary: `MIGRATION_SUMMARY.md`
- Verification script: `verify_bandar_to_penjual.sql`

## ⏭️ Next Steps

After running this migration:
1. Continue with Task 3.2 - Update Prisma schema
2. Continue with Task 3.3 - Update SQL schema files
3. Continue with remaining tasks in the bugfix spec

---

**Need Help?** Check the full README or the bugfix spec at `.kiro/specs/rename-bandar-to-penjual/`
