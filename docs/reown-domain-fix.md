# Fix Reown Domain Allowlist Error

## Error Message
```
The origin https://r1x-production.up.railway.app is not in your allow list. 
Please update your allowed domains at https://dashboard.reown.com. 
[PID: ac7a5e22564f2698c80f05dbf4811d6a]
```

## Problem
Reown (WalletConnect) requires you to whitelist domains that can use your WalletConnect project. The Railway deployment domain needs to be added.

## Solution

1. **Go to Reown Dashboard:**
   - Visit: https://dashboard.reown.com
   - Sign in with your account

2. **Find Your Project:**
   - Project ID: `ac7a5e22564f2698c80f05dbf4811d6a`
   - Or search for "r1x" project

3. **Add Allowed Domains:**
   - Go to Project Settings → Allowed Domains
   - Add these domains:
     - `https://r1x-production.up.railway.app` (Railway deployment)
     - `https://r1xlabs.com` (Production domain)
     - `https://www.r1xlabs.com` (Production domain with www)
     - `http://localhost:3000` (For local development)
     - `http://127.0.0.1:3000` (For local development)

4. **Save Changes:**
   - Click "Save" or "Update"
   - Changes take effect immediately (no redeploy needed)

## After Adding Domains

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. **Test wallet connection** - Should work without errors
3. **Test agent** - Should no longer hang on loading

## Why This Happens

Reown/WalletConnect uses domain allowlisting for security. This prevents unauthorized websites from using your WalletConnect project ID.

## Related Errors

If you see these errors, it's the same issue:
- `APKT002` error code
- `403 Forbidden` on `pulse.walletconnect.org`
- Wallet modal not opening
- Infinite loading when trying to connect wallet

