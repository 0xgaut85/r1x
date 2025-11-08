'use client';

import dynamicImport from 'next/dynamic';
import Footer from '@/components/Footer';

const Header = dynamicImport(() => import('@/components/Header'), { ssr: false });

export const dynamic = 'force-dynamic';

export default function Legal() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12" style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}>
            Legal Information
          </h1>
          
          <div className="prose prose-lg max-w-none" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', color: '#333333' }}>
            <p className="text-sm sm:text-base mb-6">
              <strong>Last Updated:</strong> October 2025
            </p>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Company Information</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                <strong>r1x</strong><br />
                Payment Infrastructure for the Machine Economy<br />
                Built on Base Blockchain
              </p>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                For legal inquiries, please contact:<br />
                Email: legal@r1x.io<br />
                Website: r1x.io
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Regulatory Compliance</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                r1x operates as a decentralized infrastructure provider. We are committed to compliance with applicable laws and regulations governing blockchain technology, cryptocurrencies, and payment services in jurisdictions where we operate.
              </p>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                Users are responsible for ensuring their use of r1x Services complies with all applicable local, state, and federal laws and regulations.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Intellectual Property Rights</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                All trademarks, logos, and service marks displayed on r1x Services are the property of r1x or their respective owners. You may not use these marks without our prior written permission.
              </p>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                r1x respects intellectual property rights. If you believe your rights have been infringed, please contact us at legal@r1x.io with:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm sm:text-base">
                <li>Description of the copyrighted work or intellectual property</li>
                <li>Location of the allegedly infringing material</li>
                <li>Your contact information</li>
                <li>Statement of good faith belief that use is unauthorized</li>
                <li>Statement that information is accurate and you are authorized to act</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Disclaimer of Warranties</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                <strong>USE OF r1x SERVICES IS AT YOUR OWN RISK.</strong> Services are provided "as is" and "as available" without warranties of any kind, whether express or implied.
              </p>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                r1x does not guarantee that Services will be uninterrupted, secure, or error-free. Blockchain technology involves inherent risks, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm sm:text-base">
                <li>Technical failures or network issues</li>
                <li>Smart contract vulnerabilities</li>
                <li>Loss of funds due to errors or malicious activity</li>
                <li>Regulatory changes affecting blockchain technology</li>
                <li>Market volatility</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Limitation of Liability</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, r1x SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm sm:text-base">
                <li>Loss of funds or cryptocurrency</li>
                <li>Loss of profits or business opportunities</li>
                <li>Data loss or corruption</li>
                <li>Service interruptions or unavailability</li>
                <li>Errors or omissions in Services</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Cryptocurrency and Blockchain Risks</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                <strong>IMPORTANT RISK DISCLOSURE:</strong> Cryptocurrency and blockchain transactions involve substantial risk. You acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm sm:text-base">
                <li>Cryptocurrency values are highly volatile and may result in total loss</li>
                <li>Blockchain transactions are irreversible and cannot be undone</li>
                <li>You are solely responsible for securing your wallet and private keys</li>
                <li>r1x cannot recover lost funds or compromised wallets</li>
                <li>Regulatory changes may affect the legality or operation of blockchain services</li>
                <li>Smart contracts may contain bugs or vulnerabilities</li>
                <li>You should only invest what you can afford to lose</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Dispute Resolution</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                Any disputes arising from or relating to r1x Services shall be resolved through binding arbitration in accordance with applicable arbitration rules, unless otherwise required by law.
              </p>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                You waive any right to participate in class action lawsuits or class-wide arbitrations against r1x.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Governing Law</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                These legal terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>No Financial Advice</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                r1x does not provide financial, investment, legal, or tax advice. Information provided through our Services is for informational purposes only. You should consult with qualified professionals before making financial or investment decisions.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Third-Party Services</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                r1x Services may integrate with or link to third-party services, including Base blockchain, wallets, and other decentralized applications. We are not responsible for the availability, content, or practices of third-party services.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Updates to Legal Information</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                We may update this legal information from time to time. Material changes will be posted on our website with an updated "Last Updated" date. Continued use of Services after changes constitutes acceptance of updated terms.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Contact</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                For legal inquiries, please contact:<br />
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

