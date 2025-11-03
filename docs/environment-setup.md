# Environment Variables

## Required Variables

### Database
- `DATABASE_URL` - Neon PostgreSQL connection string (from Vercel dashboard)

### x402 Payment Configuration
- `MERCHANT_ADDRESS` - Your merchant wallet address on Base network
- `FEE_RECIPIENT_ADDRESS` - r1x wallet address to receive platform fees
- `PLATFORM_FEE_PERCENTAGE` - Platform fee percentage (default: 5, meaning 5%)
- `FACILITATOR_URL` - PayAI facilitator URL (default: https://facilitator.payai.network)

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

2. **Configure Wallet Addresses:**
   - Set `MERCHANT_ADDRESS` to your merchant wallet
   - Set `FEE_RECIPIENT_ADDRESS` to your fee collection wallet

3. **Run Database Migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Sync PayAI Services:**
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
ANTHROPIC_API_KEY="sk-ant-..."
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
FACILITATOR_URL="https://facilitator.payai.network"
```

Then run:
```bash
npx prisma migrate dev
npx prisma generate
```

