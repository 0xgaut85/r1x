# r1x Endpoint URLs

## Production Base URLs

### Next.js Service (Frontend + API Routes)
- **Custom Domain**: `https://www.r1xlabs.com`
- **Railway Domain**: (Check Railway dashboard for your service URL)

### Express x402 Server (Payment Processing)
- **Custom Domain**: `https://server.r1xlabs.com`
- **Railway Domain**: `https://daring-analysis-production.up.railway.app`

---

## Complete API Endpoint URLs

### Next.js Service Endpoints

#### AI Agent & Payment
- `POST https://www.r1xlabs.com/api/r1x-agent/chat` - AI Agent chat (proxies to Express)
- `POST https://www.r1xlabs.com/api/x402/pay` - Payment processing (proxies to Express)

#### Marketplace
- `GET https://www.r1xlabs.com/api/marketplace/services` - List available services

#### Sync & Health
- `POST https://www.r1xlabs.com/api/sync/payai` - Sync PayAI services
- `GET https://www.r1xlabs.com/api/health/db` - Database health check
- `GET https://www.r1xlabs.com/api/config/x402-server-url` - Get x402 server URL config
- `GET https://www.r1xlabs.com/api/debug/echo` - Debug echo endpoint

#### User Panel APIs
- `GET https://www.r1xlabs.com/api/panel/user/stats?address=0x...` - User statistics
- `GET https://www.r1xlabs.com/api/panel/user/transactions?address=0x...` - User transactions
- `GET https://www.r1xlabs.com/api/panel/user/usage?address=0x...` - User usage data

#### Platform Panel APIs
- `GET https://www.r1xlabs.com/api/panel/platform/analytics` - Platform analytics
- `GET https://www.r1xlabs.com/api/panel/platform/fees` - Fee analytics
- `GET https://www.r1xlabs.com/api/panel/platform/services` - Service analytics

#### Public APIs (for x402scan/Partners)
- `GET https://www.r1xlabs.com/api/panel/public/services` - Public service catalog
- `GET https://www.r1xlabs.com/api/panel/public/transactions` - Public transactions

---

### Express x402 Server Endpoints

#### Direct Express Server URLs
- `POST https://server.r1xlabs.com/api/r1x-agent/chat` - AI Agent chat (with payment verification)
- `POST https://server.r1xlabs.com/api/x402/pay` - Payment processing (with payment verification)
- `GET https://server.r1xlabs.com/health` - Health check

#### Railway Domain (Alternative)
- `POST https://daring-analysis-production.up.railway.app/api/r1x-agent/chat`
- `POST https://daring-analysis-production.up.railway.app/api/x402/pay`
- `GET https://daring-analysis-production.up.railway.app/health`

---

## For x402scan Integration

**The x402 service endpoint to feature**:
- `POST https://www.r1xlabs.com/api/r1x-agent/chat`

**Service Details**:
- Service ID: `r1x-agent-chat`
- Service Name: `r1x Agent Chat`
- Price: `$0.25 USDC` per message
- Network: `base`
- Chain ID: `8453`
- Token: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC)
- **Counting**: 1 new user = unique wallet address, 1 paid message = 1 transaction

**Optional public endpoints** (for displaying stats):
- `GET https://www.r1xlabs.com/api/panel/public/services` - Service catalog
- `GET https://www.r1xlabs.com/api/panel/public/transactions` - Transaction history

---

## Environment Variables Reference

### Next.js Service (Railway)
- `NEXT_PUBLIC_BASE_URL=https://www.r1xlabs.com`
- `X402_SERVER_URL=https://server.r1xlabs.com` (server-side proxy only)
- `DATABASE_URL=postgresql://...` (from Railway PostgreSQL service)

### Express x402 Server (Railway)
- `MERCHANT_ADDRESS=0x0D644cFE30F0777CcCa6563618D9519D6b8979ac`
- `FACILITATOR_URL=https://facilitator.payai.network`
- `DATABASE_URL=postgresql://...` (same as Next.js, shared database)
- `ANTHROPIC_API_KEY=sk-ant-...`
- `CDP_API_KEY_ID=...`
- `CDP_API_KEY_SECRET=...`

---

## Quick Test Commands

### Test Next.js Service
```bash
# Health check
curl https://www.r1xlabs.com/api/health/db

# Public services
curl https://www.r1xlabs.com/api/panel/public/services

# Public transactions
curl https://www.r1xlabs.com/api/panel/public/transactions
```

### Test Express Server
```bash
# Health check
curl https://server.r1xlabs.com/health

# Or Railway domain
curl https://daring-analysis-production.up.railway.app/health
```

---

## Notes

- **Next.js routes** (`/api/*`) are publicly accessible and proxy to Express server
- **Express server** is for server-to-server communication (Next.js proxies to it)
- **Client-side code** should use Next.js API routes (`/api/*`) directly (same origin, no CORS)
- **x402scan** should use the public endpoints (`/api/panel/public/*`)

