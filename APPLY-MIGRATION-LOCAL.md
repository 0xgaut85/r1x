# Apply Migration Locally - Quick Guide

## Problem
You're trying to run `npx prisma migrate deploy` locally but getting:
```
Error: Environment variable not found: DATABASE_URL
```

This is because your database is on Railway, not local.

## Solution: Use Railway CLI (Recommended)

### Step 1: Install Railway CLI
```bash
npm i -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Link to Your Project
```bash
railway link
```
Select your Railway project when prompted.

### Step 4: Run Migration via Railway
```bash
railway run npx prisma migrate deploy
```

This runs the migration on Railway's database using Railway's environment variables.

---

## Alternative: Set DATABASE_URL Locally

If you prefer to run migrations locally, you need to get `DATABASE_URL` from Railway:

### Step 1: Get DATABASE_URL from Railway

**Option A: Via Railway Dashboard**
1. Go to https://railway.app
2. Select your project
3. Click on your **PostgreSQL database service**
4. Go to **Variables** tab
5. Copy the `DATABASE_URL` value

**Option B: Via Railway CLI**
```bash
railway variables
```
Look for `DATABASE_URL` in the output.

### Step 2: Create .env File

Create a `.env` file in the project root:

```bash
# .env (DO NOT COMMIT THIS FILE!)
DATABASE_URL=postgresql://user:password@host:port/database
```

**Important:** Add `.env` to `.gitignore` if not already there!

### Step 3: Run Migration Locally
```bash
npx prisma migrate deploy
```

---

## Recommended Approach

**Use Railway CLI** (`railway run npx prisma migrate deploy`) because:
- ✅ No need to expose database credentials locally
- ✅ Uses Railway's secure environment
- ✅ Works the same way as production
- ✅ No risk of committing secrets

---

## After Migration

After the migration succeeds, regenerate Prisma Client:

```bash
npx prisma generate
```

Then restart your application (if running locally) or redeploy on Railway.

