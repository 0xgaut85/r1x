'use client';

import DocsPageHero from '@/components/docs/DocsPageHero';
import DocsSection from '@/components/docs/DocsSection';
import DocsNavigation from '@/components/docs/DocsNavigation';
import DocsCallout from '@/components/docs/DocsCallout';
import CryptoLogo from '@/components/CryptoLogo';
import { FadeInUp, StaggerChildren, StaggerChild } from '@/components/motion';

export const dynamic = 'force-dynamic';

export default function R1xTokenDocsPage() {
  return (
    <>
      <DocsPageHero
        title="$R1X Token"
        description="The native token of the r1x ecosystem. Launched on Solana with a deflationary flywheel mechanism powered by platform fees."
      />
      <DocsNavigation />

      <DocsSection>
        <FadeInUp>
          <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
            fontWeight: 400,
            fontFamily: 'TWKEverett-Regular, sans-serif',
            letterSpacing: '-1.28px',
          }}>
            What is $R1X?
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            $R1X is the native token of the r1x ecosystem, launched on Solana. It powers the machine economy through governance, staking, fee discounts, and platform access. As machines transact autonomously, platform fees drive a deflationary flywheel that creates sustainable value for token holders.
          </p>
          <p className="text-gray-700 text-base sm:text-lg mb-6" style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            lineHeight: '1.6',
          }}>
            <strong>The flywheel:</strong> More transactions → More fees → More buybacks & burns → Reduced supply → Increased value → More adoption → More transactions. This creates a self-reinforcing cycle that benefits the entire ecosystem.
          </p>
        </FadeInUp>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-8" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Tokenomics
        </h2>

        <StaggerChildren className="space-y-4 sm:space-y-6">
          <StaggerChild>
            <div className="border border-white/20 p-4 sm:p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-white text-base sm:text-lg mb-2 sm:mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Total Supply
              </h3>
              <p className="text-white/80 text-xl sm:text-2xl mb-2" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                1,000,000,000 $R1X
              </p>
              <p className="text-white/80 text-sm sm:text-base" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                1 billion tokens launched on Pump.fun. Fair launch with no pre-sale or private allocation.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-white/20 p-4 sm:p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-white text-base sm:text-lg mb-2 sm:mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Fee Allocation
              </h3>
              <p className="text-white/80 text-xl sm:text-2xl mb-2" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                75% Buybacks & Burn
              </p>
              <p className="text-white/80 text-sm sm:text-base" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Three-quarters of all platform fees are used to buy $R1X tokens from the market and permanently burn them. This creates a deflationary mechanism that reduces supply over time.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-white/20 p-4 sm:p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-white text-base sm:text-lg mb-2 sm:mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Builder Incentives
              </h3>
              <p className="text-white/80 text-xl sm:text-2xl mb-2" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                2% Locked Reserve
              </p>
              <p className="text-white/80 text-sm sm:text-base" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                2% of the total supply (20 million tokens) will be market-bought and locked for future builder and developer incentives, grants, and ecosystem growth initiatives.
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
        }}>
          The Flywheel Mechanism
        </h2>

        <div className="space-y-6 mb-8">
          <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
            <h3 className="text-black text-lg mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
              How It Works
            </h3>
            <ol className="space-y-4" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.8' }}>
              <li className="flex items-start gap-3">
                <span className="text-[#FF4D00] font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>1.</span>
                <span className="text-gray-700"><strong>Machines transact</strong> on the r1x platform, generating platform fees with every payment.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF4D00] font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>2.</span>
                <span className="text-gray-700"><strong>75% of fees</strong> are automatically allocated to buybacks and burns.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF4D00] font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>3.</span>
                <span className="text-gray-700"><strong>Tokens are purchased</strong> from the open market and permanently burned, reducing circulating supply.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF4D00] font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>4.</span>
                <span className="text-gray-700"><strong>Reduced supply</strong> creates upward pressure on token value, benefiting all holders.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF4D00] font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>5.</span>
                <span className="text-gray-700"><strong>Increased value</strong> attracts more users, builders, and machines to the platform.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF4D00] font-medium" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>6.</span>
                <span className="text-gray-700"><strong>More adoption</strong> generates more transactions and fees, restarting the cycle.</span>
              </li>
            </ol>
          </div>

          <DocsCallout variant="info" title="Sustainable Growth">
            The flywheel creates a self-reinforcing cycle where platform growth directly benefits token holders. As the machine economy scales, so does the deflationary pressure on $R1X supply.
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <h2 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Token Details
        </h2>

        <div className="bg-gradient-to-br from-[#FF4D00] to-[#FF6B35] text-white relative mx-auto w-full" style={{ borderRadius: '0px', minHeight: '200px', maxWidth: '900px' }}>
          <div className="p-4 sm:p-6 md:p-8 lg:p-12 relative">
            {/* Solana - Top Left */}
            <div style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', zIndex: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <p className="text-white/70 uppercase tracking-wider" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '10px', marginBottom: '4px' }}>NETWORK</p>
                <p className="text-white font-medium" style={{ fontFamily: 'TWKEverett-Regular, sans-serif', fontSize: '18px', whiteSpace: 'nowrap' }}>Solana</p>
              </div>
              <img
                src="https://assets.coingecko.com/coins/images/4128/large/solana.png"
                alt="Solana"
                style={{ 
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain',
                  opacity: 0.6,
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
                  flexShrink: 0
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Pump.fun - Bottom Right */}
            <div style={{ position: 'absolute', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px', zIndex: 10 }}>
              <img
                src="https://pump.fun/favicon.ico"
                alt="Pump.fun"
                style={{ 
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain', 
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
                  flexShrink: 0
                }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <p className="text-white/70 uppercase tracking-wider" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '10px', marginBottom: '4px' }}>PLATFORM</p>
                <p className="text-white font-medium" style={{ fontFamily: 'TWKEverett-Regular, sans-serif', fontSize: '18px', whiteSpace: 'nowrap' }}>Pump.fun</p>
              </div>
            </div>

            {/* Centered Stats */}
            <div className="flex flex-col items-center justify-center pt-12 pb-12 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center w-full px-4 sm:px-6">
                {/* Total Supply */}
                <div>
                  <p className="text-white/70 text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider mb-1 sm:mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>SUPPLY</p>
                  <p className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>1B</p>
                  <p className="text-white/80 text-xs sm:text-sm mt-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>$R1X</p>
                </div>

                {/* Buyback & Burn */}
                <div>
                  <p className="text-white/70 text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider mb-1 sm:mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>BUYBACK & BURN</p>
                  <p className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>75%</p>
                  <p className="text-white/80 text-xs sm:text-sm mt-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>of fees</p>
                </div>

                {/* Builder Reserve */}
                <div>
                  <p className="text-white/70 text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider mb-1 sm:mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>BUILDER RESERVE</p>
                  <p className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>2%</p>
                  <p className="text-white/80 text-xs sm:text-sm mt-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>20M</p>
                </div>

                {/* Contract */}
                <div>
                  <p className="text-white/70 text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider mb-1 sm:mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>CONTRACT</p>
                  <p className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>TBA</p>
                  <p className="text-white/80 text-xs sm:text-sm mt-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>Q4 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection>
        <h2 className="text-black text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
          fontWeight: 400,
          fontFamily: 'TWKEverett-Regular, sans-serif',
          letterSpacing: '-1.28px',
        }}>
          Token Utility
        </h2>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Governance
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Vote on protocol upgrades, fee structures, and new features. Shape the future of the machine economy.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Staking
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Stake $R1X to earn rewards and participate in network security. Stakers receive priority access to new features.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Fee Discounts
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Holders receive reduced platform fees. The more you hold, the more you save on every transaction.
              </p>
            </div>
          </StaggerChild>

          <StaggerChild>
            <div className="border border-gray-200 p-6" style={{ borderRadius: '0px' }}>
              <h3 className="text-black text-lg mb-3" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                Platform Access
              </h3>
              <p className="text-gray-700" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif', lineHeight: '1.6' }}>
                Unlock premium features, priority support, and exclusive services. Build on top of r1x infrastructure.
              </p>
            </div>
          </StaggerChild>
        </StaggerChildren>
      </DocsSection>

      <DocsSection backgroundColor="#000000">
        <DocsCallout variant="warning" title="Launch Information">
          $R1X token will launch on Pump.fun in Q4 2025. Stay tuned for the official launch date and contract address. Join our community to be notified when the token goes live.
        </DocsCallout>
      </DocsSection>
    </>
  );
}

