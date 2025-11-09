# Railway Environment Variables - Build Time vs Runtime

## Next.js Environment Variable Types

### `NEXT_PUBLIC_*` Variables (Build-Time Required)
These variables are **embedded into the client bundle at build time**. They MUST be set in Railway BEFORE the build runs.

**Examples:**
- `NEXT_PUBLIC_PROJECT_ID` - Reown AppKit project ID
- `NEXT_PUBLIC_BASE_URL` - Base URL for the application
- `NEXT_PUBLIC_SOLANA_RPC_URL` - Solana RPC endpoint (optional)

**Why build-time?**
- Next.js replaces `process.env.NEXT_PUBLIC_*` with actual values during build
- The client bundle contains these values as literals
- If missing at build, the client bundle will have `undefined` values
- Setting them at runtime won't help - the bundle is already built

**Railway Setup:**
Railway automatically makes env vars available during build. Ensure these are set in Railway **before** deployment:

```bash
# Set via Railway CLI (before build)
railway variables set NEXT_PUBLIC_PROJECT_ID=your-project-id -e production -s r1x
railway variables set NEXT_PUBLIC_BASE_URL=https://r1xlabs.com -e production -s r1x
```

### Server-Only Variables (Runtime OK)
Variables without `NEXT_PUBLIC_` prefix are **only available server-side** and can be set at runtime.

**Examples:**
- `FACILITATOR_URL` - PayAI facilitator URL
- `CDP_API_KEY_ID` - PayAI CDP API key
- `MERCHANT_ADDRESS` - Merchant wallet address
- `DATABASE_URL` - Database connection string
- `ANTHROPIC_API_KEY` - Anthropic API key

**Why runtime OK?**
- These are never exposed to the client
- Only used in API routes and server components
- Railway sets them before the server starts

## Best Practices

### ✅ DO:
1. **Set `NEXT_PUBLIC_*` vars BEFORE build** - Railway does this automatically if vars are set
2. **Use server-only vars for secrets** - Never use `NEXT_PUBLIC_` for API keys or secrets
3. **Fail fast at build time** - If `NEXT_PUBLIC_*` vars are missing, the build should fail
4. **Document required vars** - List which vars are build-time vs runtime

### ❌ DON'T:
1. **Use placeholders for `NEXT_PUBLIC_*`** - The placeholder gets baked into the client bundle
2. **Set `NEXT_PUBLIC_*` at runtime** - It's too late, the bundle is already built
3. **Expose secrets via `NEXT_PUBLIC_*`** - They'll be visible in the client bundle
4. **Use hardcoded fallbacks** - Fail fast if Railway vars are missing

## Railway Build Process

Railway's build process:
1. Sets environment variables (from Railway dashboard/CLI)
2. Runs `npm run build` (Next.js build)
3. Next.js embeds `NEXT_PUBLIC_*` vars into client bundle
4. Deploys the built application
5. Server starts with all env vars available

**Key Point:** Railway env vars are available during step 1, so they're available during step 2 (build).

## Current Implementation

Our codebase follows these practices:
- ✅ `NEXT_PUBLIC_*` vars fail fast at build time if missing
- ✅ Server-only vars use Railway env vars only (no hardcoded fallbacks)
- ✅ No secrets exposed via `NEXT_PUBLIC_*`
- ✅ Clear error messages guide users to set vars in Railway

## Troubleshooting

**Build fails with "NEXT_PUBLIC_PROJECT_ID is required":**
- Set the variable in Railway BEFORE triggering a new build
- Use Railway CLI: `railway variables set NEXT_PUBLIC_PROJECT_ID=... -e production -s r1x`
- Or use Railway dashboard: Service → Variables → Add Variable

**Client bundle has wrong values:**
- Check Railway variables are set correctly
- Trigger a new build (Railway will use updated vars)
- Verify vars are prefixed with `NEXT_PUBLIC_` if needed client-side

**Server errors about missing env vars:**
- Set server-only vars in Railway (no `NEXT_PUBLIC_` prefix)
- These can be set anytime (before or after build)
- Server will use them on next restart


