# Trigger Migration - Easy Methods

## ✅ Good News: Migrations Run Automatically!

Your `scripts/start.sh` already runs migrations on every deployment. You just need to trigger a redeploy.

## Method 1: Redeploy on Railway (Easiest)

### Step 1: Go to Railway Dashboard
1. Open https://railway.app
2. Select your project: **r1x**
3. Click on your **Next.js service**

### Step 2: Trigger Redeploy
**Option A: Via Deployments Tab**
1. Click **"Deployments"** tab
2. Click **"Redeploy"** button (or three dots menu → Redeploy)

**Option B: Via Settings**
1. Click **"Settings"** tab
2. Scroll down and click **"Redeploy"** button

**Option C: Push to GitHub** (if using GitHub integration)
```bash
git commit --allow-empty -m "Trigger migration redeploy"
git push
```

### Step 3: Watch the Logs
1. Click **"Logs"** tab (or **"Deployments"** → Latest → **"View Logs"**)
2. Look for these messages:
   ```
   Running database migrations...
   ✅ Applied migration: 20250103000000_init
   ✅ Applied migration: 20251106_add_marketplace_discovery_fields
   ✓ Database migrations completed successfully
   ```

If you see "Migration already applied", that's fine - it means it worked!

---

## Method 2: Get Public DATABASE_URL and Run Locally

If redeploy doesn't work, you can run the migration locally:

### Step 1: Get DATABASE_URL from Railway
1. Go to Railway → Your Project → **PostgreSQL Service** (r1x-db)
2. Click **"Variables"** tab
3. Find `DATABASE_URL` or `POSTGRES_URL`
4. **Important:** Copy the one with a **public hostname** (not `railway.internal`)
   - ✅ Good: `postgresql://user:pass@containers-us-west-xxx.railway.app:5432/railway`
   - ❌ Bad: `postgresql://user:pass@r1x-db.railway.internal:5432/railway`

### Step 2: Create .env File
Create `.env` in your project root:
```env
DATABASE_URL=postgresql://postgres:password@public-hostname.railway.app:5432/railway
```

**⚠️ Important:** Add `.env` to `.gitignore` if not already there!

### Step 3: Run Migration
```bash
npx prisma migrate deploy
```

You should see:
```
✅ Applied migration: 20250103000000_init
✅ Applied migration: 20251106_add_marketplace_discovery_fields
```

### Step 4: Regenerate Prisma Client
```bash
npx prisma generate
```

---

## Method 3: Check Current Migration Status

Check if migration already ran by looking at deployment logs:

1. Go to Railway → Next.js Service → **Logs**
2. Search for: `migration` or `Database migrations`
3. Look for:
   - ✅ `✓ Database migrations completed successfully`
   - ⚠️ `Migration already applied` (this is OK!)

---

## Recommended: Method 1 (Redeploy)

**Just redeploy your Next.js service** - migrations run automatically! This is the safest and easiest method.

---

## After Migration

Once migration is applied:
1. ✅ Errors will stop
2. ✅ All new fields available
3. ✅ App works normally

The code is already migration-safe, so it will work once the migration runs.

