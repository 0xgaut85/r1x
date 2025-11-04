'use client';

import { FadeInUp, StaggerChildren, StaggerChild, ScaleOnHover } from '@/components/motion';

const tokenFeatures = [
  {
    title: 'Network Utility',
    description: '$R1X powers the machine economy. Staking, governance, fee discounts, and access to premium services.',
  },
  {
    title: 'Fee Distribution',
    description: 'Token holders receive a share of platform fees. The more machines transact, the more value accrues to holders.',
  },
  {
    title: 'Governance',
    description: 'Vote on protocol upgrades, fee structures, and new features. Shape the future of the machine economy.',
  },
  {
    title: 'Platform Access',
    description: 'Unlock premium features, priority support, and exclusive services. Build on top of r1x infrastructure.',
  },
];

export default function TokenSection() {
  return (
    <section style={{ backgroundColor: '#F7F7F7', paddingTop: '80px', paddingBottom: '120px' }}>
      <div className="px-4 sm:px-6 md:px-10 lg:px-[40px]" style={{ maxWidth: 'none' }}>
        <FadeInUp>
          <div className="mb-4">
            <h2 className="text-black text-3xl sm:text-4xl md:text-[46.45px] leading-tight md:leading-[51.095px]" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverett-Regular, sans-serif',
              letterSpacing: '-1.858px',
              color: 'rgb(0, 0, 0)',
            }}>
              $R1X Token
            </h2>
          </div>
          <p className="text-gray-700 text-lg sm:text-xl mb-12 max-w-3xl" style={{ 
            fontWeight: 400,
            fontFamily: 'TWKEverettMono-Regular, monospace',
            color: 'rgb(0, 0, 0)',
          }}>
            Native token on Base network. Powering the machine economy.
          </p>
        </FadeInUp>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {tokenFeatures.map((feature, idx) => (
            <StaggerChild key={idx}>
              <ScaleOnHover>
                <div className="border border-gray-200 hover:border-[#FF4D00] transition-all duration-300 card-hover group bg-white h-full" style={{ borderRadius: '0px', padding: '32px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '2px',
                      backgroundColor: '#FF4D00',
                      marginBottom: '16px',
                    }}
                  />
                  <h3 className="text-black text-xl sm:text-2xl md:text-[24px] mb-3" style={{
                    fontWeight: 400,
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                    lineHeight: '1.4',
                    letterSpacing: '-0.96px',
                    color: 'rgb(0, 0, 0)'
                  }}>{feature.title}</h3>
                  <p className="text-gray-700 leading-relaxed text-base sm:text-lg" style={{
                    fontWeight: 400,
                    fontFamily: 'BaselGrotesk-Regular, sans-serif',
                    lineHeight: '1.4',
                    color: 'rgb(0, 0, 0)'
                  }}>
                    {feature.description}
                  </p>
                </div>
              </ScaleOnHover>
            </StaggerChild>
          ))}
        </StaggerChildren>

        <FadeInUp>
          <div className="bg-gradient-to-br from-[#FF4D00] to-[#FF6B35] text-white p-8 sm:p-12 mt-12" style={{ borderRadius: '0px' }}>
            <h3 className="text-white text-2xl sm:text-3xl md:text-[32px] mb-6" style={{
              fontWeight: 400,
              fontFamily: 'TWKEverett-Regular, sans-serif',
              letterSpacing: '-1.28px',
            }}>
              Token Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <p className="text-white/80 text-sm mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  NETWORK
                </p>
                <p className="text-white text-lg font-medium" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                  Base
                </p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  CONTRACT
                </p>
                <p className="text-white text-lg font-medium break-all" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                  Coming Soon
                </p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  UTILITY
                </p>
                <p className="text-white text-lg font-medium" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                  Governance, Staking, Fees
                </p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  SUPPLY
                </p>
                <p className="text-white text-lg font-medium" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                  TBA
                </p>
              </div>
            </div>
            <p className="text-white leading-relaxed text-base sm:text-lg" style={{
              fontWeight: 400,
              fontFamily: 'BaselGrotesk-Regular, sans-serif',
              lineHeight: '1.4',
            }}>
              $R1X is the native token of the r1x ecosystem. It powers governance, enables staking, provides fee discounts, and unlocks premium features. As the machine economy grows, so does the value of $R1X.
            </p>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}

