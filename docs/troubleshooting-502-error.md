# Troubleshooting 502 Error - Express Server Not Responding

## Step-by-Step Fix Guide

### Step 1: Check Express Service Status

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Sign in to your account

2. **Find Your Express Service**
   - Look for your Express/x402 server service
   - Click on it to open the service dashboard

3. **Check Service Status**
   - Look at the top of the page - should show "Active" or "Deploying"
   - If it shows "Inactive" or "Failed", you need to restart it

4. **If Service is Down:**
   - Click the "Deploy" button (or restart button)
   - Wait for deployment to complete (usually 2-5 minutes)
   - Status should change to "Active"

---

### Step 2: Check Express Service Logs

1. **In Railway Express Service Dashboard:**
   - Click on "Logs" tab (or "Deployments" → Latest → View Logs)

2. **Look for Errors:**
   - **Missing environment variables:**
     ```
     Missing required environment variables: FACILITATOR_URL or MERCHANT_ADDRESS
     ```
   - **Port binding errors:**
     ```
     Error: listen EADDRINUSE
     ```
   - **PayAI connection errors:**
     ```
     Failed to connect to facilitator
     ```
   - **Application crashes:**
     ```
     Error: Cannot find module...
     ```

3. **Common Issues in Logs:**
   - If you see "Missing required environment variables" → Go to Step 3
   - If you see crashes → Go to Step 4
   - If you see connection errors → Go to Step 5

---

### Step 3: Verify Express Service Environment Variables

1. **In Railway Express Service Dashboard:**
   - Click on "Variables" tab

2. **Required Variables (from PayAI docs):**
   - `FACILITATOR_URL` - Should be: `https://facilitator.payai.network`
   - `MERCHANT_ADDRESS` - Your wallet address (e.g., `0x...`)
   - `CDP_API_KEY_ID` - Coinbase Developer Platform Key (for Base mainnet)
   - `CDP_API_KEY_SECRET` - Coinbase Developer Platform Key Secret
   - `ANTHROPIC_API_KEY` - Your Anthropic API key (for chat functionality)
   - `PORT` - Optional, defaults to 4021

3. **Verify Each Variable:**
   - Check that `MERCHANT_ADDRESS` starts with `0x` and is 42 characters
   - Check that `FACILITATOR_URL` is exactly `https://facilitator.payai.network`
   - For Base mainnet, ensure `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET` are set

4. **If Variables Are Missing:**
   - Click "New Variable"
   - Add each missing variable
   - Save - Railway will automatically redeploy

---

### Step 4: Verify Next.js Service X402_SERVER_URL

1. **Go to Railway → Next.js Service:**
   - Click on your Next.js service

2. **Click "Variables" Tab**

3. **Check X402_SERVER_URL:**
   - Should be set to your Express service URL
   - Example: `https://api.r1xlabs.com` or `https://your-express-service.up.railway.app`
   - **Should NOT be:** `localhost` or empty

4. **Find Your Express Service URL:**
   - Go back to Express Service
   - Click "Settings" → "Networking"
   - Copy the "Public Domain" URL (e.g., `https://your-express-service.up.railway.app`)

5. **Set X402_SERVER_URL:**
   - In Next.js service variables
   - Set `X402_SERVER_URL` to the Express service URL you copied
   - Save - Railway will automatically redeploy

---

### Step 5: Test Express Server Directly

1. **Get Your Express Service URL:**
   - Railway → Express Service → Settings → Networking
   - Copy the Public Domain URL

2. **Test Health Endpoint:**
   ```bash
   curl https://your-express-service.up.railway.app/health
   ```
   
   Or open in browser:
   ```
   https://your-express-service.up.railway.app/health
   ```

3. **Expected Response:**
   ```json
   {
     "status": "ok",
     "server": "x402-express",
     "facilitator": "https://facilitator.payai.network",
     "merchant": "0x..."
   }
   ```

4. **If Health Check Fails:**
   - Server is definitely down
   - Go back to Step 1 and restart the service
   - Check logs for why it's failing

---

### Step 6: Check Express Server Code Configuration

1. **Verify Express Server is Listening Correctly:**
   - According to PayAI docs, the server should listen on:
     ```typescript
     app.listen(PORT, '0.0.0.0', () => {
       console.log(`Server listening at http://0.0.0.0:${PORT}`);
     });
     ```
   - Must listen on `0.0.0.0` (not `localhost`) for Railway

2. **Check Your Express Server Code:**
   - File: `x402-server/index.ts`
   - Should have: `app.listen(PORT, '0.0.0.0', ...)`
   - Should NOT have: `app.listen(PORT)` (without host)

---

### Step 7: Restart Both Services

1. **Restart Express Service:**
   - Railway → Express Service
   - Click "Deploy" or "Restart"
   - Wait for deployment (2-5 minutes)

2. **Restart Next.js Service:**
   - Railway → Next.js Service
   - Click "Deploy" or "Restart"
   - Wait for deployment (2-5 minutes)

3. **Wait for Both to Be "Active"**

---

### Step 8: Test Again

1. **Test Express Server:**
   ```bash
   curl https://your-express-service.up.railway.app/health
   ```

2. **Test from Browser:**
   - Go to your Next.js app
   - Try sending a message to the agent
   - Check browser console for errors

3. **Check Logs:**
   - Next.js logs should show: `[Next.js Proxy] Forwarding to Express server: ...`
   - Express logs should show: `[x402-server] Chat request received: ...`

---

## Quick Checklist

- [ ] Express service status is "Active" in Railway
- [ ] Express service logs show no errors
- [ ] All required environment variables are set in Express service:
  - [ ] `FACILITATOR_URL`
  - [ ] `MERCHANT_ADDRESS`
  - [ ] `CDP_API_KEY_ID` (for Base mainnet)
  - [ ] `CDP_API_KEY_SECRET` (for Base mainnet)
  - [ ] `ANTHROPIC_API_KEY`
- [ ] `X402_SERVER_URL` is set in Next.js service (not localhost)
- [ ] Express server `/health` endpoint responds correctly
- [ ] Express server listens on `0.0.0.0` (not localhost)
- [ ] Both services have been restarted

---

## Common Solutions

### If Express Service Won't Start:
1. Check logs for missing environment variables
2. Verify all required vars are set
3. Restart the service

### If Express Service Starts But Doesn't Respond:
1. Check that it's listening on `0.0.0.0` (not `localhost`)
2. Verify PORT is set correctly (or defaults to 4021)
3. Check Railway networking settings

### If Next.js Can't Reach Express:
1. Verify `X402_SERVER_URL` matches Express service URL exactly
2. Test Express `/health` endpoint directly
3. Check Railway logs for connection errors

---

## Still Not Working?

1. **Share Railway Logs:**
   - Express service logs (any errors)
   - Next.js service logs (proxy errors)

2. **Share Configuration:**
   - Express service environment variables (hide secrets)
   - Next.js service `X402_SERVER_URL` value

3. **Test Results:**
   - Result of `curl /health` on Express server
   - Browser console errors

