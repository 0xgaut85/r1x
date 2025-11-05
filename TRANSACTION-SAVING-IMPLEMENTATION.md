# Transaction Saving Implementation

## Overview

Transactions are now automatically saved to the database when payments are verified by the PayAI middleware in the Express x402 server.

## How It Works

### Payment Flow with Transaction Saving

1. **User sends message** → Client calls `/api/r1x-agent/chat`
2. **x402-fetch handles payment** → Automatically signs and sends USDC transaction
3. **Express server receives request** → PayAI middleware verifies payment
4. **Payment verified** → Middleware passes request to route handler
5. **Transaction saved** → `saveTransaction()` is called asynchronously
6. **AI response sent** → Anthropic API generates response

### Transaction Saving Logic

**File**: `x402-server/save-transaction.ts`

The module:
- Parses payment proof from `X-Payment` header
- Creates or updates service record (`r1x-agent-chat`)
- Creates transaction record with status `verified`
- Creates fee record (if `FEE_RECIPIENT_ADDRESS` is configured)
- Handles duplicate transactions gracefully

**Features**:
- ✅ Non-blocking: Doesn't delay AI response
- ✅ Error handling: Logs errors but doesn't break payment flow
- ✅ Duplicate prevention: Checks if transaction already exists
- ✅ Service auto-creation: Creates service record if it doesn't exist

## Database Schema

Transactions are saved with:
- `transactionHash` - Unique on-chain transaction hash
- `from` - Payer wallet address (lowercased)
- `to` - Recipient address (merchant or facilitator)
- `amount` - Payment amount in wei
- `status` - `verified` (payment verified by middleware)
- `serviceId` - Links to service record (`r1x-agent-chat`)
- `feeAmount` - Platform fee amount
- `merchantAmount` - Amount to merchant after fee

## Answer: 1 Message = 1 User + 1 Transaction?

**Yes!** Now with transaction saving:

- ✅ **1 paid message = 1 transaction record** (status: `verified`)
- ✅ **Each unique `from` address = 1 user**
- ✅ **User panel shows all transactions** (including pending, verified, settled)
- ✅ **Statistics count unique users** (from `from` addresses)

## What's Needed for x402scan

### Public API Endpoints (Already Implemented)

1. **Service Catalog**
   ```
   GET /api/panel/public/services
   ```
   Returns all available services with purchase counts

2. **Transaction History**
   ```
   GET /api/panel/public/transactions
   ```
   Returns verified/settled transactions

### To Be Featured on x402scan

1. **Ensure DATABASE_URL is set** in Express server Railway service
2. **Transactions will auto-save** when payments are verified
3. **Share your public API endpoints** with x402scan team
4. **Service will appear** with transaction counts and volume

## Configuration

### Express Server Environment Variables

**Required**:
- `DATABASE_URL` - PostgreSQL connection string (same as Next.js service)
- `MERCHANT_ADDRESS` - Your merchant wallet address

**Optional**:
- `FEE_RECIPIENT_ADDRESS` - Fee wallet address (creates fee records)
- `PLATFORM_FEE_PERCENTAGE` - Fee percentage (default: 5)

### Railway Setup

1. **Express service** should have `DATABASE_URL` environment variable
2. Railway will auto-share `DATABASE_URL` from PostgreSQL service
3. Or manually add `DATABASE_URL` to Express service variables

## Testing

After deployment, verify transactions are being saved:

1. **Send a message** in r1x Agent
2. **Complete payment** (sign transaction in wallet)
3. **Check user panel** - Transaction should appear immediately
4. **Check database** - Query `Transaction` table
5. **Check logs** - Look for `[Save Transaction]` messages

## Logs to Watch

**Success**:
```
[x402-server] X-Payment header present, saving transaction...
[Save Transaction] Created transaction: <id>
[Save Transaction] Transaction saved successfully
```

**If DATABASE_URL not set**:
```
[Save Transaction] DATABASE_URL not set, transaction saving disabled
[x402-server] Transaction saving disabled (DATABASE_URL not set)
```

**Errors** (non-blocking):
```
[Save Transaction] Error saving transaction: <error>
```

## Next Steps

1. ✅ **Deploy to Railway** - Transactions will auto-save
2. ✅ **Verify DATABASE_URL** is set in Express service
3. ✅ **Test transaction saving** - Send a message and check user panel
4. ✅ **Share API endpoints** with x402scan for featuring

## Architecture

```
User → Browser (x402-fetch)
  ↓
Next.js API (/api/r1x-agent/chat)
  ↓
Express Server (x402-server)
  ↓
PayAI Middleware (verifies payment)
  ↓
Route Handler (saves transaction + calls Anthropic)
  ↓
Database (PostgreSQL) ← Transaction saved here
```

