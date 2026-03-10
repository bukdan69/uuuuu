# ⚡ Quick Fix - Database Connection on Vercel

## The Problem
Database connection is failing on Vercel. KYC upload and other features can't access the database.

## The Fix (3 Steps)

### Step 1: Verify Environment Variables on Vercel ✅

**Go to**: https://vercel.com/dashboard

**Select**: Project "aaaaaaaaam"

**Go to**: Settings → Environment Variables

**Check these are set:**

```
DATABASE_URL=postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**IMPORTANT**: 
- ✅ Must start with `postgresql://` (NOT `https://`)
- ✅ Password has `%23` (URL encoded `#`)
- ✅ Region is `aws-1-ap-southeast-1`

### Step 2: Redeploy on Vercel ✅

**Go to**: https://vercel.com/dashboard/project/aaaaaaaaam/deployments

**Click**: Latest deployment → "..." → "Redeploy"

**Wait**: For deployment to complete (2-3 minutes)

### Step 3: Test Connection ✅

**Run locally:**
```bash
npx tsx scripts/test-db-connection.ts
```

**Expected output:**
```
✅ Connected successfully!
   Profiles: 3
   Listings: 10
   Categories: 7
```

**Or test production:**
```bash
curl https://aaaaaaaaam.vercel.app/api/kyc
```

Should return `{"error":"Unauthorized"}` (not 500 error)

## What Was Fixed

1. **Improved Prisma Error Handling** (`src/lib/db.ts`)
   - Better error logging
   - Graceful shutdown
   - Connection error detection

2. **Added Diagnostics Script** (`scripts/test-db-connection.ts`)
   - Test database connection
   - Show table counts
   - Helpful error messages

3. **Documentation** (`DATABASE-CONNECTION-FIX.md`)
   - Comprehensive troubleshooting guide
   - Common errors & solutions
   - Verification checklist

## If Still Not Working

### Check Vercel Build Logs
1. Go to https://vercel.com/dashboard/project/aaaaaaaaam/deployments
2. Click latest deployment
3. Check "Build Logs" for errors
4. Look for "Prisma" or "database" errors

### Check Vercel Runtime Logs
1. Go to https://vercel.com/dashboard/project/aaaaaaaaam/deployments
2. Click latest deployment
3. Check "Runtime Logs" for errors
4. Look for connection errors

### Verify Supabase Database
1. Go to https://supabase.com/dashboard
2. Select project "rdnbvknftxyddjtxbsgc"
3. Check "Database" → "Status"
4. Should show "Online"

### Test Locally
```bash
# Test connection
npx tsx scripts/test-db-connection.ts

# Check Prisma schema
npx prisma validate

# Regenerate Prisma client
npx prisma generate
```

## Status

✅ **Code Fixed** - All changes pushed to GitHub
⏳ **Waiting** - Vercel redeploy to apply fixes
🔄 **Next** - Verify environment variables and redeploy

---

**Files Changed**:
- `src/lib/db.ts` - Improved error handling
- `scripts/test-db-connection.ts` - New diagnostic script
- `DATABASE-CONNECTION-FIX.md` - Comprehensive guide

**Code Status**: Pushed to all GitHub repositories ✅
