'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ServiceDiscovery() {
  const [selectedNetwork, setSelectedNetwork] = useState<'all' | 'base' | 'solana'>('all');

  // Mock services for display
  const mockServices = [
    {
      id: '1',
      name: 'AI Inference API',
      description: 'High-performance LLM inference',
      price: '0.25',
      network: 'base',
      category: 'AI',
    },
    {
      id: '2',
      name: 'Image Generation',
      description: 'Generate images from text prompts',
      price: '0.50',
      network: 'solana',
      category: 'Media',
    },
    {
      id: '3',
      name: 'Data Processing',
      description: 'Process large datasets',
      price: '1.00',
      network: 'base',
      category: 'Compute',
    },
    {
      id: '4',
      name: 'Voice Synthesis',
      description: 'Text-to-speech conversion',
      price: '0.15',
      network: 'solana',
      category: 'Media',
    },
    {
      id: '5',
      name: 'Code Analysis',
      description: 'Automated code review and security scanning',
      price: '0.35',
      network: 'base',
      category: 'Development',
    },
    {
      id: '6',
      name: 'Market Research',
      description: 'Real-time market data and sentiment analysis',
      price: '0.75',
      network: 'solana',
      category: 'Data',
    },
    {
      id: '7',
      name: 'Content Moderation',
      description: 'AI-powered content filtering and safety checks',
      price: '0.20',
      network: 'base',
      category: 'Safety',
    },
    {
      id: '8',
      name: 'API Aggregation',
      description: 'Multi-source API proxy and data aggregation',
      price: '0.40',
      network: 'solana',
      category: 'Infrastructure',
    },
    {
      id: '9',
      name: 'PayAI',
      description: 'x402 payment facilitator and verification service',
      price: '0.10',
      network: 'base',
      category: 'Payment',
    },
    {
      id: '10',
      name: 'Base Network',
      description: 'Base L2 infrastructure and RPC services',
      price: '0.05',
      network: 'base',
      category: 'Infrastructure',
    },
    {
      id: '11',
      name: 'Daydreams',
      description: 'Stateful agent runtime and context management',
      price: '0.30',
      network: 'solana',
      category: 'Platform',
    },
    {
      id: '12',
      name: 'Solana',
      description: 'Solana network RPC and transaction services',
      price: '0.08',
      network: 'solana',
      category: 'Infrastructure',
    },
  ];

  const filteredServices = selectedNetwork === 'all' 
    ? mockServices 
    : mockServices.filter(s => s.network === selectedNetwork);

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
          Service Discovery
        </h2>
        <p 
          className="text-white/60 text-sm mb-6"
          style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}
        >
          Browse and integrate x402 services from the r1x Marketplace. Agents automatically discover and evaluate services.
        </p>
      </div>

      {/* Network Filter */}
      <div className="flex gap-3">
        {[
          { id: 'all', label: 'ALL NETWORKS' },
          { id: 'base', label: 'BASE' },
          { id: 'solana', label: 'SOLANA' },
        ].map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => setSelectedNetwork(filter.id as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 transition-all ${
              selectedNetwork === filter.id
                ? 'bg-[#FF4D00] text-black'
                : 'bg-white/10 text-white/60 hover:text-white'
            }`}
            style={{
              fontFamily: 'TWKEverettMono-Regular, monospace',
              fontSize: '12px',
              fontWeight: 400,
              clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)',
            }}
          >
            {filter.label}
          </motion.button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((service, idx) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-lg hover:border-[#FF4D00]/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 
                  className="text-white text-lg mb-1"
                  style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}
                >
                  {service.name}
                </h3>
                <p 
                  className="text-white/60 text-sm mb-3"
                  style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}
                >
                  {service.description}
                </p>
              </div>
              <div className={`px-3 py-1 rounded text-xs ${
                service.network === 'base' 
                  ? 'bg-[#FF4D00]/20 text-[#FF4D00]' 
                  : 'bg-[#00D4FF]/20 text-[#00D4FF]'
              }`}
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
              >
                {service.network.toUpperCase()}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white/40 text-xs" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  PRICE:
                </span>
                <span className="text-white ml-2 text-lg font-medium">
                  {service.price} USDC
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20"
                style={{
                  fontFamily: 'TWKEverettMono-Regular, monospace',
                  clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)',
                }}
                disabled
              >
                ADD TO AGENT
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Agent Discovery Info */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
        <h3 
          className="text-white text-lg mb-4"
          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
        >
          AUTOMATIC SERVICE DISCOVERY
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-[#FF4D00] rounded-full mt-2" />
            <div>
              <p className="text-white/80 text-sm mb-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                <strong className="text-white">Real-time Discovery:</strong> Agents automatically discover new services from the marketplace
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-[#FF4D00] rounded-full mt-2" />
            <div>
              <p className="text-white/80 text-sm mb-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                <strong className="text-white">Price Comparison:</strong> Agents evaluate and compare prices across services
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-[#FF4D00] rounded-full mt-2" />
            <div>
              <p className="text-white/80 text-sm mb-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                <strong className="text-white">Network Selection:</strong> Agents choose optimal network based on price and availability
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Example */}
      <div className="bg-black/60 border border-white/10 p-6 rounded-lg">
        <h3 
          className="text-white text-lg mb-4"
          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
        >
          INTEGRATION EXAMPLE
        </h3>
        <pre className="text-white/80 text-xs font-mono overflow-x-auto">
          <code>{`// Agent automatically discovers and integrates services
const agent = createAgent({
  serviceDiscovery: {
    enabled: true,
    networks: ['base', 'solana'],
    autoSelect: true, // Auto-select best service
  },
});

// When agent needs a service:
// 1. Queries marketplace API
// 2. Compares prices and availability
// 3. Selects optimal service
// 4. Integrates automatically
// 5. Handles x402 payment flow`}</code>
        </pre>
      </div>
    </div>
  );
}

