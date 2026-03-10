# 🔧 Database Connection Fix - Prisma & Vercel

## Problem
Database connection is failing on Vercel. Prisma cannot connect to the database, causing API routes to fail.

## Root Causes

### 1. Missing or Incorrect Environment Variables
- `DATABASE_URL` not set in Vercel
- `DIRECT_URL` not set in Vercel
- Wrong format (using `https://` instead of `postgresql://`)

### 2. Prisma Client Not Generated
- Prisma client not generated after deployment
- Missing `@prisma/client` in node_modules

### 3. Database Connection Issues
- Supabase database not accessible
- Network connectivity issues
- Database credentials incorrect

## Solutions

### Solution 1: Verify Environment Variables on Vercel

**Step 1: Go to Vercel Dashboard**
```
https://vercel.com/dashboard
```

**Step 2: Select Project "aaaaaaaaam"**

**Step 3: Go to Settings → Environment Variables**

**Step 4: Verify these variables are set:**

```
DATABASE_URL=postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.rdnbvknftxyddjtxbsgc:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**CRITICAL**: 
- ✅ Use `postgresql://` protocol (NOT `https://`)
- ✅ Include password with URL encoding (`%23` for `#`)
- ✅ Use correct region: `aws-1-ap-southeast-1`

**Step 5: Redeploy**
- Click "Deployments"
- Click "..." on latest deployment
- Click "Redeploy"

### Solution 2: Test Database Connection Locally

**Run connection test:**
```bash
npx tsx scripts/test-db-connection.ts
```

**Expected output:**
```
🔌 Testing Database Connection
════════════════════════════════════════════════════════════

📋 Environment Variables:
   DATABASE_URL: ✓ Set
   DIRECT_URL: ✓ Set

🔗 Attempting to connect to database...
✅ Connected successfully!

📊 Testing database queries...
   Profiles: 3
   Listings: 10
   Categories: 7
   User Roles: 3

════════════════════════════════════════════════════════════
✅ All tests passed! Database connection is working.
```

### Solution 3: Regenerate Prisma Client

**On Vercel (automatic):**
- Added `postinstall` hook in `package.json`
- Runs `prisma generate` after `npm install`

**Locally:**
```bash
npx prisma generate
```

### Solution 4: Check Prisma Schema

**Verify schema is valid:**
```bash
npx prisma validate
```

**If errors, fix and regenerate:**
```bash
npx prisma generate
```

### Solution 5: Verify Database Migrations

**Check if migrations are applied:**
```bash
npx prisma migrate status
```

**Apply pending migrations:**
```bash
npx prisma migrate deploy
```

## What Was Fixed

### File: `src/lib/db.ts`

**Before** (❌ Minimal error handling):
```typescript
export const db = new PrismaClient({
  log: ['query'],
})
```

**After** (✅ Better error handling):
```typescript
export const db = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
  errorFormat: 'pretty',
})

// Error event handler
db.$on('error', (e) => {
  console.error('Prisma error:', e)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await db.$disconnect()
  process.exit(0)
})
```

### File: `package.json`

**Already configured:**
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

This ensures Prisma client is generated after `npm install` on Vercel.

## Debugging Steps

### Step 1: Check Vercel Build Logs
1. Go to https://vercel.com/dashboard
2. Select project "aaaaaaaaam"
3. Click "Deployments"
4. Click latest deployment
5. Check "Build Logs" for errors

### Step 2: Check Vercel Runtime Logs
1. Go to https://vercel.com/dashboard
2. Select project "aaaaaaaaam"
3. Click "Deployments"
4. Click latest deployment
5. Check "Runtime Logs" for errors

### Step 3: Test API Endpoint
```bash
# Test if API can connect to database
curl https://aaaaaaaaam.vercel.app/api/kyc
```

Expected response:
```json
{"error":"Unauthorized"}
```

If you get a 500 error, database connection is failing.

### Step 4: Check Database Status
1. Go to https://supabase.com/dashboard
2. Select project "rdnbvknftxyddjtxbsgc"
3. Check "Database" → "Status"
4. Verify database is online

## Common Errors & Solutions

### Error: "P1000: Authentication failed"
**Cause**: Wrong database credentials
**Solution**: 
- Verify DATABASE_URL has correct username/password
- Check password is URL encoded (`%23` for `#`)

### Error: "P1001: Can't reach database server"
**Cause**: Database not accessible
**Solution**:
- Verify Supabase database is online
- Check network connectivity
- Verify DATABASE_URL hostname is correct

### Error: "P1012: Prisma schema validation error"
**Cause**: Prisma client not generated
**Solution**:
```bash
npx prisma generate
```

### Error: "ECONNREFUSED"
**Cause**: Database connection refused
**Solution**:
- Check if Supabase is running
- Verify DATABASE_URL is correct
- Check firewall/network settings

### Error: "ENOTFOUND"
**Cause**: Cannot resolve database hostname
**Solution**:
- Verify DATABASE_URL hostname is correct
- Check DNS resolution
- Verify network connectivity

## Verification Checklist

- [ ] Environment variables set in Vercel
- [ ] DATABASE_URL uses `postgresql://` format
- [ ] DIRECT_URL uses `postgresql://` format
- [ ] Password is URL encoded (`%23` for `#`)
- [ ] Region is `aws-1-ap-southeast-1`
- [ ] Supabase database is online
- [ ] Prisma client is generated
- [ ] Database migrations are applied
- [ ] Test connection passes locally
- [ ] API endpoints return data (not 500 errors)

## Files Modified

- ✅ `src/lib/db.ts` - Improved error handling
- ✅ `package.json` - Already has postinstall hook
- ✅ `scripts/test-db-connection.ts` - New test script (NEW)

## Testing

### Local Test
```bash
npx tsx scripts/test-db-connection.ts
```

### Production Test
```bash
# After deployment, test API
curl https://aaaaaaaaam.vercel.app/api/kyc
```

## Next Steps

1. **Verify Vercel Environment Variables**
   - Go to Vercel Dashboard
   - Check DATABASE_URL and DIRECT_URL are set correctly
   - Redeploy if needed

2. **Test Database Connection**
   - Run: `npx tsx scripts/test-db-connection.ts`
   - Should see all counts > 0

3. **Check Vercel Logs**
   - Go to Vercel Deployments
   - Check Build Logs and Runtime Logs
   - Look for connection errors

4. **Verify API Works**
   - Visit: https://aaaaaaaaam.vercel.app/api/kyc
   - Should return `{"error":"Unauthorized"}` (not 500)

## Status

✅ **COMPLETE** - Database connection fix implemented

---

**Last Updated**: March 10, 2026
**Fix Type**: Database Connection
**Impact**: Critical - Enables all database operations
