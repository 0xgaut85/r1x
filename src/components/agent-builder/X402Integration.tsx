'use client';

import { motion } from 'framer-motion';

export default function X402Integration() {
  const paymentFlowSteps = [
    { step: 1, title: 'Agent Detects x402', description: 'Service returns HTTP 402 Payment Required', color: '#FF4D00' },
    { step: 2, title: 'Parse Payment Quote', description: 'Extract price, currency, and payment details', color: '#FF6B35' },
    { step: 3, title: 'Request Approval', description: 'Present quote to user or auto-approve if trusted', color: '#FF8C5A' },
    { step: 4, title: 'Sign Transaction', description: 'Wallet signs USDC payment on Base or Solana', color: '#FFAD7F' },
    { step: 5, title: 'Retry with Proof', description: 'Resend request with X-PAYMENT header', color: '#FFCEA4' },
    { step: 6, title: 'Service Executes', description: 'Service verifies payment and processes request', color: '#FFEFC9' },
  ];

  const exampleCode = `// Agent automatically handles x402 payments
const agent = createAgent({
  actions: [ProcessPaymentAction],
  x402Config: {
    maxPaymentAmount: 100, // USDC
    autoApprove: false,
    networks: ['base', 'solana'],
  },
});

// When action encounters x402:
// 1. Agent detects HTTP 402
// 2. Parses payment quote
// 3. Requests wallet approval
// 4. Signs transaction
// 5. Retries with payment proof
// 6. Service executes`;

  return (
    <div className="space-y-6">
      <div>
        <h2 
          className="text-white text-2xl mb-2"
          style={{
            fontFamily: 'TWKEverett-Regular, sans-serif',
            fontWeight: 400,
            letterSpacing: '-1px',
          }}
        >
          x402 Payment Integration
        </h2>
        <p 
          className="text-white/60 text-sm mb-6"
          style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}
        >
          Agents automatically handle x402 payment flows. No manual payment code required.
        </p>
      </div>

      {/* Payment Flow Visualization */}
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
        <h3 
          className="text-white text-lg mb-6"
          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
        >
          PAYMENT FLOW
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {paymentFlowSteps.map((step, idx) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div
                className="p-4 rounded-lg border-2"
                style={{
                  borderColor: step.color,
                  backgroundColor: `${step.color}15`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: step.color,
                      color: '#000',
                    }}
                  >
                    {step.step}
                  </div>
                  <span
                    className="text-white text-xs font-medium"
                    style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                  >
                    {step.title}
                  </span>
                </div>
                <p
                  className="text-white/60 text-xs"
                  style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}
                >
                  {step.description}
                </p>
              </div>
              {idx < paymentFlowSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path
                      d="M 4 8 L 12 8 M 10 6 L 12 8 L 10 10"
                      stroke={step.color}
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment Quote Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
          <h3 
            className="text-white text-lg mb-4"
            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
          >
            PAYMENT QUOTE EXAMPLE
          </h3>
          <div className="bg-black/60 p-4 rounded font-mono text-xs text-white/80 space-y-2">
            <div>
              <span className="text-white/40">Service:</span>{' '}
              <span className="text-[#FF4D00]">AI Inference API</span>
            </div>
            <div>
              <span className="text-white/40">Price:</span>{' '}
              <span className="text-white">0.25 USDC</span>
            </div>
            <div>
              <span className="text-white/40">Network:</span>{' '}
              <span className="text-white">Base</span>
            </div>
            <div>
              <span className="text-white/40">Recipient:</span>{' '}
              <span className="text-white/60 text-xs break-all">0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
          <h3 
            className="text-white text-lg mb-4"
            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
          >
            AGENT PAYMENT CONFIG
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                MAX PAYMENT AMOUNT (USDC)
              </label>
              <input
                type="text"
                placeholder="100.00"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                disabled
              />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-2 block" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                SUPPORTED NETWORKS
              </label>
              <div className="flex gap-2">
                <div className="px-3 py-2 bg-[#FF4D00]/20 border border-[#FF4D00]/50 rounded">
                  <span className="text-[#FF4D00] text-xs font-mono">Base</span>
                </div>
                <div className="px-3 py-2 bg-[#00D4FF]/20 border border-[#00D4FF]/50 rounded">
                  <span className="text-[#00D4FF] text-xs font-mono">Solana</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 accent-[#FF4D00]"
                disabled
              />
              <span className="text-white/60 text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Auto-approve trusted services
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-black/60 border border-white/10 p-6 rounded-lg">
        <h3 
          className="text-white text-lg mb-4"
          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
        >
          EXAMPLE CODE
        </h3>
        <pre className="text-white/80 text-xs font-mono overflow-x-auto">
          <code>{exampleCode}</code>
        </pre>
      </div>

      {/* Agents Paying Agents Visualization */}
      <div className="bg-gradient-to-r from-[#FF4D00]/10 to-[#00D4FF]/10 border border-white/10 p-6 rounded-lg">
        <h3 
          className="text-white text-lg mb-4"
          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
        >
          AGENTS PAYING AGENTS
        </h3>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#FF4D00]/20 border-2 border-[#FF4D00] rounded-lg flex items-center justify-center mb-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="8" width="20" height="16" rx="2" stroke="#FF4D00" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="14" r="2" fill="#FF4D00"/>
                <circle cx="20" cy="14" r="2" fill="#FF4D00"/>
                <path d="M 8 20 L 12 24 L 24 24 L 28 20" stroke="#FF4D00" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <p className="text-white/60 text-xs" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Agent A
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-0.5 bg-[#FF4D00] mb-1" />
            <span className="text-[#FF4D00] text-xs font-mono">0.25 USDC</span>
            <div className="w-12 h-0.5 bg-[#FF4D00] mt-1" />
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#00D4FF]/20 border-2 border-[#00D4FF] rounded-lg flex items-center justify-center mb-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="8" width="20" height="16" rx="2" stroke="#00D4FF" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="14" r="2" fill="#00D4FF"/>
                <circle cx="20" cy="14" r="2" fill="#00D4FF"/>
                <path d="M 8 20 L 12 24 L 24 24 L 28 20" stroke="#00D4FF" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <p className="text-white/60 text-xs" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Agent B
            </p>
          </div>
        </div>
        <p className="text-white/60 text-xs mt-4 text-center" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
          Autonomous agent-to-agent commerce. Every transaction verifiable on-chain.
        </p>
      </div>
    </div>
  );
}

