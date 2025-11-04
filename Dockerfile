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
RUN npm ci --prefer-offline --no-audit

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copy package files to ensure scripts are available
COPY package.json package-lock.json* ./

# Copy source files (exclude unnecessary files)
COPY . .
# Remove unnecessary files before build
RUN rm -rf .next node_modules/.cache

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js with optimizations
# Use npx to ensure next command is found, or use npm run build
RUN NEXT_TELEMETRY_DISABLED=1 npx next build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
