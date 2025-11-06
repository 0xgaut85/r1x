# Apply Migration on Railway - Step by Step

## The Issue
Railway CLI uses internal network addresses that don't work from your local machine. We need to run the migration directly on Railway.

## Solution: Use Railway Web Shell

### Step 1: Go to Railway Dashboard
1. Open https://railway.app
2. Select your project: **r1x**
3. Click on your **Next.js service** (not the database service)

### Step 2: Open Shell
1. Click on **"Deployments"** tab
2. Click on the **latest deployment**
3. Click **"View Logs"** button
4. Click the **"Shell"** button (top right)

### Step 3: Run Migration
In the Railway shell, run:
```bash
npx prisma migrate deploy
```

You should see:
```
✅ Applied migration: 20250103000000_init
✅ Applied migration: 20251106_add_marketplace_discovery_fields
```

### Step 4: Regenerate Prisma Client
After migration succeeds, regenerate Prisma Client:
```bash
npx prisma generate
```

### Step 5: Restart Service
The service should automatically restart, or you can manually restart it from Railway dashboard.

---

## Alternative: Get Public DATABASE_URL

If you want to run migrations locally, you need the **public** DATABASE_URL:

### Step 1: Get Public Connection String
1. Go to Railway → Your Project → **PostgreSQL Service**
2. Click **"Variables"** tab
3. Look for `DATABASE_URL` or `POSTGRES_URL`
4. Copy the value

**Important:** The connection string should have a **public hostname**, not `railway.internal`

### Step 2: Create .env File Locally
Create `.env` in project root:
```env
DATABASE_URL=postgresql://postgres:password@public-hostname.railway.app:5432/railway
```

### Step 3: Run Migration Locally
```bash
npx prisma migrate deploy
npx prisma generate
```

---

## Recommended: Use Railway Web Shell
The web shell method is recommended because:
- ✅ No need to expose database credentials
- ✅ Uses Railway's secure environment
- ✅ Works exactly like production
- ✅ No local .env file needed

