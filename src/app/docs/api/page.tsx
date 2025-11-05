'use client';

import DocsSection from '@/components/docs/DocsSection';
import DocsCallout from '@/components/docs/DocsCallout';
import DocsCodeBlock from '@/components/docs/DocsCodeBlock';
import DocsPageHero from '@/components/docs/DocsPageHero';
import { FadeInUp } from '@/components/motion';

export const dynamic = 'force-dynamic';

const endpoints = [
  {
    method: 'POST',
    path: '/api/x402/pay',
    description: 'Request payment quote or process payment proof. Returns HTTP 402 when payment is required.',
    request: {
      body: {
        serviceId: 'string (required)',
        amount: 'string (optional)',
        proof: 'object (optional)',
      },
    },
    responses: {
      '402': 'Payment Required - Contains payment quote',
      '200': 'Success - Payment verified, service fulfilled',
    },
  },
  {
    method: 'POST',
    path: '/api/x402/verify',
    description: 'Verify payment proof with PayAI facilitator. Supports X-PAYMENT header (x402 spec).',
    request: {
      body: {
        proof: 'object (required)',
        settle: 'boolean (optional)',
      },
      headers: {
        'X-PAYMENT': 'string (optional) - JSON-encoded payment proof',
      },
    },
    responses: {
      '200': 'Verification result with settlement details',
    },
  },
  {
    method: 'GET',
    path: '/api/marketplace/services',
    description: 'List available x402 services from database. Supports filtering by category and merchant.',
    request: {
      query: {
        category: 'string (optional)',
        merchant: 'string (optional)',
        network: 'string (optional, default: base)',
        chainId: 'number (optional, default: 8453)',
      },
    },
    responses: {
      '200': 'List of services with metadata',
    },
  },
  {
    method: 'POST',
    path: '/api/sync/payai',
    description: 'Sync services from PayAI facilitator to database. Can be called manually or via cron.',
    request: {
      headers: {
        'Authorization': 'Bearer YOUR_SYNC_SECRET (optional)',
      },
    },
    responses: {
      '200': 'Sync result with counts',
    },
  },
  {
    method: 'GET',
    path: '/api/panel/user/stats',
    description: 'Get user statistics and summary. Requires wallet address authentication.',
    request: {
      query: {
        address: 'string (required) - User wallet address',
      },
    },
    responses: {
      '200': 'User stats with transaction summary',
    },
  },
  {
    method: 'GET',
    path: '/api/panel/platform/analytics',
    description: 'Get platform-wide analytics. Admin-only access.',
    request: {
      query: {
        period: 'string (optional) - 7d, 30d, 90d, all',
      },
    },
    responses: {
      '200': 'Platform analytics and metrics',
    },
  },
];

