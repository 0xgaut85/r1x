'use client';

import DocsSection from '@/components/docs/DocsSection';
import DocsCallout from '@/components/docs/DocsCallout';
import DocsCodeBlock from '@/components/docs/DocsCodeBlock';
import DocsPageHero from '@/components/docs/DocsPageHero';
import { FadeInUp } from '@/components/motion';

export const dynamic = 'force-dynamic';

export default function GettingStartedPage() {
  return (
    <>
      <DocsPageHero 
        title="Getting Started"
        description="Set up your r1x development environment and start building on the machine economy."
      />

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Prerequisites
        </h2>
        <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          Before you begin, ensure you have:
        </p>
        <ul className="space-y-3 mb-8" style={{ listStyle: 'none', paddingLeft: '0' }}>
          {[
            'Node.js 20.9.0 or higher',
            'npm 10.0.0 or higher',
            'A Base network wallet (MetaMask recommended)',
            'USDC on Base mainnet for testing',
            'A Coinbase Developer Platform account (for PayAI facilitator)',
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-[#FF4D00] mt-2 flex-shrink-0" />
              <span className="text-gray-700 text-base sm:text-lg" style={{
                fontFamily: 'BaselGrotesk-Regular, sans-serif',
                lineHeight: '1.6',
              }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
          color: '#FFFFFF',
        }}>
          Environment Setup
        </h2>
        <p className="text-white/85 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          Create a <code style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '14px', color: '#FFFFFF' }}>.env.local</code> file in your project root with the following variables:
        </p>

        <DocsCodeBlock language="env" title="Environment Variables" titleColor="#FFFFFF">
{`DATABASE_URL="postgresql://..."
MERCHANT_ADDRESS="0x..."
FEE_RECIPIENT_ADDRESS="0x..."
PLATFORM_FEE_PERCENTAGE=5
NETWORK=base
ANTHROPIC_API_KEY="sk-ant-..."
CDP_API_KEY_ID="your-cdp-api-key-id"
CDP_API_KEY_SECRET="your-cdp-api-key-secret"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
FACILITATOR_URL="https://facilitator.payai.network"`}
        </DocsCodeBlock>

        <DocsCallout variant="info" title="PayAI Configuration">
          For Base mainnet, PayAI facilitator requires Coinbase Developer Platform (CDP) API keys for authentication. 
          Get your keys from{' '}
          <a href="https://portal.cdp.coinbase.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#FF4D00', textDecoration: 'underline' }}>
            portal.cdp.coinbase.com
          </a>
          {' '}and set them as CDP_API_KEY_ID and CDP_API_KEY_SECRET.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Database Setup
        </h2>
        <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          r1x uses Prisma with PostgreSQL. Set up your database:
        </p>

        <DocsCodeBlock language="bash" title="Database Commands" titleColor="#000000">
{`# Generate Prisma client
npx prisma generate

# Run migrations (development)
npx prisma migrate dev

# Run migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (optional)
npx prisma studio`}
        </DocsCodeBlock>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
          color: '#FFFFFF',
        }}>
          Installation
        </h2>
        <p className="text-white/85 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          Install dependencies and start the development server:
        </p>

        <DocsCodeBlock language="bash" title="Installation" titleColor="#FFFFFF">
{`# Install dependencies
npm install

# Start development server
npm run dev

# Start x402 Express server (separate terminal)
npm run dev:x402

# Start both servers concurrently
npm run dev:all`}
        </DocsCodeBlock>

        <DocsCallout variant="note" title="Express Server">
          The x402 Express server runs separately on Railway and handles payment middleware. 
          Configure NEXT_PUBLIC_X402_SERVER_URL to point to your Railway deployment.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Sync PayAI Services
        </h2>
        <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          After deployment, sync services from PayAI facilitator:
        </p>

        <DocsCodeBlock language="bash" title="Sync Services" titleColor="#000000">
{`# Trigger PayAI service sync
curl -X POST https://your-domain.vercel.app/api/sync/payai

# Or with authentication (if SYNC_SECRET is set)
curl -X POST https://your-domain.vercel.app/api/sync/payai \\
  -H "Authorization: Bearer YOUR_SYNC_SECRET"`}
        </DocsCodeBlock>

        <DocsCallout variant="success" title="Ready to Build">
          You're all set! Visit{' '}
          <a href="/docs/utilities" style={{ color: '#FF4D00', textDecoration: 'underline' }}>
            Utilities
          </a>
          {' '}to learn about available tools and{' '}
          <a href="/docs/tutorials" style={{ color: '#FF4D00', textDecoration: 'underline' }}>
            Tutorials
          </a>
          {' '}for step-by-step guides.
        </DocsCallout>
      </DocsSection>
    </>
  );
}

