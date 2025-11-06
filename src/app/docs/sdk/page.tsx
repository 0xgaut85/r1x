'use client';

import DocsPageHero from '@/components/docs/DocsPageHero';
import DocsSection from '@/components/docs/DocsSection';
import DocsNavigation from '@/components/docs/DocsNavigation';
import DocsCallout from '@/components/docs/DocsCallout';
import DocsCodeBlock from '@/components/docs/DocsCodeBlock';
import { FadeInUp } from '@/components/motion';

export const dynamic = 'force-dynamic';

export default function SDKDocsPage() {
  return (
    <>
      <DocsPageHero
        title="r1x SDK"
        description="Build AI agents that pay. Ship x402 services agents buy. The complete toolkit for the autonomous economy."
      />
      <DocsNavigation />

      <DocsSection>
        <FadeInUp>
          <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.28px',
          }}>
            Overview
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            The r1x SDK provides everything you need to build in the agent economy. Create agents that understand payments. Deploy services that agents buy. All with TypeScript type safety and one‑line integrations.
          </p>
        </FadeInUp>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-8" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Installation
        </h2>

        <DocsCodeBlock language="bash" titleColor="#FFFFFF">
{`npm install x402-sdk @reown/appkit wagmi viem
# or
pnpm add x402-sdk @reown/appkit wagmi viem`}
        </DocsCodeBlock>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Quick Start: Accept Payments
        </h2>

        <DocsCodeBlock language="typescript">
{`import { create402Response, verifyPayment } from 'x402-sdk';

export async function POST(request: Request) {
  const payment = request.headers.get('x-payment');
  
  if (!payment) {
    // Return 402 with quote
    return create402Response({
      amount: "1.00",
      merchant: process.env.MERCHANT_ADDRESS!,
      description: "Premium API access"
    });
  }
  
  // Verify payment
  const verified = await verifyPayment(payment);
  if (!verified) return new Response('Invalid payment', { status: 400 });
  
  // Return service
  return Response.json({ data: "Your premium content" });
}`}
        </DocsCodeBlock>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <DocsCallout variant="info" title="Coming Soon">
          The r1x SDK is in active development. Agent builder tools, payment abstractions, and discovery protocols shipping soon.
        </DocsCallout>
      </DocsSection>
    </>
  );
}

