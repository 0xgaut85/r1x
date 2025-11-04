'use client';

import DocsSection from '@/components/docs/DocsSection';
import DocsCallout from '@/components/docs/DocsCallout';
import DocsCodeBlock from '@/components/docs/DocsCodeBlock';
import { FadeInUp } from '@/components/motion';
import Link from 'next/link';

const tutorials = [
  {
    title: 'Setting Up Your First x402 Service',
    description: 'Learn how to create and deploy an x402-protected service using PayAI facilitator.',
    steps: [
      'Configure your Express server with PayAI middleware',
      'Define protected routes with pricing',
      'Set up merchant wallet and CDP API keys',
      'Test payment flow end-to-end',
    ],
  },
  {
    title: 'Integrating PayAI Services',
    description: 'Sync and use services from PayAI facilitator in your application.',
    steps: [
      'Call the PayAI sync endpoint',
      'Query services from database',
      'Handle payment quotes and verification',
      'Display services in marketplace UI',
    ],
  },
  {
    title: 'Building a Payment Flow',
    description: 'Implement a complete payment flow with wallet integration and verification.',
    steps: [
      'Connect user wallet to Base network',
      'Request payment quote from server',
      'Approve and sign transaction',
      'Verify payment via PayAI facilitator',
      'Grant access to paid resource',
    ],
  },
  {
    title: 'Creating Marketplace Listings',
    description: 'Add your services to the r1x marketplace for discovery.',
    steps: [
      'Ensure service is synced from PayAI',
      'Verify service metadata is complete',
      'Set appropriate pricing',
      'Test marketplace discovery',
    ],
  },
];

export default function TutorialsPage() {
  return (
    <>
      <DocsSection>
        <h1 className="text-black text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.858px',
        }}>
          Tutorials
        </h1>
        <p className="text-gray-700 text-lg sm:text-xl mb-12 max-w-3xl" style={{
          fontFamily: 'TWKEverettMono-Regular, monospace',
        }}>
          Step-by-step guides for building on r1x. From basic setup to advanced integrations.
        </p>
      </DocsSection>

      <DocsSection>
        <div className="space-y-12">
          {tutorials.map((tutorial, idx) => (
            <div key={idx} className="border border-gray-200 bg-white" style={{ borderRadius: '0px', padding: '32px' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-black text-xl sm:text-2xl md:text-[24px] mb-2" style={{
                    fontWeight: 400,
                    fontFamily: 'TWKEverett-Regular, sans-serif',
                    letterSpacing: '-0.96px',
                  }}>
                    {tutorial.title}
                  </h2>
                </div>
                <div
                  style={{
                    width: '40px',
                    height: '2px',
                    backgroundColor: '#FF4D00',
                  }}
                />
              </div>
              <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
                fontFamily: 'BaselGrotesk-Regular, sans-serif',
                lineHeight: '1.6',
              }}>
                {tutorial.description}
              </p>
              <div>
                <h3 className="text-black text-sm mb-3" style={{
                  fontFamily: 'TWKEverettMono-Regular, monospace',
                  fontSize: '12px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>
                  Steps
                </h3>
                <ol className="space-y-2" style={{ listStyle: 'none', paddingLeft: '0', counterReset: 'step-counter' }}>
                  {tutorial.steps.map((step, stepIdx) => (
                    <li key={stepIdx} className="flex items-start gap-3" style={{ counterIncrement: 'step-counter' }}>
                      <div className="flex-shrink-0" style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#FF4D00',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'TWKEverettMono-Regular, monospace',
                        fontSize: '12px',
                      }}>
                        {stepIdx + 1}
                      </div>
                      <span className="text-gray-700 text-base sm:text-lg" style={{
                        fontFamily: 'BaselGrotesk-Regular, sans-serif',
                        lineHeight: '1.6',
                      }}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Express Server Setup
        </h2>
        <p className="text-white/85 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          Configure your Express server with PayAI middleware:
        </p>

        <DocsCodeBlock language="typescript" title="Express Server">
{`import express from 'express';
import { paymentMiddleware } from 'x402-express';

const app = express();
const payTo = process.env.MERCHANT_ADDRESS!;
const facilitatorUrl = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';

// Apply PayAI middleware
app.use(paymentMiddleware(
  payTo,
  {
    'POST /api/r1x-agent/chat': {
      price: '$0.25',
      network: 'base',
    },
    'POST /api/x402/pay': {
      price: '$0.01',
      network: 'base',
    },
  },
  {
    url: facilitatorUrl,
  },
));

// Your routes here
app.post('/api/r1x-agent/chat', async (req, res) => {
  // Payment already verified by middleware
  // Handle your logic here
  res.json({ message: 'Success' });
});

app.listen(3001);`}
        </DocsCodeBlock>

        <DocsCallout variant="info" title="PayAI Middleware">
          The paymentMiddleware from x402-express automatically handles HTTP 402 responses, 
          payment verification via PayAI facilitator, and CDP API authentication for Base mainnet.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Client-Side Payment Flow
        </h2>
        <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          Implement payment flow in your React application:
        </p>

        <DocsCodeBlock language="typescript" title="Payment Flow">
{`import { connectWallet, transferUSDC } from '@/lib/wallet';

async function handlePayment(amount: string, merchantAddress: string) {
  // 1. Connect wallet
  const wallet = await connectWallet();
  
  // 2. Request quote from server
  const quoteResponse = await fetch('/api/x402/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceId: 'my-service', amount }),
  });
  
  if (quoteResponse.status === 402) {
    const { payment } = await quoteResponse.json();
    
    // 3. Transfer USDC
    const txHash = await transferUSDC(
      wallet,
      merchantAddress,
      payment.amountRaw
    );
    
    // 4. Retry with payment proof
    const proof = {
      transactionHash: txHash,
      from: wallet.address,
      to: merchantAddress,
      amount: payment.amountRaw,
      token: payment.token,
    };
    
    const successResponse = await fetch('/api/x402/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PAYMENT': JSON.stringify(proof),
      },
      body: JSON.stringify({ serviceId: 'my-service', proof }),
    });
    
    return await successResponse.json();
  }
}`}
        </DocsCodeBlock>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <DocsCallout variant="success" title="Next Steps">
          Ready to dive deeper? Check out the{' '}
          <Link href="/docs/api" style={{ color: '#FF4D00', textDecoration: 'underline' }}>
            API Reference
          </Link>
          {' '}for complete endpoint documentation, or explore{' '}
          <Link href="/docs/utilities" style={{ color: '#FF4D00', textDecoration: 'underline' }}>
            Utilities
          </Link>
          {' '}for available helper functions.
        </DocsCallout>
      </DocsSection>
    </>
  );
}

