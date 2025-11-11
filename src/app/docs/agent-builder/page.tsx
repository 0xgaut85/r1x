'use client';

import DocsPageHero from '@/components/docs/DocsPageHero';
import DocsSection from '@/components/docs/DocsSection';
import DocsNavigation from '@/components/docs/DocsNavigation';
import DocsCallout from '@/components/docs/DocsCallout';
import { FadeInUp } from '@/components/motion';

export const dynamic = 'force-dynamic';

export default function AgentBuilderDocsPage() {
  return (
    <>
      <DocsPageHero
        title="r1x Agent Builder"
        description="No‑code platform for building AI agents with built‑in x402 payment capabilities."
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
            Build custom AI agents with payment superpowers. No coding required. Connect your LLM, define workflows, add x402 services, deploy. Your agent automatically discovers services, quotes prices, and pays in USDC.
          </p>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            <strong>This is Zapier meets AutoGPT meets crypto wallets.</strong> The missing platform that turns AI agents into economic actors.
          </p>
          <div className="mt-6">
            <a 
              href="/agent-builder"
              className="inline-block px-6 py-3 bg-[#FF4D00] text-black hover:bg-[#FF6B35] transition-colors"
              style={{
                fontFamily: 'TWKEverettMono-Regular, monospace',
                fontSize: '14px',
                fontWeight: 400,
                clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
              }}
            >
              TRY AGENT BUILDER →
            </a>
          </div>
        </FadeInUp>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-8" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Visual Workflow Builder ✅
            </h3>
            <p className="text-white/80 mb-3" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Drag‑and‑drop agent logic. Connect contexts, actions, and x402 services. Build complex agent workflows without code.
            </p>
            <p className="text-white/50 text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Status: UI Complete
            </p>
          </div>

          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Context Builder ✅
            </h3>
            <p className="text-white/80 mb-3" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Define stateful contexts with schemas and memory. Inspired by Dreams SDK's context composition patterns.
            </p>
            <p className="text-white/50 text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Status: UI Complete
            </p>
          </div>

          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Action Builder ✅
            </h3>
            <p className="text-white/80 mb-3" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Define agent actions with input/output schemas and handlers. Actions can integrate with x402 services automatically.
            </p>
            <p className="text-white/50 text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Status: UI Complete
            </p>
          </div>

          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              x402 Integration ✅
            </h3>
            <p className="text-white/80 mb-3" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Built-in payment capabilities. Agents automatically detect HTTP 402, parse quotes, sign transactions, and retry with payment proof.
            </p>
            <p className="text-white/50 text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Status: UI Complete
            </p>
          </div>

          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Service Discovery ✅
            </h3>
            <p className="text-white/80 mb-3" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Browse and integrate services from the r1x Marketplace. Real-time discovery, network filtering, price comparison.
            </p>
            <p className="text-white/50 text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Status: UI Complete
            </p>
          </div>

          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Multi-Chain Wallets ✅
            </h3>
            <p className="text-white/80 mb-3" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Connect Base (EVM) and Solana wallets. Set spending limits, auto-approve trusted services, track expenses.
            </p>
            <p className="text-white/50 text-sm" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Status: UI Complete
            </p>
          </div>
        </div>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Architecture
        </h2>
        <div className="bg-black/5 p-6 mb-6" style={{ borderRadius: '0px' }}>
          <pre className="text-sm text-gray-700 overflow-x-auto" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
{`r1x Agent Builder
├── Frontend (UI Complete ✅)
│   ├── Visual Workflow Builder
│   ├── Context Builder
│   ├── Action Builder
│   ├── x402 Integration
│   └── Service Discovery
│
├── Backend (In Development 🚧)
│   ├── API Routes (/api/agent-builder/)
│   ├── Agent Runtime Engine
│   ├── Code Generation
│   └── Deployment Service
│
└── Database
    ├── Agent Definitions
    └── Execution History`}
          </pre>
        </div>
        <p className="text-gray-700 text-base mb-4" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          The Agent Builder is built with complete isolation from the rest of the r1x codebase. All agent builder code lives in dedicated directories:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          <li><code className="bg-black/5 px-2 py-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>src/app/api/agent-builder/</code> - API routes</li>
          <li><code className="bg-black/5 px-2 py-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>src/lib/agent-builder/</code> - Runtime libraries</li>
          <li><code className="bg-black/5 px-2 py-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>src/components/agent-builder/</code> - UI components</li>
        </ul>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          How It Works
        </h2>
        <div className="space-y-6">
          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#FF4D00] text-black flex items-center justify-center text-sm font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                1
              </div>
              <h3 className="text-white text-lg" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Build Your Agent
              </h3>
            </div>
            <p className="text-white/80" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Connect wallets, define contexts and actions, build your workflow visually, and integrate x402 services from the marketplace.
            </p>
          </div>

          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#FF4D00] text-black flex items-center justify-center text-sm font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                2
              </div>
              <h3 className="text-white text-lg" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Save Agent
              </h3>
            </div>
            <p className="text-white/80" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Agent definition is saved to the database, linked to your wallet address, version controlled, and editable anytime.
            </p>
          </div>

          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#FF4D00] text-black flex items-center justify-center text-sm font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                3
              </div>
              <h3 className="text-white text-lg" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Deploy Agent
              </h3>
            </div>
            <p className="text-white/80" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Code is generated from your visual definition, deployed to a serverless runtime, and you receive an endpoint URL.
            </p>
          </div>

          <div className="border border-white/20 p-6" style={{ borderRadius: '0px' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#FF4D00] text-black flex items-center justify-center text-sm font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                4
              </div>
              <h3 className="text-white text-lg" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Execute Agent
              </h3>
            </div>
            <p className="text-white/80" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              Call your agent endpoint with input. The agent executes the workflow, automatically handles x402 payments, and returns results.
            </p>
          </div>
        </div>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Integration
        </h2>
        <p className="text-gray-700 text-base mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          Agent Builder integrates seamlessly with existing r1x infrastructure:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-black/10 p-4">
            <h3 className="text-black text-base mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              x402 Payment Protocol
            </h3>
            <p className="text-gray-700 text-sm" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
              Uses existing X402Client via wrapper. Supports Base and Solana networks.
            </p>
          </div>
          <div className="border border-black/10 p-4">
            <h3 className="text-black text-base mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Marketplace
            </h3>
            <p className="text-gray-700 text-sm" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
              Discovers services from r1x Marketplace. Real-time data, network filtering.
            </p>
          </div>
          <div className="border border-black/10 p-4">
            <h3 className="text-black text-base mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Wallet Integration
            </h3>
            <p className="text-gray-700 text-sm" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
              Uses existing WalletProvider. Reown AppKit for Base, Solana adapters.
            </p>
          </div>
          <div className="border border-black/10 p-4">
            <h3 className="text-black text-base mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              Database
            </h3>
            <p className="text-gray-700 text-sm" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
              Uses existing Prisma setup. New models only (additive, no modifications).
            </p>
          </div>
        </div>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <DocsCallout variant="info" title="Status">
          <div className="space-y-2">
            <p className="text-white/90">
              <strong>UI Status:</strong> ✅ Complete - All visual components are built and functional.
            </p>
            <p className="text-white/90">
              <strong>Backend Status:</strong> 🚧 In Development - API routes, runtime engine, and deployment service are being built.
            </p>
            <p className="text-white/70 text-sm mt-4">
              Join our{' '}
              <a href="https://t.me/r1xbuilders" className="text-[#FF4D00] underline">
                Telegram
              </a>
              {' '}to be notified when backend features are ready.
            </p>
          </div>
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Documentation
        </h2>
        <p className="text-gray-700 text-base mb-4" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          For detailed technical documentation, see:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          <li>
            <a href="/docs/agent-builder" className="text-[#FF4D00] underline">
              Full Agent Builder Documentation
            </a>
          </li>
          <li>
            <a href="/docs/agent-builder-implementation-plan" className="text-[#FF4D00] underline">
              Implementation Plan
            </a>
          </li>
          <li>
            <a href="/docs/x402-integration" className="text-[#FF4D00] underline">
              x402 Integration Guide
            </a>
          </li>
        </ul>
      </DocsSection>
    </>
  );
}

