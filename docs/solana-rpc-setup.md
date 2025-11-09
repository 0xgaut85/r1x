# Solana RPC Provider Setup

## QuickNode Configuration (Recommended)

### 1. Create QuickNode Account
1. Go to [QuickNode](https://www.quicknode.com/)
2. Sign up and create a new endpoint
3. Select **Solana** → **Mainnet Beta** (for production)
4. Copy your endpoint URL

### 2. QuickNode RPC URL Format
```
https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR-API-KEY/
```

Example:
```
https://solana-mainnet.quiknode.com/abc123def456/
```

### 3. Set Environment Variable
In Railway (or your deployment platform), set:
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR-API-KEY/
```

**Important:** 
- Select **Mainnet Beta** (not Devnet or Testnet) for production
- Mainnet Beta uses real SOL and USDC
- Devnet is for testing only (fake tokens)

---

## Alternative RPC Providers

### Alchemy
1. Go to [Alchemy](https://www.alchemy.com/)
2. Create Solana app → Mainnet
3. Copy RPC URL:
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR-API-KEY
```

### Helius
1. Go to [Helius](https://www.helius.dev/)
2. Create API key → Mainnet
3. Copy RPC URL:
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR-API-KEY
```
**Note:** Requires domain allowlisting in Helius dashboard

### Triton One
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://YOUR-ENDPOINT.rpcpool.com/YOUR-API-KEY
```

---

## Network Selection Guide

- **Mainnet Beta** ✅ - Use for production (real USDC, real SOL)
- **Devnet** ❌ - Only for testing (fake tokens, resets frequently)
- **Testnet** ❌ - For Solana core testing (not for apps)

Since r1x handles real payments, always use **Mainnet Beta**.

---

## QuickNode Setup Steps

1. **Sign up at QuickNode**
   - Visit https://www.quicknode.com/
   - Create account

2. **Create Solana Endpoint**
   - Dashboard → "Create Endpoint"
   - Blockchain: **Solana**
   - Network: **Mainnet Beta** ⚠️ (NOT Devnet!)
   - Plan: Choose based on your needs (free tier available)

3. **Copy Endpoint URL**
   - Your endpoint URL will look like:
   - `https://solana-mainnet.quiknode.com/abc123def456/`
   - Or: `https://YOUR-NAME.solana-mainnet.quiknode.pro/YOUR-API-KEY/`

4. **Set in Railway**
   - Go to Railway → Your Next.js service → Variables
   - Add: `NEXT_PUBLIC_SOLANA_RPC_URL` = your QuickNode URL
   - Redeploy the service

5. **Verify**
   - Check browser console - should see `[SolanaPaymentClient] Using RPC: https://...`
   - No more "Endpoint URL must start with http/https" errors
   - No domain allowlisting needed (unlike Helius)

---

## Why QuickNode?

✅ **No domain allowlisting** (unlike Helius)  
✅ **Reliable performance**  
✅ **Good free tier**  
✅ **Easy setup**  
✅ **Works from browser** (no CORS issues)


