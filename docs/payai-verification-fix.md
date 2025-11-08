# PayAI Verification Issue - Root Cause Analysis

## Problem Identified

From the error logs:
```
"merchant": "0x0d644cfe30f0777ccca6563618d9519d6b8979ac",
"payer": "0x0d644cfe30f0777ccca6563618d9519d6b8979ac"
```

**CRITICAL ISSUE**: Payer and merchant are the same address!

## Root Causes

1. **MERCHANT_ADDRESS Configuration Issue**
   - `MERCHANT_ADDRESS` in Vercel is set to the same address as the user's wallet
   - This causes all payments to be sent to the user themselves
   - PayAI facilitator rejects self-payments

2. **Transaction Recipient Issue**
   - The `to` field in payment proof shows: `0x0D644cFE30F0777CcCa6563618D9519D6b8979ac` (same as `from`)
   - This means the payment was actually sent to the user's own address
   - Should be sent to facilitator contract OR merchant address (different from payer)

3. **PayAI 500 Error**
   - PayAI returns 500 "Internal server error" because:
     - Transaction is a self-payment (invalid)
     - Or transaction doesn't exist in PayAI's records
     - Or transaction was sent to wrong address

## Fixes Applied

✅ Added validation to prevent payer == merchant
✅ Added validation before sending payment (prevents self-payment)
✅ Enhanced logging to show facilitator address, merchant address, and payer address
✅ Added transaction recipient validation

## What You Need to Do

### 1. Fix MERCHANT_ADDRESS in Vercel
- Go to Vercel → Settings → Environment Variables
- Check `MERCHANT_ADDRESS` value
- It should be a DIFFERENT wallet address from your user wallet
- This is the address that receives payments (your merchant wallet)

### 2. Check Facilitator Address
- Verify `PAYAI_FACILITATOR_ADDRESS` is set correctly
- Or verify it's being fetched from `/config` endpoint
- Payments should go to facilitator if facilitator address exists

### 3. Test Again
- Use a different wallet address for `MERCHANT_ADDRESS`
- Make sure facilitator address is configured
- Try payment again

## Expected Flow

**Correct Flow:**
1. User wallet: `0xUser...`
2. Merchant wallet: `0xMerchant...` (different from user)
3. Facilitator contract: `0xFacilitator...` (if using facilitator)
4. Payment sent to: `0xFacilitator...` OR `0xMerchant...` (NOT `0xUser...`)
5. Verification: `payer` = `0xUser...`, `merchant` = `0xMerchant...` (different!)

**Current (Broken) Flow:**
1. User wallet: `0x0d644cfe30f0777ccca6563618d9519d6b8979ac`
2. Merchant wallet: `0x0d644cfe30f0777ccca6563618d9519d6b8979ac` (SAME!)
3. Payment sent to: `0x0d644cfe30f0777ccca6563618d9519d6b8979ac` (SELF!)
4. Verification: `payer` = `merchant` = same address ❌

## Next Steps

1. **Create a separate merchant wallet** (if you don't have one)
2. **Set `MERCHANT_ADDRESS` in Vercel** to that merchant wallet address
3. **Verify facilitator address** is configured or being fetched
4. **Test payment flow** again with the correct merchant address

The code now has validation to prevent this issue and will show clear error messages if detected.

