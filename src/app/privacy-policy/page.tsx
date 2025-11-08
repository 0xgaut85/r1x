'use client';

import dynamicImport from 'next/dynamic';
import Footer from '@/components/Footer';

const Header = dynamicImport(() => import('@/components/Header'), { ssr: false });

export const dynamic = 'force-dynamic';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12" style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}>
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', color: '#333333' }}>
            <p className="text-sm sm:text-base mb-6">
              <strong>Last Updated:</strong> October 2025
            </p>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>1. Introduction</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                Welcome to r1x ("we," "our," or "us"). r1x is a decentralized payment infrastructure enabling the machine economy, built on Base. We are committed to protecting your privacy and ensuring transparency about how we collect, use, and protect your information.
              </p>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                This Privacy Policy explains how we handle information when you use our services, including r1x Agent, RX1 Builder, r1x SDK, and r1x Marketplace (collectively, "Services").
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>2. Information We Collect</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6" style={{ color: '#000000' }}>2.1 Blockchain Data</h3>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                Since r1x operates on Base blockchain, all transactions are publicly recorded on-chain. We may access and analyze publicly available blockchain data related to your interactions with our Services.
              </p>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6" style={{ color: '#000000' }}>2.2 Usage Information</h3>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                We collect information about how you interact with our Services, including API usage, service requests, and platform activity. This helps us improve our Services and maintain security.
              </p>

              <h3 className="text-lg sm:text-xl font-semibold mb-3 mt-6" style={{ color: '#000000' }}>2.3 Technical Information</h3>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                We may collect technical information such as IP addresses, device information, browser type, and timestamps for security and analytics purposes.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>3. How We Use Your Information</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm sm:text-base">
                <li>Provide, maintain, and improve our Services</li>
                <li>Process transactions and payments on the Base blockchain</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Communicate with you about our Services</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>4. Decentralized Nature</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                r1x is built on decentralized infrastructure. Your transactions occur directly on the Base blockchain without requiring traditional account creation or personal information. We do not store or control your private keys or wallet credentials.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>5. Data Sharing</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                We do not sell your personal information. We may share information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm sm:text-base">
                <li>With service providers who assist in operating our Services</li>
                <li>When required by law or legal process</li>
                <li>To protect our rights, property, or safety</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>6. Security</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                We implement security measures to protect information, but blockchain transactions are irreversible. You are responsible for securing your wallet and private keys. We cannot recover lost funds or compromised wallets.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>7. Your Rights</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-sm sm:text-base">
                <li>Access information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information (subject to legal requirements)</li>
                <li>Opt-out of certain communications</li>
              </ul>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>8. Cookies and Tracking</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                We may use cookies and similar technologies to enhance your experience, analyze usage, and improve our Services. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>9. Children's Privacy</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                Our Services are not intended for individuals under 18 years of age. We do not knowingly collect information from children.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>10. Changes to This Policy</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our website and updating the "Last Updated" date.
              </p>
            </section>

            <section className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>11. Contact Us</h2>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                Email: privacy@r1x.io<br />
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

