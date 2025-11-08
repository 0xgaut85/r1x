# Railway Environment Variables Checklist

## ✅ Required Variables (Both Services)

### Build-Time Variables (`NEXT_PUBLIC_*` - Must be set BEFORE build)

These are embedded into the client bundle at build time. Railway makes them available during build automatically.

#### r1x (Next.js) Service:
- ✅ `NEXT_PUBLIC_PROJECT_ID` - Reown AppKit project ID
- ✅ `NEXT_PUBLIC_BASE_URL` - Base URL (https://r1xlabs.com)
- ✅ `NEXT_PUBLIC_SOLANA_RPC_URL` - Solana RPC endpoint
- ✅ `NEXT_PUBLIC_X402_SERVER_URL` - x402 server URL
- ✅ `NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE` - Platform fee (10)

### Runtime Variables (Server-only - Available when server starts)

#### r1x (Next.js) Service:
- ✅ `FACILITATOR_URL` - PayAI facilitator URL
- ✅ `ENABLE_PAYAI_FACILITATOR` - Enable PayAI facilitator (true)
- ✅ `MERCHANT_ADDRESS` - Merchant wallet address
- ✅ `CDP_API_KEY_ID` - PayAI CDP API key ID
- ✅ `CDP_API_KEY_SECRET` - PayAI CDP API key secret
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `ANTHROPIC_API_KEY` - Anthropic API key
- ✅ `PLATFORM_FEE_PERCENTAGE` - Platform fee percentage (10)
- ✅ `FEE_RECIPIENT_ADDRESS` - Fee recipient wallet
- ✅ `SOLANA_FEE_RECIPIENT_ADDRESS` - Solana fee recipient
- ✅ `SOLANA_RPC_URL` - Solana RPC URL
- ✅ `DAYDREAMS_FACILITATOR_URL` - Daydreams facilitator URL
- ✅ `SERVER_WALLET_PRIVATE_KEY` - Server wallet private key
- ✅ `NETWORK` - Network (base)
- ✅ `NODE_VERSION` - Node.js version (20)

#### r1x-server (Express) Service:
- ✅ `FACILITATOR_URL` - PayAI facilitator URL
- ✅ `ENABLE_PAYAI_FACILITATOR` - Enable PayAI facilitator (true)
- ✅ `MERCHANT_ADDRESS` - Merchant wallet address
- ✅ `CDP_API_KEY_ID` - PayAI CDP API key ID
- ✅ `CDP_API_KEY_SECRET` - PayAI CDP API key secret
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `ANTHROPIC_API_KEY` - Anthropic API key
- ✅ `X402_SERVER_URL` - x402 server URL
- ✅ `NEXT_PUBLIC_BASE_URL` - Base URL (for logo/favicon endpoints)
- ✅ `PLATFORM_FEE_PERCENTAGE` - Platform fee percentage
- ✅ `NETWORK` - Network (base)
- ✅ `NODE_VERSION` - Node.js version (20)

## Verification

All variables listed above are currently set in Railway and will be:
- **Build-time vars**: Available during `npm run build` (Railway sets them before build)
- **Runtime vars**: Available when server starts

## How Railway Handles This

1. **Railway sets all env vars** (from dashboard/CLI) before build
2. **Next.js build runs** - `NEXT_PUBLIC_*` vars are embedded into client bundle
3. **Build completes** - Client bundle has correct values
4. **Server starts** - All env vars (build-time + runtime) are available

## Current Status

✅ All required variables are set in Railway
✅ Build-time vars will be available during build
✅ Runtime vars will be available when server starts
✅ No hardcoded fallbacks in code (fail-fast approach)

