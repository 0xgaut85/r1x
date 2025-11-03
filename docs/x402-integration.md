# x402 Micropayments Integration

This document outlines the x402 micropayments integration for r1x, enabling pay-per-use access to services through the PayAI facilitator on Base network.

## Overview

r1x acts as a merchant intermediary in the x402 ecosystem, facilitating payments between users and service providers. We collect a platform fee (in USDC) for all transactions processed through our infrastructure.

## Architecture

### Payment Flow

1. **User Request**: User requests access to a paid service (via marketplace or agent)
2. **402 Response**: Server responds with HTTP 402 Payment Required and a payment quote
3. **Wallet Payment**: User approves payment in their wallet (Base network, USDC)
4. **Payment Verification**: Transaction is verified via PayAI facilitator
5. **Settlement**: Payment is settled and fees are distributed
6. **Service Access**: User gains access to the requested service

### Components

- **Merchant Server** (`/api/x402/pay`): Handles payment requests and returns 402 quotes
- **Verification Endpoint** (`/api/x402/verify`): Verifies payments via PayAI facilitator
- **Marketplace API** (`/api/marketplace/services`): Lists available x402 services
- **Wallet Integration** (`src/lib/wallet.ts`): Handles wallet connection and USDC transfers
- **Payment Modal** (`src/components/PaymentModal.tsx`): UI for payment flow

## Configuration

### Environment Variables

Create a `.env.local` file with the following:

```env
MERCHANT_ADDRESS=0x... # Your merchant wallet address
FEE_RECIPIENT_ADDRESS=0x... # r1x wallet address for fee collection
PLATFORM_FEE_PERCENTAGE=5 # Fee percentage (e.g., 5 for 5%)
ANTHROPIC_API_KEY=... # For r1x Agent
```

### Network Configuration

- **Network**: Base (Chain ID: 8453)
- **Token**: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **Facilitator**: PayAI (`https://facilitator.payai.network`)

## API Endpoints

### POST /api/x402/pay

Request payment quote or process payment proof.

**Request:**
```json
{
  "serviceId": "api-claude-sonnet",
  "amount": "0.01",
  "proof": { ... } // Optional, if retrying with payment
}
```

**Response (402 Payment Required):**
```json
{
  "error": "Payment Required",
  "quote": {
    "amount": "1000000",
    "token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "merchant": "0x...",
    "deadline": 1234567890,
    "nonce": "unique-nonce",
    "chainId": 8453
  }
}
```

**Response (200 Success):**
```json
{
  "success": true,
  "payment": {
    "transactionHash": "0x...",
    "amount": "1000000",
    "fee": "50000",
    "merchantAmount": "950000"
  },
  "data": { ... } // Service fulfillment data
}
```

### POST /api/x402/verify

Verify payment proof with PayAI facilitator.

**Request:**
```json
{
  "proof": {
    "transactionHash": "0x...",
    "blockNumber": 12345,
    "from": "0x...",
    "to": "0x...",
    "amount": "1000000",
    "token": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "timestamp": 1234567890
  },
  "settle": true // Optional, to also settle the payment
}
```

**Response:**
```json
{
  "verified": true,
  "settled": true,
  "payment": {
    "transactionHash": "0x...",
    "settlementHash": "0x...",
    "amount": "1000000",
    "fee": "50000",
    "merchantAmount": "950000"
  }
}
```

### GET /api/marketplace/services

List available marketplace services.

**Query Parameters:**
- `category`: Filter by category (optional)
- `merchant`: Filter by merchant address (optional)

**Response:**
```json
{
  "services": [
    {
      "id": "api-claude-sonnet",
      "name": "Claude Sonnet API",
      "description": "Access to Anthropic Claude Sonnet model",
      "price": "0.01",
      "merchant": "0x...",
      "category": "AI Inference",
      "endpoint": "/api/ai/claude",
      "available": true
    }
  ],
  "total": 1
}
```

## Fee Structure

### Fee Calculation

- Platform fee is calculated as a percentage of the total payment amount
- Fee is transferred to `FEE_RECIPIENT_ADDRESS`
- Remaining amount is transferred to the merchant

Example:
- Payment: 1.0 USDC
- Fee: 5% = 0.05 USDC
- Merchant receives: 0.95 USDC

## Wallet Integration

### Connecting Wallet

```typescript
import { connectWallet } from '@/lib/wallet';

const wallet = await connectWallet();
// Automatically switches to Base network if needed
```

### Transferring USDC

```typescript
import { transferUSDC } from '@/lib/wallet';

const txHash = await transferUSDC(wallet, recipientAddress, amount);
```

## Frontend Integration

### Marketplace Page

The marketplace page (`/marketplace`) displays available services and handles the purchase flow:

1. User clicks "Purchase" on a service
2. Payment quote is requested from `/api/x402/pay`
3. Payment modal opens with quote details
4. User connects wallet and approves payment
5. Payment is verified and service access is granted

### Payment Modal

The `PaymentModal` component handles the complete payment flow:

- Wallet connection
- Payment approval
- Transaction signing
- Payment verification
- Success/failure handling

## Testing

### Testnet Setup

For testing, use Base Sepolia testnet:
- Chain ID: 84532
- USDC Testnet: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### Test Flow

1. Deploy test merchant contract
2. Configure environment variables for testnet
3. Test payment flow with test USDC
4. Verify payments are processed correctly
5. Check fee distribution

## Production Checklist

- [ ] Set `MERCHANT_ADDRESS` to production wallet
- [ ] Set `FEE_RECIPIENT_ADDRESS` to r1x treasury wallet
- [ ] Configure `PLATFORM_FEE_PERCENTAGE`
- [ ] Verify PayAI facilitator endpoint is accessible
- [ ] Test payment flow end-to-end
- [ ] Implement transaction logging and monitoring
- [ ] Set up alerts for failed payments
- [ ] Configure wallet key management (hardware wallet recommended)
- [ ] Review and test fee distribution logic
- [ ] Document API endpoints for service providers

## Future Enhancements

- Multi-token support (beyond USDC)
- Recurring payments/subscriptions
- Payment scheduling for autonomous agents
- Analytics dashboard for transaction tracking
- Admin panel for service management
- Service provider onboarding flow

## Support

For issues or questions regarding the x402 integration:
- Check PayAI facilitator documentation
- Review Base network transaction logs
- Verify wallet connectivity and network configuration

