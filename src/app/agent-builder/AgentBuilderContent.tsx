'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AgentBackground from '@/components/r1x-agent/AgentBackground';
import WalletButton from '@/components/WalletButton';
import WalletConnectionSection from '@/components/agent-builder/WalletConnectionSection';
import AgentCanvas from '@/components/agent-builder/AgentCanvas';
import ContextBuilder from '@/components/agent-builder/ContextBuilder';
import ActionBuilder from '@/components/agent-builder/ActionBuilder';
import X402Integration from '@/components/agent-builder/X402Integration';
import ServiceDiscovery from '@/components/agent-builder/ServiceDiscovery';
import { FadeInUp } from '@/components/motion';

export default function AgentBuilderContent() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'context' | 'action' | 'x402' | 'discovery'>('canvas');

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <AgentBackground />
      
      {/* Header */}
      <motion.div 
        className="fixed top-6 right-6 z-50 flex gap-3 items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <WalletButton variant="agent" />
        <motion.a
          href="/"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 bg-white/95 backdrop-blur-md text-black transition-all duration-300"
          style={{
            fontFamily: 'TWKEverettMono-Regular, monospace',
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.5px',
            clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          Home
        </motion.a>
      </motion.div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-[40px]">
        <div className="max-w-7xl mx-auto">
          <FadeInUp delay={0.1}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 
                className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight"
                style={{
                  fontWeight: 400,
                  fontFamily: 'TWKEverett-Regular, sans-serif',
                  letterSpacing: '-2px',
                }}
              >
                Build AI Agents That Pay.
                <br />
                <span className="text-[#FF4D00]">Deploy Agents That Earn.</span>
              </h1>
              <p 
                className="text-white/70 text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl"
                style={{
                  fontFamily: 'BaselGrotesk-Regular, sans-serif',
                  lineHeight: '1.6',
                }}
              >
                No-code platform for building stateful AI agents with built-in x402 payment capabilities. 
                <strong className="text-white"> Zapier meets AutoGPT meets crypto wallets.</strong>
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-[#FF4D00] text-black"
                  style={{
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                    fontSize: '14px',
                    fontWeight: 400,
                    clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                  }}
                >
                  COMING SOON
                </motion.div>
                <motion.a
                  href="https://t.me/r1xbuilders"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 border border-white/20 text-white hover:border-[#FF4D00] transition-colors"
                  style={{
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                    fontSize: '14px',
                    fontWeight: 400,
                    clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                  }}
                >
                  JOIN EARLY ACCESS
                </motion.a>
              </div>
            </motion.div>
          </FadeInUp>
        </div>
      </section>

      {/* Wallet Connection Section */}
      <section className="relative px-4 sm:px-6 md:px-8 lg:px-10 xl:px-[40px] py-12">
        <div className="max-w-7xl mx-auto">
          <WalletConnectionSection />
        </div>
      </section>

      {/* Main Builder Interface */}
      <section className="relative px-4 sm:px-6 md:px-8 lg:px-10 xl:px-[40px] py-12">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-4 mb-8 border-b border-white/10 pb-4">
            {[
              { id: 'canvas', label: 'Workflow Canvas' },
              { id: 'context', label: 'Context Builder' },
              { id: 'action', label: 'Action Builder' },
              { id: 'x402', label: 'x402 Integration' },
              { id: 'discovery', label: 'Service Discovery' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-[#FF4D00] border-b-2 border-[#FF4D00]'
                    : 'text-white/50 hover:text-white/80'
                }`}
                style={{
                  fontFamily: 'TWKEverettMono-Regular, monospace',
                  fontSize: '13px',
                  fontWeight: 400,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {activeTab === 'canvas' && <AgentCanvas />}
            {activeTab === 'context' && <ContextBuilder />}
            {activeTab === 'action' && <ActionBuilder />}
            {activeTab === 'x402' && <X402Integration />}
            {activeTab === 'discovery' && <ServiceDiscovery />}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="relative px-4 sm:px-6 md:px-8 lg:px-10 xl:px-[40px] py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p 
            className="text-white/50 text-sm mb-4"
            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
          >
            r1x Agent Builder is currently in development.
          </p>
          <p 
            className="text-white/70 text-base"
            style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}
          >
            Join our{' '}
            <a 
              href="https://t.me/r1xbuilders" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#FF4D00] hover:underline"
            >
              Telegram
            </a>
            {' '}to be notified when early access opens.
          </p>
        </div>
      </section>
    </div>
  );
}



