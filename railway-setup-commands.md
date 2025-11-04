# Railway CLI Setup Commands

## Prerequisites
1. Run `railway login` in your terminal (opens browser for authentication)

## After Login - Run These Commands

### 1. Link to Your Project
```bash
railway link
```
- Select your project when prompted

### 2. List All Services
```bash
railway service list
```
- Note the names of your services (should see "r1x" and your Express service)

### 3. Configure Express Service

**Option A: If you know the service name**
```bash
# Select Express service
railway service
# Choose your Express/x402 service from the list

# Set root directory
railway variables set RAILWAY_ROOT_DIRECTORY=x402-server

# Or use service-specific commands (check Railway CLI docs for latest syntax)
```

**Option B: Configure via Railway Dashboard**
Since Railway CLI might have limitations, you can also configure via dashboard:

1. Go to Railway → Express Service → Settings
2. Set "Root Directory" to: `x402-server`
3. Set "Build Command" to: `npm install && npm run build`
4. Set "Start Command" to: `npm start`

### 4. Get Express Service URL
```bash
railway service
# Select Express service
railway domain
# Or check Railway dashboard → Settings → Networking
```

### 5. Set X402_SERVER_URL in Next.js Service
```bash
railway service
# Select Next.js service (r1x)
railway variables set X402_SERVER_URL=https://your-express-service.up.railway.app
```

## Alternative: Use Railway Dashboard
Since CLI might be limited, the dashboard is often easier:

1. **Express Service Configuration:**
   - Settings → Root Directory: `x402-server`
   - Settings → Build Command: `npm install && npm run build`
   - Settings → Start Command: `npm start`
   - Variables → Add all Express env vars (MERCHANT_ADDRESS, etc.)

2. **Get Express URL:**
   - Express Service → Settings → Networking → Copy Public Domain

3. **Update Next.js Service:**
   - Next.js Service → Variables → Set `X402_SERVER_URL` to Express URL