export default function ApiPage() {
  return (
    <>
      <DocsPageHero 
        title="API Reference"
        description="x402‑compatible endpoints for quote → pay → retry flows. JSON first, USDC on Base, proof via X‑PAYMENT header."
      />

      <DocsSection>
        <div className="space-y-12">
          {endpoints.map((endpoint, idx) => (
            <div key={idx} className="border border-gray-200 bg-white" style={{ borderRadius: '0px', padding: '32px' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-[#FF4D00] text-sm font-medium" style={{
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    padding: '4px 12px',
                    border: '1px solid #FF4D00',
                  }}>
                    {endpoint.method}
                  </span>
                  <code className="text-black text-lg" style={{
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                  }}>
                    {endpoint.path}
                  </code>
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
                {endpoint.description}
              </p>

              {endpoint.request && (
                <div className="mb-6">
                  <h3 className="text-black text-sm mb-3" style={{
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}>
                    Request
                  </h3>
                  {endpoint.request.body && (
                    <div className="mb-4">
                      <div className="text-gray-600 text-xs mb-2" style={{
                        fontFamily: 'TWKEverettMono-Regular, monospace',
                      }}>
                        Body:
                      </div>
                      <DocsCodeBlock language="json" titleColor="#000000">
{JSON.stringify(endpoint.request.body, null, 2)}
                      </DocsCodeBlock>
                    </div>
                  )}
                  {endpoint.request.query && (
                    <div className="mb-4">
                      <div className="text-gray-600 text-xs mb-2" style={{
                        fontFamily: 'TWKEverettMono-Regular, monospace',
                      }}>
                        Query Parameters:
                      </div>
                      <DocsCodeBlock language="json" titleColor="#000000">
{JSON.stringify(endpoint.request.query, null, 2)}
                      </DocsCodeBlock>
                    </div>
                  )}
                  {endpoint.request.headers && (
                    <div className="mb-4">
                      <div className="text-gray-600 text-xs mb-2" style={{
                        fontFamily: 'TWKEverettMono-Regular, monospace',
                      }}>
                        Headers:
                      </div>
                      <DocsCodeBlock language="json" titleColor="#000000">
{JSON.stringify(endpoint.request.headers, null, 2)}
                      </DocsCodeBlock>
                    </div>
                  )}
                </div>
              )}

              {endpoint.responses && (
                <div>
                  <h3 className="text-black text-sm mb-3" style={{
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}>
                    Responses
                  </h3>
                  <ul className="space-y-2">
                    {Object.entries(endpoint.responses).map(([status, description]) => (
                      <li key={status} className="flex items-start gap-3">
                        <span className="text-[#FF4D00] text-sm font-medium" style={{
                          fontFamily: 'TWKEverettMono-Regular, monospace',
                        }}>
                          {status}:
                        </span>
                        <span className="text-gray-700 text-sm" style={{
                          fontFamily: 'BaselGrotesk-Regular, sans-serif',
                        }}>
                          {description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
          color: '#FFFFFF',
        }}>
          Example: Payment Flow
        </h2>
        <p className="text-white/85 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          Complete example of requesting a payment quote and processing payment:
        </p>

        <DocsCodeBlock language="typescript" title="Payment Flow Example" titleColor="#FFFFFF">
{`// 1. Request payment quote
const quoteResponse = await fetch('/api/x402/pay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serviceId: 'claude-sonnet-api',
    amount: '0.25',
  }),
});

// 2. Handle 402 Payment Required
if (quoteResponse.status === 402) {
  const { payment } = await quoteResponse.json();
  // payment.amount: "$0.25"
  // payment.amountRaw: "250000" (in smallest unit, 6 decimals)
  // payment.token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  // payment.merchant: "0x..."
  // payment.deadline: 1234567890
  // payment.nonce: "unique-nonce"
  
  // 3. Approve payment in wallet
  const txHash = await transferUSDC(wallet, payment.merchant, payment.amountRaw);
  
  // 4. Retry with payment proof
  const successResponse = await fetch('/api/x402/pay', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-PAYMENT': JSON.stringify({
        transactionHash: txHash,
        from: wallet.address,
        to: payment.merchant,
        amount: payment.amountRaw,
        token: payment.token,
      }),
    },
    body: JSON.stringify({
      serviceId: 'claude-sonnet-api',
      proof: {
        transactionHash: txHash,
        from: wallet.address,
        to: payment.merchant,
        amount: payment.amountRaw,
        token: payment.token,
      },
    }),
  });
  
  // 5. Access granted
  const result = await successResponse.json();
}`}
        </DocsCodeBlock>

        <DocsCallout variant="info" title="X-PAYMENT Header">
          The X-PAYMENT header follows the x402 specification. You can send payment proof 
          either in the header or request body. Header takes precedence if both are provided.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Base URL
        </h2>
        <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          All API endpoints are relative to your deployment URL. For local development:
        </p>
        <DocsCodeBlock language="bash" titleColor="#000000">
{`# Local development
http://localhost:3000/api/...

# Production
https://your-domain.vercel.app/api/...`}
        </DocsCodeBlock>
      </DocsSection>
    </>
  );
}

