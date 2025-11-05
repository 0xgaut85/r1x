'use client';

import dynamicImport from 'next/dynamic';
import Footer from '@/components/Footer';

const Header = dynamicImport(() => import('@/components/Header'), { ssr: false });

export const dynamic = 'force-dynamic';

export default function TermsOfService() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12" style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}>
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', color: '#333333' }}>
            <p className="text-sm sm:text-base mb-6">
              <strong>Last Updated:</strong> October 2025
            </p>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>1. Agreement to Terms</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                By accessing or using r1x services, including r1x Agent, RX1 Builder, r1x SDK, r1x Marketplace, and any related platforms (collectively, "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use our Services.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>2. Description of Services</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                r1x provides decentralized payment infrastructure enabling the machine economy on Base blockchain. Our Services facilitate:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm sm:text-base">
                <li>Machine-to-machine transactions and payments</li>
                <li>Pay-per-use access to digital resources</li>
                <li>API access and service integrations</li>
                <li>Marketplace for digital assets and services</li>
                <li>Developer tools and SDKs</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>3. Eligibility</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                You must be at least 18 years old and have the legal capacity to enter into contracts. You represent that you are not prohibited from using our Services under applicable laws or regulations.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>4. Decentralized Nature and Risks</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6" style={{ color: '#000000' }}>4.1 Blockchain Transactions</h3>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                All transactions on r1x occur on the Base blockchain and are irreversible. You acknowledge that blockchain transactions carry inherent risks, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm sm:text-base">
                <li>Loss of funds due to incorrect addresses or errors</li>
                <li>Smart contract vulnerabilities or exploits</li>
                <li>Network congestion or failures</li>
                <li>Regulatory changes affecting blockchain technology</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6" style={{ color: '#000000' }}>4.2 Wallet Security</h3>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                You are solely responsible for securing your wallet, private keys, and access credentials. r1x does not store or have access to your private keys. We cannot recover lost funds or compromised wallets.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>5. Acceptable Use</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm sm:text-base">
                <li>Use Services for illegal activities or violate any applicable laws</li>
                <li>Attempt to hack, disrupt, or compromise our Services or infrastructure</li>
                <li>Use Services to transmit malicious code, viruses, or harmful content</li>
                <li>Impersonate others or provide false information</li>
                <li>Violate intellectual property rights</li>
                <li>Engage in market manipulation or fraudulent activities</li>
                <li>Use Services in any way that could harm r1x or other users</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>6. Fees and Payments</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                r1x may charge fees for certain Services. Fees are displayed at the time of transaction. You are responsible for all transaction fees, including blockchain network fees (gas fees). All fees are non-refundable unless required by law.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>7. Intellectual Property</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                All content, software, code, trademarks, and other intellectual property associated with r1x Services are owned by r1x or our licensors. You may not copy, modify, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>8. Disclaimers</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                <strong>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</strong> We disclaim all warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                We do not guarantee that Services will be uninterrupted, secure, or error-free. We are not responsible for losses due to blockchain network issues, smart contract bugs, or third-party services.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>9. Limitation of Liability</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, r1x SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR CRYPTOCURRENCY, ARISING FROM YOUR USE OF SERVICES.
              </p>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                Our total liability for any claims shall not exceed the amount you paid to us in the 12 months preceding the claim.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>10. Indemnification</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                You agree to indemnify, defend, and hold harmless r1x and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising from your use of Services or violation of these Terms.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>11. Termination</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                We may suspend or terminate your access to Services at any time, with or without notice, for violation of these Terms or for any other reason. You may stop using Services at any time.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>12. Governing Law</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration or courts of competent jurisdiction.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>13. Changes to Terms</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                We may modify these Terms at any time. Material changes will be posted on our website with an updated "Last Updated" date. Continued use of Services after changes constitutes acceptance of modified Terms.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>14. Contact Information</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                For questions about these Terms, please contact us at:
              </p>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                Email: legal@r1x.io<br />
                Website: r1x.io
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

