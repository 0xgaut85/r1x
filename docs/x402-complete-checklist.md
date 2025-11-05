# x402 Payment Integration - Complete Checklist

## ✅ What's Already Done

1. **x402 Protocol Implementation**
   - ✅ HTTP 402 Payment Required responses
   - ✅ Payment quote generation
   - ✅ Payment proof parsing (X-PAYMENT header and body)
   - ✅ Payment verification flow
   - ✅ Fee calculation and distribution

2. **PayAI Facilitator Integration**
   - ✅ PayAI facilitator API integration (`/verify`, `/settle`)
   - ✅ CDP API key authentication for Base mainnet
   - ✅ Facilitator address fetching and inclusion in quotes
   - ✅ Payment routing through facilitator contract

3. **Database Integration**
   - ✅ Prisma schema for services, transactions, fees
   - ✅ Transaction tracking and status management
   - ✅ PayAI service sync from `/list` endpoint

4. **Frontend Integration**
   - ✅ Wallet connection (Reown AppKit)
   - ✅ USDC transfer functionality
   - ✅ Payment modal with transaction flow
   - ✅ Payment verification and retry logic

5. **API Endpoints**
   - ✅ `/api/r1x-agent/chat` - AI agent with x402 payments
   - ✅ `/api/x402/pay` - Payment processing
   - ✅ `/api/x402/verify` - Payment verification
   - ✅ `/api/marketplace/services` - Service listing

## 🔧 Required Environment Variables (Vercel)

### Critical (Must Have)
- `MERCHANT_ADDRESS` - Your merchant wallet (Base network)
- `FEE_RECIPIENT_ADDRESS` - r1x fee wallet (Base network)
- `CDP_API_KEY_ID` - Coinbase Developer Platform API Key ID
- `CDP_API_KEY_SECRET` - Coinbase Developer Platform API Key Secret
- `DATABASE_URL` - Neon PostgreSQL connection string
- `ANTHROPIC_API_KEY` - For r1x Agent chat

### Recommended
- `NETWORK=base` - Network identifier
- `FACILITATOR_URL=https://facilitator.payai.network` - PayAI facilitator URL
- `PAYAI_FACILITATOR_ADDRESS` - Facilitator contract address (auto-fetched if not set)
- `PLATFORM_FEE_PERCENTAGE=5` - Platform fee percentage

## 🚨 Critical Issues to Fix

### 1. Payment Proof Must Use Actual Transaction Data
**Status:** ✅ Fixed - Now uses actual transaction hash and receipt data

**Issue:** Payment proof was using quote data instead of actual blockchain transaction data.

**Fix:** Payment proof now uses:
- Actual transaction hash from blockchain
- Actual block number from receipt
- Actual recipient (facilitator or merchant) from quote
- Actual amount from quote (includes fees)

### 2. PayAI Verification Must Match Actual Transaction
**Status:** ✅ Fixed - Verification uses merchant address correctly

**Issue:** PayAI verification request needs:
- `merchant` = Your actual merchant address (NOT facilitator address)
- `payer` = User's wallet address
- `amount` = Amount that was actually transferred
- `transactionHash` = Actual transaction hash

**Fix:** Verification request correctly uses merchant address from service, not facilitator address.

### 3. Facilitator Address Must Be Correct
**Status:** ⚠️ Check Required - Verify facilitator address is correct

**Issue:** If facilitator address is wrong, payments won't be routed correctly.

**How to Check:**
1. Check PayAI docs for Base mainnet facilitator contract address
2. Or set `PAYAI_FACILITATOR_ADDRESS` in Vercel env vars
3. Or check `/config` endpoint response

## 📋 Testing Checklist

### Before Going Live
- [ ] All environment variables set in Vercel
- [ ] CDP API keys are valid and have correct permissions
- [ ] `MERCHANT_ADDRESS` has sufficient USDC balance
- [ ] Database migrations deployed (`npx prisma migrate deploy`)
- [ ] PayAI services synced (`POST /api/sync/payai`)

### Test Payment Flow
1. [ ] Connect wallet on Base network
2. [ ] Try to send message in r1x Agent
3. [ ] Verify 402 response with payment quote
4. [ ] Verify facilitator address is in quote (if using facilitator)
5. [ ] Approve and send USDC payment
6. [ ] Verify transaction is confirmed
7. [ ] Verify payment proof is sent with X-PAYMENT header
8. [ ] Verify PayAI facilitator verifies payment successfully
9. [ ] Verify chat response is received
10. [ ] Check Vercel logs for `[PayAI]` messages
11. [ ] Verify transaction appears in database
12. [ ] Verify fee record is created

### Check Vercel Logs
Look for these log messages:
- `[PayAI] Using CDP API key authentication` ✅
- `[PayAI] Verify request:` (should show correct merchant address)
- `[PayAI] Verify response status: 200` ✅
- `[PayAI] Verification successful:` ✅

If you see errors:
- `[PayAI] No CDP API keys found` → Set CDP_API_KEY_ID and CDP_API_KEY_SECRET
- `[PayAI] Verification failed:` → Check the error reason
- `HTTP 401` → CDP API keys are invalid
- `HTTP 403` → CDP API keys don't have correct permissions

## 🔍 Debugging Tips

### Payment Verification Fails
1. Check Vercel logs for `[PayAI]` messages
2. Verify CDP API keys are correct
3. Verify merchant address matches PayAI registration
4. Verify transaction hash is correct
5. Verify amount matches quote amount
6. Check if PayAI facilitator has indexed the transaction (wait 2-3 seconds)

### Payment Goes Through But Verification Fails
1. Check if payment was sent to facilitator or merchant
2. Verify facilitator address is correct in quote
3. Check PayAI docs for correct verification format
4. Verify transaction is confirmed on Base network

### No Facilitator Address in Quote
1. Check `PAYAI_FACILITATOR_ADDRESS` env var
2. Check `/config` endpoint response
3. Check PayAI docs for Base mainnet facilitator address

## 📚 Resources
- PayAI Docs: https://docs.payai.network
- x402 Spec: https://x402.payai.network
- Base Network: https://base.org
- Vercel Logs: https://vercel.com/dashboard → Your Project → Logs

## 🎯 Next Steps
1. Set all required environment variables in Vercel
2. Test payment flow end-to-end
3. Check Vercel logs for any errors
4. Verify transactions appear on x402scan (if applicable)
5. Monitor for any PayAI API errors

