'use client';

import { motion } from 'framer-motion';

export default function AgentCanvas() {
  // Placeholder nodes for the visual workflow builder - using brand orange variations
  const nodes = [
    { 
      id: 'context', 
      type: 'context', 
      x: 50, 
      y: 120, 
      label: 'User Context', 
      color: '#FF4D00',
      icon: 'C',
      description: 'Stateful context'
    },
    { 
      id: 'action1', 
      type: 'action', 
      x: 320, 
      y: 120, 
      label: 'Process Request', 
      color: '#FF6B35',
      icon: 'A',
      description: 'Agent action'
    },
    { 
      id: 'x402', 
      type: 'x402', 
      x: 590, 
      y: 120, 
      label: 'x402 Payment', 
      color: '#FF8C5A',
      icon: '$',
      description: 'Payment flow'
    },
    { 
      id: 'output', 
      type: 'output', 
      x: 860, 
      y: 120, 
      label: 'Response', 
      color: '#FFAD7F',
      icon: '→',
      description: 'Final output'
    },
  ];

  // Example fee calculation
  const exampleServicePrice = 0.25;
  const platformFeePercentage = 5;
  const platformFee = (exampleServicePrice * platformFeePercentage / 100).toFixed(4);
  const merchantAmount = (exampleServicePrice - parseFloat(platformFee)).toFixed(4);

  return (
    <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-8 min-h-[600px] overflow-hidden">
      <div className="mb-6 relative z-10">
        <h2 
          className="text-white text-2xl mb-2"
          style={{
            fontFamily: 'TWKEverett-Regular, sans-serif',
            fontWeight: 400,
            letterSpacing: '-1px',
          }}
        >
          Visual Workflow Builder
        </h2>
        <p 
          className="text-white/60 text-sm"
          style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}
        >
          Drag and drop to compose agent workflows. Connect contexts, actions, and x402 services.
        </p>
      </div>

      {/* Clean Canvas Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 77, 0, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 77, 0, 0.08) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Canvas Area */}
      <div className="relative z-10" style={{ minHeight: '500px' }}>
        {/* Clean Nodes */}
        {nodes.map((node, idx) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
            className="absolute cursor-move group"
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              width: '200px',
              zIndex: 10,
            }}
            whileHover={{ scale: 1.03, y: -2 }}
          >
            <div
              className="relative p-4 border rounded-lg backdrop-blur-sm transition-all duration-200"
              style={{
                borderColor: `${node.color}60`,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                boxShadow: `0 2px 12px ${node.color}20`,
              }}
            >
              <div className="flex items-center gap-3 mb-2" style={{ listStyle: 'none' }}>
                <div
                  className="w-8 h-8 flex items-center justify-center text-white text-sm font-medium"
                  style={{
                    fontFamily: 'TWKEverettMono-Regular, monospace',
                  }}
                >
                  {node.icon}
                </div>
                <div className="flex-1 min-w-0" style={{ listStyle: 'none' }}>
                  <div
                    className="text-white text-sm font-medium truncate"
                    style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}
                  >
                    {node.label}
                  </div>
                  <span 
                    className="text-white/40 text-xs block agent-node-type"
                    style={{ 
                      fontFamily: 'TWKEverettMono-Regular, monospace',
                      listStyle: 'none',
                      listStyleType: 'none',
                      paddingLeft: 0,
                      marginLeft: 0,
                    }}
                  >
                    {node.type}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* r1x Fee Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-black/60 border border-[#FF4D00]/30 rounded-lg p-5 relative z-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-[#FF4D00] rounded-full" />
          <h3 
            className="text-white text-sm"
            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
          >
            r1x PLATFORM FEE
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-white/50 text-xs mb-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              SERVICE PRICE
            </div>
            <div className="text-white text-lg font-medium" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
              {exampleServicePrice} USDC
            </div>
          </div>
          <div>
            <div className="text-white/50 text-xs mb-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              r1x FEE ({platformFeePercentage}%)
            </div>
            <div className="text-[#FF4D00] text-lg font-medium" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
              {platformFee} USDC
            </div>
          </div>
          <div>
            <div className="text-white/50 text-xs mb-1" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
              MERCHANT RECEIVES
            </div>
            <div className="text-white text-lg font-medium" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
              {merchantAmount} USDC
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/50 text-xs" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
            Platform fees are automatically calculated and transferred on-chain for every transaction.
          </p>
        </div>
      </motion.div>

      {/* Clean Toolbar */}
      <div className="mt-6 flex flex-wrap gap-3 relative z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 hover:border-[#FF4D00]/50 transition-all duration-200"
          style={{
            fontFamily: 'TWKEverettMono-Regular, monospace',
            clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)',
          }}
        >
          + ADD CONTEXT
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 hover:border-[#FF4D00]/50 transition-all duration-200"
          style={{
            fontFamily: 'TWKEverettMono-Regular, monospace',
            clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)',
          }}
        >
          + ADD ACTION
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 hover:border-[#FF4D00]/50 transition-all duration-200"
          style={{
            fontFamily: 'TWKEverettMono-Regular, monospace',
            clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)',
          }}
        >
          + ADD x402 SERVICE
        </motion.button>
      </div>

      {/* Clean Info Box */}
      <div className="mt-6 bg-white/5 border border-white/10 p-4 rounded relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-1 h-4 bg-[#FF4D00] rounded-full mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-white/70 text-xs leading-relaxed" style={{ fontFamily: 'BaselGrotesk-Regular, sans-serif' }}>
              Drag nodes to reposition. Click to configure. Connect contexts using context.use() patterns inspired by Dreams SDK.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

