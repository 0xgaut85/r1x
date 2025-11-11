# syntax=docker/dockerfile:1.6
# Use Node.js 20 LTS
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json package-lock.json* ./

# Copy Prisma schema before installing (needed for postinstall script)
COPY prisma ./prisma/

# Install dependencies with optimizations
# Use --prefer-offline and --no-audit for faster installs
# npm ci installs devDependencies by default
# postinstall script will run prisma generate automatically
RUN npm ci --prefer-offline --no-audit --progress=false

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copy package files to ensure scripts are available
COPY package.json package-lock.json* ./

# Copy only necessary source files (explicitly list what's needed)
COPY src ./src
COPY public ./public
COPY next.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./
COPY prisma ./prisma
COPY scripts ./scripts
# Remove unnecessary files before build
RUN rm -rf .next node_modules/.cache x402-server

# NEXT_PUBLIC_* variables - HARDCODED VALUES (embedded at build time)
# These are required at build time for Next.js to embed them in the client bundle
# All values are hardcoded here - Railway can override via build args if needed
ARG NEXT_PUBLIC_PROJECT_ID=ac7a5e22564f2698c80f05dbf4811d6a
ARG NEXT_PUBLIC_BASE_URL=https://r1xlabs.com
ARG NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=0d1fd9dd-c8db-4e20-b550-6dbf601f65cc
ARG NEXT_PUBLIC_X402_SERVER_URL=https://server.r1xlabs.com
ARG NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE=10
ARG NEXT_PUBLIC_APIFLASH_ACCESS_KEY=622465fef52c4978a2a46763e5ed3c2e
ARG NEXT_PUBLIC_LOGOKIT_API_KEY=pk_fr8612cc333de53ac8f39b

# Set as environment variables for Next.js build
ENV NEXT_PUBLIC_PROJECT_ID=${NEXT_PUBLIC_PROJECT_ID}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_SOLANA_RPC_URL=${NEXT_PUBLIC_SOLANA_RPC_URL}
ENV NEXT_PUBLIC_X402_SERVER_URL=${NEXT_PUBLIC_X402_SERVER_URL}
ENV NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE=${NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE}
ENV NEXT_PUBLIC_APIFLASH_ACCESS_KEY=${NEXT_PUBLIC_APIFLASH_ACCESS_KEY}
ENV NEXT_PUBLIC_LOGOKIT_API_KEY=${NEXT_PUBLIC_LOGOKIT_API_KEY}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma Client before building (ensures types are available for TypeScript)
# Note: Also runs in npm run build, but explicit here for clarity
RUN npx prisma generate

# Build Next.js with optimizations
# Use npm run build to ensure build script runs (which includes prisma generate as safety net)
RUN NEXT_TELEMETRY_DISABLED=1 npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install Prisma CLI globally for migrations (needed in standalone mode)
RUN npm install -g prisma@latest

# Copy necessary files
# With transpilePackages, Next.js bundles everything into .next/standalone
# No need to copy node_modules - reduces image size and build time
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

RUN chown -R nextjs:nodejs /app
RUN chmod +x scripts/start.sh

USER nextjs

# Railway sets PORT dynamically - don't hardcode it
# EXPOSE is just documentation, Railway uses the PORT env var
EXPOSE 8080

# Railway will set PORT automatically - don't override it
# HOSTNAME must be 0.0.0.0 to accept connections from Railway
ENV HOSTNAME="0.0.0.0"

# Use start script that runs migrations before starting
CMD ["sh", "scripts/start.sh"]
