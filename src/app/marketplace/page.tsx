'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamicImport from 'next/dynamic';
import Footer from '@/components/Footer';
import PaymentModal from '@/components/PaymentModal';
import CryptoLogo from '@/components/CryptoLogo';
import ServiceScreenshot from '@/components/ServiceScreenshot';
// No longer need x402-server-url - using Next.js API routes (same origin)
import { MarketplaceService, PaymentQuote, PaymentProof } from '@/lib/types/x402';

// Dynamically import Header to prevent SSR issues with WalletProvider context
const Header = dynamicImport(() => import('@/components/Header'), { ssr: false });

export const dynamic = 'force-dynamic';

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
      // Request payment quote via Next.js API route (proxies to Express server)
      // Using same origin eliminates CORS issues
      console.log('[Marketplace] Fetching payment quote from:', '/api/x402/pay');
      
      // Calculate total price (add 5% fee for external services)
      const basePrice = parseFloat(service.price);
      const totalPrice = service.isExternal && service.priceWithFee 
        ? service.priceWithFee 
        : service.price; // Our services don't add fee on top
      
      const response = await fetch('/api/x402/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          price: totalPrice, // Use total price (with fee if external)
          basePrice: basePrice.toString(), // Original price before fee
          isExternal: service.isExternal || false,
          endpoint: service.endpoint,
        }),
      });

      console.log('[Marketplace] Payment quote response status:', response.status);

      if (response.status === 402) {
        // Payment required - extract quote
        const data = await response.json();
        console.log('[Marketplace] Payment quote received:', data);
        
        // Handle x402scan format (accepts array) or PayAI format (payment/quote)
        let quote: PaymentQuote | null = null;
        
        if (data.accepts && Array.isArray(data.accepts) && data.accepts[0]) {
          // x402scan format - convert accepts[0] to PaymentQuote
          const accept = data.accepts[0];
          const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
          
          quote = {
            amount: accept.maxAmountRequired || '0',
            token: accept.asset || USDC_BASE,
            merchant: accept.payTo || '',
            facilitator: accept.extra?.facilitator || undefined,
            deadline: Date.now() + (accept.maxTimeoutSeconds || 3600) * 1000,
            nonce: accept.extra?.nonce || `${Date.now()}-${Math.random()}`,
            chainId: accept.extra?.chainId || 8453,
          };
        } else if (data.payment) {
          // PayAI format with payment object
          const payment = data.payment;
          quote = {
            amount: payment.amountRaw || payment.amount || '0',
            token: payment.token || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            merchant: payment.merchant || '',
            facilitator: payment.facilitator || undefined,
            deadline: payment.deadline || Date.now() + 3600000,
            nonce: payment.nonce || `${Date.now()}-${Math.random()}`,
            chainId: payment.chainId || 8453,
          };
        } else if (data.quote) {
          // Direct quote format
          quote = data.quote;
        }
        
        if (quote) {
          setPaymentQuote(quote);
          setShowPaymentModal(true);
        } else {
          console.error('[Marketplace] Invalid payment quote format:', data);
          throw new Error('Invalid payment quote format. Expected accepts array, payment object, or quote.');
        }
      } else if (response.ok) {
        // Already paid or free
        const data = await response.json();
        alert('Access granted!');
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error: any) {
      console.error('[Marketplace] Purchase error:', error);
      let errorMessage = 'Failed to process purchase';
      
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError' || error.message.includes('network')) {
        errorMessage = `Cannot connect to x402 server. Please check:\n1. Next.js API route is accessible (/api/x402/pay)\n2. X402_SERVER_URL is set in Railway (for server-side proxy)\n3. Express server is running and accessible\n\nError: ${error.message}`;
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      alert(errorMessage);
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
      {/* Service Screenshot */}
      {service.websiteUrl && (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
          <ServiceScreenshot 
            url={service.websiteUrl} 
            alt={service.name}
            width={400}
            height={250}
            className="w-full"
          />
        </div>
      )}
      
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
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded"
              style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
            >
              {service.category}
            </span>
            {service.tokenSymbol && service.tokenSymbol !== 'USDC' && (
              <span 
                className="text-xs text-[#FF4D00] px-2 py-1 bg-orange-50 rounded flex items-center gap-1"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                title={`Token: ${service.token}`}
              >
                <CryptoLogo symbol={service.tokenSymbol} size={14} />
                {service.tokenSymbol}
              </span>
            )}
            {service.isExternal && (
              <span 
                className="text-xs text-blue-600 px-2 py-1 bg-blue-50 rounded"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
              >
                PayAI
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {service.isExternal && service.priceWithFee ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span 
                    className="text-2xl font-bold"
                    style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}
                  >
                    {service.priceWithFee}
                  </span>
                  <span 
                    className="text-sm text-gray-600 flex items-center gap-1"
                    style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                  >
                    <CryptoLogo symbol={service.tokenSymbol || 'USDC'} size={16} />
                    {service.tokenSymbol || 'USDC'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs text-gray-600"
                    style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                  >
                    {service.price} {service.tokenSymbol || 'USDC'} base
                  </span>
                  <span 
                    className="text-xs text-[#FF4D00] font-semibold"
                    style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                  >
                    +5% platform fee
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-baseline gap-1">
                <span 
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}
                >
                  {service.price}
                </span>
                <span 
                  className="text-sm text-gray-600 flex items-center gap-1"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                >
                  <CryptoLogo symbol={service.tokenSymbol || 'USDC'} size={16} />
                  {service.tokenSymbol || 'USDC'}
                </span>
              </div>
            )}
          </div>
          {service.endpoint && (
            <div className="mt-2">
              <span 
                className="text-xs text-gray-400 break-all"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                title={service.endpoint}
              >
                {service.endpoint.length > 40 ? `${service.endpoint.substring(0, 40)}...` : service.endpoint}
              </span>
            </div>
          )}
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

