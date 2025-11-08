# Environment Variables

## Required Variables

### Database
- `DATABASE_URL` - Neon PostgreSQL connection string (from Vercel dashboard)

### x402 Payment Configuration
- `MERCHANT_ADDRESS` - Your merchant wallet address on Base network (required)
- `FEE_RECIPIENT_ADDRESS` - r1x wallet address to receive platform fees (required)
- `PLATFORM_FEE_PERCENTAGE` - Platform fee percentage (default: 5, meaning 5%)
- `FACILITATOR_URL` - PayAI facilitator URL for EVM networks (default: https://facilitator.payai.network)
- `DAYDREAMS_FACILITATOR_URL` - Daydreams facilitator URL for Solana network (default: https://facilitator.daydreams.systems)
- `NETWORK` - Network identifier (set to `base` for Base mainnet, `solana` for Solana)
- `CDP_API_KEY_ID` - Coinbase Developer Platform API Key ID (required for Base mainnet)
- `CDP_API_KEY_SECRET` - Coinbase Developer Platform API Key Secret (required for Base mainnet)
- `PAYAI_FACILITATOR_ADDRESS` - PayAI facilitator contract address (optional, will be fetched if not provided)

### AI Agent
- `ANTHROPIC_API_KEY` - Anthropic API key for r1x Agent chat

### Application
- `NEXT_PUBLIC_BASE_URL` - Your production URL (e.g., https://r1x.vercel.app)

### Optional
- `SERVER_WALLET_PRIVATE_KEY` - Private key for server-side fee transfers (optional, for automatic fee collection)
- `SYNC_SECRET` - Secret token for protecting PayAI sync endpoint (optional)

## Setup Instructions

1. **Get Neon Database URL:**
   - Go to Vercel Dashboard → Storage → r1x-db
   - Copy the connection string
   - Set as `DATABASE_URL` in Vercel environment variables

2. **Get Coinbase Developer Platform (CDP) API Keys (Required for Base mainnet):**
   - Go to [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
   - Create a new API key
   - Copy the API Key ID and Secret
   - Set as `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET` in Vercel environment variables
   - **Important:** These are required for PayAI facilitator to work on Base mainnet

3. **Configure Wallet Addresses:**
   - Set `MERCHANT_ADDRESS` to your merchant wallet (Base network)
   - Set `FEE_RECIPIENT_ADDRESS` to your fee collection wallet (Base network)

4. **Set AI Agent API Key:**
   - Get your Anthropic API key from [Anthropic Console](https://console.anthropic.com/)
   - Set as `ANTHROPIC_API_KEY` in Vercel environment variables

5. **Run Database Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

6. **Sync PayAI Services:**
   ```bash
   # After deployment, call the sync endpoint
   curl -X POST https://your-domain.vercel.app/api/sync/payai
   ```

## Local Development

Create a `.env.local` file with:

```env
DATABASE_URL="postgresql://..."
MERCHANT_ADDRESS="0x..."
FEE_RECIPIENT_ADDRESS="0x..."
PLATFORM_FEE_PERCENTAGE=5
NETWORK=base
ANTHROPIC_API_KEY="sk-ant-..."
CDP_API_KEY_ID="your-cdp-api-key-id"
CDP_API_KEY_SECRET="your-cdp-api-key-secret"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
FACILITATOR_URL="https://facilitator.payai.network"
```

Then run:
```bash
npx prisma migrate dev
npx prisma generate
```

