'use client';

import DocsSection from '@/components/docs/DocsSection';
import DocsCallout from '@/components/docs/DocsCallout';
import DocsCodeBlock from '@/components/docs/DocsCodeBlock';
import { FadeInUp, StaggerChildren, StaggerChild } from '@/components/motion';

const utilities = [
  {
    name: 'x402 Payment Utilities',
    file: 'src/lib/x402.ts',
    description: 'Core x402 protocol utilities for payment quotes, verification, and settlement with PayAI facilitator.',
    functions: [
      'generatePaymentQuote() - Create payment quotes with fee calculation',
      'verifyPaymentWithFacilitator() - Verify payments via PayAI',
      'settlePaymentWithFacilitator() - Settle verified payments',
      'calculateFeeDistribution() - Calculate platform fees',
      'create402Response() - Generate HTTP 402 Payment Required responses',
      'parsePaymentProof() - Parse payment proofs from headers or body',
    ],
  },
  {
    name: 'Wallet Integration',
    file: 'src/lib/wallet.ts',
    description: 'Base network wallet utilities for connecting wallets, transferring USDC, and managing approvals.',
    functions: [
      'connectWallet() - Connect MetaMask or other Web3 wallets',
      'transferUSDC() - Transfer USDC tokens on Base',
      'approveUSDC() - Approve USDC spending',
      'getUSDCBalance() - Check USDC balance',
      'formatUSDC() - Format USDC amounts for display',
    ],
  },
  {
    name: 'PayAI Service Sync',
    file: 'src/lib/payai-sync.ts',
    description: 'Synchronize services from PayAI facilitator to your database. Handles service discovery and normalization.',
    functions: [
      'fetchPayAIServices() - Fetch services from PayAI facilitator',
      'syncPayAIServices() - Sync services to database',
      'normalizePayAIService() - Normalize PayAI service format',
      'extractCategory() - Automatically categorize services',
    ],
  },
  {
    name: 'Panel Authentication',
    file: 'src/lib/panel-auth.ts',
    description: 'Authentication utilities for user and platform panels. Wallet-based access control.',
    functions: [
      'verifyAdminAccess() - Verify admin wallet addresses',
      'getUserFromRequest() - Extract user address from request',
    ],
  },
  {
    name: 'Fee Transfer',
    file: 'src/lib/fee-transfer.ts',
    description: 'On-chain fee transfer utilities. Transfers platform fees to fee recipient address.',
    functions: [
      'transferFee() - Transfer fees on-chain',
      'batchTransferFees() - Batch transfer multiple fees',
    ],
  },
  {
    name: 'Agent Payment Handler',
    file: 'src/lib/agent-payment.ts',
    description: 'Utilities for r1x Agent to handle x402 payments. Processes payment requests and guides users.',
    functions: [
      'handlePaymentRequest() - Process agent payment requests',
      'generatePaymentMessage() - Create payment guidance messages',
    ],
  },
];

export default function UtilitiesPage() {
  return (
    <>
      <DocsSection>
        <h1 className="text-black text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.858px',
        }}>
          Utilities
        </h1>
        <p className="text-gray-700 text-lg sm:text-xl mb-12 max-w-3xl" style={{
          fontFamily: 'TWKEverettMono-Regular, monospace',
        }}>
          Comprehensive utilities for building on r1x. All utilities are TypeScript-typed and documented.
        </p>
      </DocsSection>

      <DocsSection>
        <StaggerChildren className="space-y-12">
          {utilities.map((utility, idx) => (
            <StaggerChild key={idx}>
              <div className="border border-gray-200 bg-white" style={{ borderRadius: '0px', padding: '32px' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-black text-xl sm:text-2xl md:text-[24px] mb-2" style={{
                      fontWeight: 400,
                      fontFamily: 'TWKEverett-Regular, sans-serif',
                      letterSpacing: '-0.96px',
                    }}>
                      {utility.name}
                    </h2>
                    <code className="text-gray-600 text-sm" style={{
                      fontFamily: 'TWKEverettMono-Regular, monospace',
                    }}>
                      {utility.file}
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
                  {utility.description}
                </p>
                <div>
                  <h3 className="text-black text-sm mb-3" style={{
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}>
                    Available Functions
                  </h3>
                  <ul className="space-y-2">
                    {utility.functions.map((func, funcIdx) => (
                      <li key={funcIdx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-[#FF4D00] mt-2 flex-shrink-0" />
                        <code className="text-gray-800 text-sm" style={{
                          fontFamily: 'TWKEverettMono-Regular, monospace',
                        }}>
                          {func}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StaggerChild>
          ))}
        </StaggerChildren>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Usage Examples
        </h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-white text-lg mb-4" style={{
              fontFamily: 'TWKEverett-Regular, sans-serif',
            }}>
              Generate Payment Quote
            </h3>
            <DocsCodeBlock language="typescript">
{`import { generatePaymentQuote } from '@/lib/x402';

const quote = await generatePaymentQuote(
  '1.5', // Amount in USDC
  '0x...', // Merchant address
  { feePercentage: 5 } // Fee config
);

// Returns PaymentQuote with amount, token, merchant, deadline, nonce`}
            </DocsCodeBlock>
          </div>

          <div>
            <h3 className="text-white text-lg mb-4" style={{
              fontFamily: 'TWKEverett-Regular, sans-serif',
            }}>
              Connect Wallet
            </h3>
            <DocsCodeBlock language="typescript">
{`import { connectWallet } from '@/lib/wallet';

const wallet = await connectWallet();
// Automatically switches to Base network if needed
// Returns { address, chainId, provider }`}
            </DocsCodeBlock>
          </div>

          <div>
            <h3 className="text-white text-lg mb-4" style={{
              fontFamily: 'TWKEverett-Regular, sans-serif',
            }}>
              Sync PayAI Services
            </h3>
            <DocsCodeBlock language="typescript">
{`import { syncPayAIServices } from '@/lib/payai-sync';

const result = await syncPayAIServices();
// { synced: 10, errors: 0 }
// Services are automatically synced to database`}
            </DocsCodeBlock>
          </div>
        </div>
      </DocsSection>

      <DocsSection>
        <DocsCallout variant="info" title="Type Safety">
          All utilities are fully typed with TypeScript. Import types from{' '}
          <code style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>@/lib/types/x402</code>
          {' '}for PaymentQuote, PaymentProof, and other x402 types.
        </DocsCallout>
      </DocsSection>
    </>
  );
}

