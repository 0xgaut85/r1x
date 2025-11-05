'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import WalletButton with SSR disabled to avoid WagmiProvider issues
const WalletButton = dynamic(() => import('@/components/WalletButton'), { ssr: false });

export default function Header() {
  const [isUtilitiesMenuOpen, setIsUtilitiesMenuOpen] = useState(false);
  const [comingSoonItems, setComingSoonItems] = useState<Set<string>>(new Set());

  const handleComingSoonClick = (e: React.MouseEvent<HTMLAnchorElement>, item: string) => {
    e.preventDefault();
    setComingSoonItems(prev => new Set(prev).add(item));
    
    // Remove after 3 seconds
    setTimeout(() => {
      setComingSoonItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item);
        return newSet;
      });
    }, 3000);
  };

  const isComingSoonVisible = (item: string) => comingSoonItems.has(item);

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: '#000000', padding: '25px 0', position: 'fixed', width: '100%' }}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center" style={{ height: 'auto', minHeight: '138.641px' }}>
          <div className="flex items-center">
            <a href="/" className="flex items-center transform transition-transform duration-300 hover:scale-105">
              <img src="/logosvg.svg" alt="r1x" className="h-8 w-auto" />
            </a>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm font-medium text-white hover:text-white/80 transition-colors duration-200">HOME</a>
            <a href="/docs" className="text-sm font-medium text-white hover:text-white/80 transition-colors duration-200">DOCS</a>
          </div>
          <button 
            onClick={() => setIsUtilitiesMenuOpen(!isUtilitiesMenuOpen)}
            className="flex items-center justify-center text-white transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
              padding: '8px 16px',
              clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
              fontFamily: 'TWKEverettMono-Regular, monospace',
              fontSize: '12px',
              fontWeight: 400,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label="r1x Utilities"
          >
            r1x Utilities
          </button>
          <AnimatePresence>
            {isUtilitiesMenuOpen && (
              <>
                {/* Overlay backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setIsUtilitiesMenuOpen(false)}
                  className="fixed inset-0 bg-black/50 z-30"
                  style={{ top: '138.641px' }}
                />
                {/* Menu panel - slides from right to left */}
                <motion.div
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ 
                    type: "spring",
                    damping: 25,
                    stiffness: 200,
                    opacity: { duration: 0.2 }
                  }}
                  className="fixed top-[138.641px] right-0 w-full max-w-sm bg-white border-l border-gray-200 shadow-2xl z-40 h-[calc(100vh-138.641px)] overflow-y-auto"
                  style={{ marginTop: '0px' }}
                >
                  <div className="px-6 py-8 space-y-6">
                    <h3 className="text-black text-lg font-medium mb-6" style={{ fontFamily: 'TWKEverettMono-Regular, monospace', color: '#000000' }}>
                      r1x Utilities
                    </h3>
                    <a 
                      href="/r1x-agent" 
                      className="block text-sm text-[#FF4D00] hover:text-[#FF4D00] py-3 transition-colors duration-200 relative overflow-hidden"
                      style={{ minHeight: '44px', display: 'flex', alignItems: 'center', fontFamily: 'TWKEverettMono-Regular, monospace', color: '#FF4D00' }}
                    >
                      R1X AGENT
                    </a>
                    <a 
                      href="/r1x-plug" 
                      onClick={(e) => handleComingSoonClick(e, 'r1x-plug')}
                      className="block text-sm text-gray-700 hover:text-black py-3 transition-colors duration-200 relative overflow-hidden"
                      style={{ minHeight: '44px', display: 'flex', alignItems: 'center', fontFamily: 'TWKEverettMono-Regular, monospace' }}
                    >
                      <AnimatePresence mode="wait">
                        {isComingSoonVisible('r1x-plug') ? (
                          <motion.div
                            key="coming-soon"
                            initial={{ opacity: 0, scale: 0.8, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="coming-soon-box"
                            style={{
                              backgroundColor: '#FF4D00',
                              color: '#000000',
                              padding: '8px 16px',
                              clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                              fontFamily: 'TWKEverettMono-Regular, monospace',
                              fontSize: '12px',
                              fontWeight: 400,
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              width: '100%',
                              display: 'inline-block'
                            }}
                          >
                            Coming soon
                          </motion.div>
                        ) : (
                          <motion.span
                            key="text"
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          >
                            R1X PLUG
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </a>
                    <a 
                      href="/r1x-sdk" 
                      onClick={(e) => handleComingSoonClick(e, 'r1x-sdk')}
                      className="block text-sm text-gray-700 hover:text-black py-3 transition-colors duration-200 relative overflow-hidden"
                      style={{ minHeight: '44px', display: 'flex', alignItems: 'center', fontFamily: 'TWKEverettMono-Regular, monospace' }}
                    >
                      <AnimatePresence mode="wait">
                        {isComingSoonVisible('r1x-sdk') ? (
                          <motion.div
                            key="coming-soon"
                            initial={{ opacity: 0, scale: 0.8, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="coming-soon-box"
                            style={{
                              backgroundColor: '#FF4D00',
                              color: '#000000',
                              padding: '8px 16px',
                              clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                              fontFamily: 'TWKEverettMono-Regular, monospace',
                              fontSize: '12px',
                              fontWeight: 400,
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              width: '100%',
                              display: 'inline-block'
                            }}
                          >
                            Coming soon
                          </motion.div>
                        ) : (
                          <motion.span
                            key="text"
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          >
                            R1X SDK
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </a>
                    <a 
                      href="/marketplace" 
                      className="block text-sm text-gray-700 hover:text-black py-3 transition-colors duration-200 relative overflow-hidden"
                      style={{ minHeight: '44px', display: 'flex', alignItems: 'center', fontFamily: 'TWKEverettMono-Regular, monospace' }}
                    >
                      R1X MARKETPLACE
                    </a>
                    <div className="border-t border-black my-3" style={{ borderColor: '#000000', borderWidth: '1px' }}></div>
                    <a 
                      href="/user-panel" 
                      className="block text-sm text-gray-700 hover:text-black py-3 transition-colors duration-200 relative overflow-hidden"
                      style={{ minHeight: '44px', display: 'flex', alignItems: 'center', fontFamily: 'TWKEverettMono-Regular, monospace' }}
                    >
                      USER PANEL
                    </a>
                    <a 
                      href="/platform-panel" 
                      className="block text-sm text-gray-700 hover:text-black py-3 transition-colors duration-200 relative overflow-hidden"
                      style={{ minHeight: '44px', display: 'flex', alignItems: 'center', fontFamily: 'TWKEverettMono-Regular, monospace' }}
                    >
                      PLATFORM PANEL
                    </a>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          <div className="hidden md:flex items-center gap-4">
            <WalletButton />
            <a href="#" className="text-white hover:text-white/80 icon-transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="text-white hover:text-white/80 icon-transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.56c-.507.912-1.586 1.514-2.736 1.514-1.32 0-2.392-.737-2.892-1.896-.51-1.16-.51-2.682 0-3.842.5-1.16 1.572-1.897 2.892-1.897 1.15 0 2.229.602 2.736 1.514l1.873-1.096c-.88-1.508-2.565-2.471-4.609-2.471-2.724 0-4.934 2.08-5.64 4.862-.706 2.782-.706 5.936 0 8.718.706 2.782 2.916 4.862 5.64 4.862 2.044 0 3.729-.963 4.609-2.471l-1.873-1.096z"/></svg>
            </a>
            <a href="#" className="text-white hover:text-white/80 icon-transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            </a>
            <a href="#" className="text-white hover:text-white/80 icon-transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

