'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaymentModal from '@/components/PaymentModal';
import { getX402ServerUrlAsync } from '@/lib/x402-server-url';
import { MarketplaceService, PaymentQuote, PaymentProof } from '@/lib/types/x402';

export default function MarketplacePage() {
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async (retry = false) => {
    try {
      setLoading(true);
      // If retrying, skip sync to avoid infinite loop
      const url = retry ? '/api/marketplace/services?skipSync=true' : '/api/marketplace/services';
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.services && data.services.length > 0) {
        setServices(data.services);
      } else if (!retry) {
        // If no services and first attempt, wait a bit and retry (sync might be in progress)
        console.log('No services found, waiting for sync to complete...');
        setTimeout(() => fetchServices(true), 2000);
        return;
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px]">
        <section style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8"
              style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}
            >
              r1x Marketplace
            </h1>
            <p 
              className="text-lg sm:text-xl mb-8 sm:mb-12 text-gray-700"
              style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
            >
              Discover x402 services, tokens, and resources. Pay-per-use access to AI, APIs, compute, and more.
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-[#FF4D00] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-[#FF4D00]'
                  }`}
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.button>
              ))}
            </div>

            {/* Services Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF4D00]"></div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>No services found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service, index) => (
                  <ServiceCard key={service.id} service={service} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ServiceCard({ service, index }: { service: MarketplaceService; index: number }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentQuote, setPaymentQuote] = useState<PaymentQuote | null>(null);

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      // Request payment quote from Express Railway server
      const x402ServerUrl = await getX402ServerUrlAsync();
      const response = await fetch(`${x402ServerUrl}/api/x402/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          amount: service.price,
        }),
      });

      if (response.status === 402) {
        // Payment required - extract quote
        const data = await response.json();
        // Express Railway returns payment quote in data.payment or data.quote
        const quote = data.payment || data.quote;
        if (quote) {
          setPaymentQuote(quote);
          setShowPaymentModal(true);
        } else {
          throw new Error('Invalid payment quote format');
        }
      } else if (response.ok) {
        // Already paid or free
        const data = await response.json();
        alert('Access granted!');
      } else {
        throw new Error('Failed to get payment quote');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to process purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (proof: PaymentProof) => {
    // Payment verification is handled automatically by Express Railway middleware
    // If we get here, payment was successful
    try {
      setShowPaymentModal(false);
      alert('Payment successful! Access granted.');
    } catch (error) {
      console.error('Payment success handling error:', error);
      alert('Payment successful, but error processing access');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="mb-4">
        <h3 
          className="text-xl font-semibold mb-2"
          style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}
        >
          {service.name}
        </h3>
        <p 
          className="text-sm text-gray-600 mb-4"
          style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
        >
          {service.description}
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <span 
            className="text-xs text-gray-500"
            style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
          >
            {service.category}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span 
              className="text-2xl font-bold"
              style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}
            >
              {service.price}
            </span>
            <span 
              className="text-sm text-gray-600"
              style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
            >
              USDC
            </span>
          </div>
        </div>
      </div>

      <motion.button
        onClick={handlePurchase}
        disabled={!service.available || isProcessing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-4 py-2 bg-[#FF4D00] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
        style={{
          fontFamily: 'TWKEverettMono-Regular, monospace',
          fontSize: '12px',
          clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
        }}
      >
        {isProcessing ? 'Processing...' : 'Purchase'}
      </motion.button>

      {!service.available && (
        <p className="text-xs text-red-500 mt-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
          Currently unavailable
        </p>
      )}

      <AnimatePresence>
        {showPaymentModal && paymentQuote && (
          <PaymentModal
            quote={paymentQuote}
            serviceName={service.name}
            onSuccess={handlePaymentSuccess}
            onCancel={() => {
              setShowPaymentModal(false);
              setPaymentQuote(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

