'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OverviewCards from './OverviewCards';
import PurchasesList from './PurchasesList';
import ResultsList from './ResultsList';

interface AgentLeftSidebarProps {
  address: string | undefined;
  isConnected: boolean;
  onReRun?: (serviceId: string) => void;
}

export default function AgentLeftSidebar({ address, isConnected, onReRun }: AgentLeftSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!isConnected || !address) {
    return null;
  }

  return (
    <>
      {/* Mobile toggle button */}
      <motion.button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-40 w-10 h-10 bg-[#111111] border border-[#1A1A1A] rounded-lg flex items-center justify-center"
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.03)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5H17M3 10H17M3 15H17" stroke="#E5E5E5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-80 xl:w-96 h-screen fixed left-0 top-0 bg-[#0A0A0A] border-r border-[#1A1A1A] z-30">
        <div className="flex-1 overflow-y-auto p-6 r1x-agent-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 77, 0, 0.2) transparent' }}>
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                Overview
              </h2>
              <OverviewCards address={address} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                Recent Purchases
              </h2>
              <PurchasesList address={address} limit={5} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                Service Results
              </h2>
              <ResultsList address={address} limit={5} />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-md z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden flex flex-col w-80 h-screen fixed left-0 top-0 bg-[#0A0A0A] border-r border-[#1A1A1A] z-50"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#1A1A1A]">
                <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                  Dashboard
                </h2>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1A1A1A] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4L12 12M12 4L4 12" stroke="#999" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 r1x-agent-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 77, 0, 0.2) transparent' }}>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                      Overview
                    </h2>
                    <OverviewCards address={address} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                      Recent Purchases
                    </h2>
                    <PurchasesList address={address} limit={5} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'TWKEverett-Regular, sans-serif' }}>
                      Service Results
                    </h2>
                    <ResultsList address={address} limit={5} />
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

