'use client';

import DocsPageHero from '@/components/docs/DocsPageHero';
import DocsSection from '@/components/docs/DocsSection';
import DocsCallout from '@/components/docs/DocsCallout';
import DocsCodeBlock from '@/components/docs/DocsCodeBlock';
import { FadeInUp, StaggerChildren, StaggerChild } from '@/components/motion';

export const dynamic = 'force-dynamic';

export default function MarketplaceDocsPage() {
  return (
    <>
      <DocsPageHero
        title="r1x Marketplace"
        description="The app store for AI agents. Discover, quote, and purchase x402 services on demand."
      />

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
            r1x Marketplace is where agents find services to buy. Every listing is an x402‑protected API. Every purchase is settled in USDC on Base. Every transaction is verifiable on‑chain.
          </p>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            <strong>This is the agent economy's discovery layer.</strong> Deploy your service, set your price, watch agents buy. No integration required—just standard x402.
          </p>
        </FadeInUp>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-8" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          List Your Service
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-white text-lg mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
              Deploy x402 endpoint
            </h3>
            <DocsCodeBlock language="typescript" titleColor="#FFFFFF">
{`// Your API returns 402 with a payment quote
app.post('/api/your-service', async (req, res) => {
  if (!req.headers['x-payment']) {
    return res.status(402).json({
      x402Version: 1,
      accepts: [{
        amount: "1.00",
        token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
        chainId: 8453, // Base
        merchant: "0xYourAddress"
      }]
    });
  }
  
  // Verify payment and return service
  const service = await processRequest(req.body);
  res.json(service);
});`}
            </DocsCodeBlock>
          </div>

          <div>
            <p className="text-white/90 mb-4" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
              That's it. Your service is now listed. Agents discover it, r1x handles the payment infrastructure.
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
          Service Categories
        </h2>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                AI & ML
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                LLM inference, embeddings, fine‑tuned models, image generation, voice synthesis
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Data & Analytics
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Market data, social graphs, sentiment analysis, real‑time feeds, structured datasets
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Compute
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                GPU rentals, serverless functions, specialized hardware, batch processing
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Services
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Web scraping, API aggregation, data transformation, validation services
              </p>
            </div>
          </StaggerChild>
        </StaggerChildren>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <DocsCallout variant="warning" title="Early Access">
          The marketplace is in active development. Service discovery and agent‑native browsing coming soon. For now, agents can access any x402 endpoint directly.
        </DocsCallout>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Pricing Model
        </h2>

        <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          lineHeight: '1.6',
        }}>
          r1x takes a 5% platform fee on all transactions. You set your price, agents pay it, we route payment. Instant USDC settlement on Base.
        </p>

        <div className="bg-gray-50 border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
          <div className="space-y-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '14px' }}>
            <div className="flex justify-between">
              <span className="text-gray-600">Your Price:</span>
              <span className="text-black font-bold">$1.00 USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee (5%):</span>
              <span className="text-gray-800">$0.05 USDC</span>
            </div>
            <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between">
              <span className="text-black font-bold">You Receive:</span>
              <span className="text-[#FF4D00] font-bold">$0.95 USDC</span>
            </div>
          </div>
        </div>
      </DocsSection>
    </>
  );
}

