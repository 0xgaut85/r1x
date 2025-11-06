'use client';

import DocsPageHero from '@/components/docs/DocsPageHero';
import DocsSection from '@/components/docs/DocsSection';
import DocsCallout from '@/components/docs/DocsCallout';
import DocsCodeBlock from '@/components/docs/DocsCodeBlock';
import { FadeInUp, StaggerChildren, StaggerChild } from '@/components/motion';

export const dynamic = 'force-dynamic';

export default function X402CreatorDocsPage() {
  return (
    <>
      <DocsPageHero
        title="R1X x402 Creator"
        description="Build and deploy x402 services without code. Visual interface to create machine-payable APIs. Coming soon."
      />

      <DocsSection>
        <FadeInUp>
          <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.28px',
            color: '#000000',
          }}>
            What is R1X x402 Creator?
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
            color: '#374151',
          }}>
            R1X x402 Creator is a visual, no-code tool for building x402 services. Turn any API endpoint into a machine-payable service with pricing, payment verification, and marketplace listing—all through an intuitive interface.
          </p>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
            color: '#374151',
          }}>
            <strong>No coding required.</strong> Configure your service, set pricing, connect your merchant wallet, and deploy. R1X x402 Creator handles the x402 protocol implementation, payment middleware, and facilitator integration automatically.
          </p>
        </FadeInUp>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-8" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
          color: '#FFFFFF',
        }}>
          Key Features
        </h2>

        <StaggerChildren className="space-y-6">
          <StaggerChild>
            <div className="border border-white/15 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Visual Service Builder
              </h3>
              <p className="text-white/90" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Drag-and-drop interface to configure endpoints, set request/response schemas, and define pricing models. No API knowledge required.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-white/15 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Automatic x402 Integration
              </h3>
              <p className="text-white/90" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Built-in payment middleware handles HTTP 402 responses, payment quote generation, X-PAYMENT header verification, and facilitator integration. Your service becomes machine-payable automatically.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-white/15 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Pricing Configuration
              </h3>
              <p className="text-white/90" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Set per-request pricing, subscription models, or dynamic pricing based on usage. Configure fee structures and merchant addresses. All pricing settles in USDC on Base.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-white/15 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Marketplace Integration
              </h3>
              <p className="text-white/90" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                One-click publishing to r1x Marketplace. Your service becomes discoverable by AI agents and other machines. Automatic service metadata and categorization.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-white/15 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-white text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Analytics & Monitoring
              </h3>
              <p className="text-white/90" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Built-in dashboard tracks requests, payments, revenue, and usage patterns. Monitor service health and agent adoption in real-time.
              </p>
            </div>
          </StaggerChild>
        </StaggerChildren>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
          color: '#000000',
        }}>
          How It Works
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-black text-lg mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}>
              1. Connect Your API
            </h3>
            <p className="text-gray-700 mb-4" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6', color: '#374151' }}>
              Point R1X x402 Creator to your existing API endpoint. It will analyze your API structure and suggest pricing models.
            </p>
          </div>

          <div>
            <h3 className="text-black text-lg mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}>
              2. Configure Pricing
            </h3>
            <p className="text-gray-700 mb-4" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6', color: '#374151' }}>
              Set your price per request, connect your merchant wallet address, and configure fee structures. Choose between fixed pricing, usage-based, or subscription models.
            </p>
          </div>

          <div>
            <h3 className="text-black text-lg mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}>
              3. Deploy & Publish
            </h3>
            <p className="text-gray-700 mb-4" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6', color: '#374151' }}>
              Deploy your x402-enabled service with one click. Optionally publish to r1x Marketplace for agent discovery. Your service is now machine-payable.
            </p>
          </div>
        </div>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
          color: '#FFFFFF',
        }}>
          Example: Creating a Service
        </h2>

        <p className="text-white/90 mb-6" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
          Here's what creating a service will look like in R1X x402 Creator:
        </p>

        <DocsCodeBlock language="yaml" title="Service Configuration" titleColor="#FFFFFF">
{`# Service Definition (auto-generated by Creator)
service:
  name: "AI Image Generation"
  description: "Generate images using Stable Diffusion"
  endpoint: "https://api.example.com/generate"
  
pricing:
  model: "per-request"
  amount: "0.10"
  token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" # USDC
  chainId: 8453 # Base
  
merchant:
  address: "0xYourWalletAddress"
  
features:
  - automatic_402_responses
  - payment_verification
  - facilitator_integration
  - marketplace_listing`}
        </DocsCodeBlock>

        <DocsCallout variant="info" title="No Code Required">
          This configuration is created through the visual interface. No YAML editing needed—just point, click, and deploy.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
          color: '#000000',
        }}>
          Use Cases
        </h2>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', color: '#000000' }}>
                API Monetization
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6', color: '#374151' }}>
                Turn existing APIs into revenue-generating services. No backend changes required.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', color: '#000000' }}>
                Agent Services
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6', color: '#374151' }}>
                Build services specifically for AI agents. Pricing optimized for machine-to-machine transactions.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', color: '#000000' }}>
                Rapid Prototyping
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6', color: '#374151' }}>
                Quickly test x402 services without writing payment middleware. Perfect for MVPs and experiments.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', color: '#000000' }}>
                Marketplace Listings
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6', color: '#374151' }}>
                Create services for r1x Marketplace. Make your service discoverable by thousands of agents.
              </p>
            </div>
          </StaggerChild>
        </StaggerChildren>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <DocsCallout variant="warning" title="Coming Soon">
          R1X x402 Creator is currently in development. Expected launch: Q2 2025. Join our waitlist to get early access and preferential pricing.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
          color: '#000000',
        }}>
          Technical Details
        </h2>

        <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
          color: '#374151',
        }}>
          R1X x402 Creator generates x402-compliant services that integrate with PayAI facilitator (and future r1x Facilitator). All services use standard x402 protocol, ensuring compatibility with any x402 client.
        </p>

        <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
          color: '#374151',
        }}>
          Services created with R1X x402 Creator are fully compatible with r1x Agent, r1x Marketplace, and any other x402-enabled client. You can also export the generated code if you need custom modifications.
        </p>
      </DocsSection>
    </>
  );
}

