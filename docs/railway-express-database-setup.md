# Railway Express Server Database Setup

## Problem

If you see this error in Express server logs:
```
[Save Transaction] Prisma client not initialized, skipping transaction save
```

This means the Express server (`r1x-server`) doesn't have `DATABASE_URL` configured.

## Solution

### Step 1: Find Your Database URL

1. Go to Railway Dashboard → `r1x-db` service
2. Click on the **Variables** tab
3. Find `DATABASE_URL` (or `POSTGRES_URL`)
4. Copy the full connection string (it should look like: `postgresql://user:password@host:port/dbname`)

### Step 2: Add DATABASE_URL to Express Server

1. Go to Railway Dashboard → `r1x-server` (Express service)
2. Click on the **Variables** tab
3. Click **+ New Variable**
4. Set:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste the database URL from Step 1
5. Click **Add**

### Step 3: Verify

After adding `DATABASE_URL`, the Express server will automatically restart. Check the logs:

**Before (missing DATABASE_URL):**
```
[Save Transaction] DATABASE_URL not set, transaction saving disabled
```

**After (with DATABASE_URL):**
```
[Save Transaction] Prisma client initialized (DATABASE_URL found)
[Save Transaction] Prisma connection test successful
[x402-server] Transaction saving enabled (DATABASE_URL configured)
```

### Step 4: Test Transaction Saving

1. Send a chat message through the r1x Agent
2. Check Express server logs - you should see:
```
[Save Transaction] Transaction saved successfully: { transactionHash: '0x...', ... }
```

## Important Notes

- **Same Database**: Both `r1x` (Next.js) and `r1x-server` (Express) should use the **same** `DATABASE_URL` so they share the same database
- **Automatic Migrations**: The Next.js service runs migrations on startup. The Express server doesn't need to run migrations (it just reads/writes data)
- **Non-Blocking**: Transaction saving is **non-blocking** - if the database save fails, the payment still succeeds and the chat response is sent
- **Timeout Protection**: Transaction saves have a 5-second timeout to prevent hanging requests

## Troubleshooting

### Still seeing "Prisma client not initialized"?

1. **Check Variable Name**: Make sure it's exactly `DATABASE_URL` (case-sensitive)
2. **Check Value**: The URL should start with `postgresql://`
3. **Restart Service**: Railway should auto-restart, but you can manually restart if needed
4. **Check Logs**: Look for Prisma initialization messages in the Express server logs

### Connection Errors?

If you see Prisma connection errors:
1. Verify the `DATABASE_URL` is correct
2. Check that the database service (`r1x-db`) is running
3. Ensure the database allows connections from the Express service (Railway handles this automatically)

### Transactions Not Appearing in User Panel?

1. Check Express server logs for transaction save errors
2. Verify `DATABASE_URL` is set correctly
3. Check that the transaction was saved (look for `[Save Transaction] Transaction saved successfully`)
4. Refresh the user panel - transactions appear immediately after payment

