'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Footer from '@/components/Footer';
import CryptoLogo from '@/components/CryptoLogo';
import ServiceScreenshot from '@/components/ServiceScreenshot';
import { useWallet } from '@/hooks/useWallet';
import { useAccount, useChainId } from 'wagmi';
import { base } from 'wagmi/chains';
import { modal } from '@/lib/wallet-provider';
import { X402Client } from '@/lib/payments/x402Client';
import { getX402ServerUrlAsync } from '@/lib/x402-server-url';
import { MarketplaceService } from '@/lib/types/x402';
import { SolanaPaymentClient } from '@/lib/solana-payment-client';
import { getRuntimeConfig } from '@/lib/runtime-config';

// Dynamically import Header to prevent SSR issues with WalletProvider context
const Header = dynamic(() => import('@/components/Header'), { ssr: false });

export default function MarketplaceContent() {
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [network, setNetwork] = useState<string>('base');
  // Get wallet info once at page-level to avoid per-card subscriptions
  const wallet = useWallet();
  const { isConnected: wagmiConnected } = useAccount();
  const chainId = useChainId();

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  const fetchServices = async (retry = false) => {
    try {
      setLoading(true);
      // If retrying, skip sync to avoid infinite loop
      const baseUrl = '/api/marketplace/services';
      const params = new URLSearchParams();
      params.set('network', network);
      if (retry) params.set('skipSync', 'true');
      const url = `${baseUrl}?${params.toString()}`;
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

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(services.map(s => s.category)))],
    [services]
  );

  const filteredServices = useMemo(
    () => (selectedCategory === 'all' ? services : services.filter(s => s.category === selectedCategory)),
    [services, selectedCategory]
  );

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12">
              <p 
                className="text-lg sm:text-xl text-gray-700"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
              >
                Discover x402 services, tokens, and resources. Pay-per-use access to AI, APIs, compute, and more.
              </p>
              <a
                href="/marketplace/submit"
                className="px-6 py-3 bg-[#FF4D00] text-white rounded-lg hover:opacity-90 transition-opacity inline-flex items-center justify-center"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '14px' }}
              >
                List your x402 service
              </a>
            </div>

            {/* Network Selector */}
            <div className="flex flex-wrap gap-3 mb-6">
              {['base', 'solana'].map((net) => (
                <motion.button
                  key={net}
                  onClick={() => setNetwork(net)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    network === net
                      ? 'bg-[#FF4D00] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-[#FF4D00]'
                  }`}
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '12px' }}
                >
                  {net === 'base' ? 'Base (EVM)' : 'Solana'}
                </motion.button>
              ))}
            </div>

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
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    index={index} 
                    currentNetwork={network}
                    // Pass wallet data once instead of subscribing per card
                    walletAddress={wallet.address || undefined}
                    walletClient={wallet.walletClient as any}
                    wagmiConnected={wagmiConnected}
                    chainId={chainId}
                  />
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

const ServiceCard = memo(function ServiceCard({ 
  service, 
  index, 
  currentNetwork,
  walletAddress,
  walletClient,
  wagmiConnected,
  chainId,
}: { 
  service: MarketplaceService; 
  index: number; 
  currentNetwork: string;
  walletAddress?: string;
  walletClient: any | null;
  wagmiConnected: boolean;
  chainId: number;
}) {
  // Use parent-provided wallet details to avoid per-card subscriptions
  const address = walletAddress;
  const [isProcessing, setIsProcessing] = useState(false);
  const [x402ServerUrl, setX402ServerUrl] = useState<string | null>(null);

  // Initialize X402Client
  const x402Client = useMemo(() => {
    if (!walletClient) return null;
    try {
      return new X402Client({
        walletClient,
        maxValue: BigInt(100 * 10 ** 6), // 100 USDC max
      });
    } catch (err) {
      console.error('[Marketplace] Failed to initialize X402Client:', err);
      return null;
    }
  }, [walletClient]);

  // Fetch x402 server URL
  useEffect(() => {
    getX402ServerUrlAsync().then(url => {
      setX402ServerUrl(url);
    }).catch(err => {
      console.error('[Marketplace] Failed to get x402 server URL:', err);
    });
  }, []);

  const handlePurchase = async () => {
    // Check wallet connection
    if (!wagmiConnected || !x402Client) {
      modal.open();
      alert('Please connect your wallet to purchase services');
      return;
    }

    if (service.network === 'base') {
      if (chainId !== base.id) {
        alert('Please switch to Base network');
        return;
      }
    } else if (service.network === 'solana') {
      // Solana purchase flow
      setIsProcessing(true);
      try {
        // Load runtime config from Railway
        const runtime = await getRuntimeConfig();
        const feePercentage = parseFloat(runtime.platformFeePercentage || '5');
        const solanaFeeRecipient = runtime.solanaFeeRecipient || 'FJ1D5BAoHJpTfahmd8Ridq6kDciJq8d5XNU7WnwKExoz';

        // Get Solana wallet (Phantom or Solflare)
        const solanaWallet = (window as any).phantom?.solana || (window as any).solflare;
        if (!solanaWallet || !solanaWallet.isConnected) {
          modal.open();
          alert('Please connect your Solana wallet (Phantom or Solflare) to purchase services');
          setIsProcessing(false);
          return;
        }

        // Initialize Solana payment client
        const solanaClient = new SolanaPaymentClient(solanaWallet);

        const basePrice = parseFloat(service.price);
        
        // Calculate fee (only for external services)
        let feeAmount = '0';
        if (service.isExternal) {
          feeAmount = (basePrice * feePercentage / 100).toFixed(6);
        }

        // For external services: pay fee then service
        // For our services: just pay service (no separate fee)
        if (service.isExternal && parseFloat(feeAmount) > 0) {
          // Pay fee first
          const feeRecipient = solanaFeeRecipient;
          const feeResult = await solanaClient.transferUSDC({
            to: feeRecipient,
            amount: feeAmount,
          });

          // Call fee endpoint
          const feeResponse = await fetch('/api/x402/solana/fee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              proof: feeResult.proof,
              feeAmount,
            }),
          });

          if (!feeResponse.ok) {
            const errTxt = await feeResponse.text();
            throw new Error(`Fee payment failed: ${errTxt}`);
          }

          // Pay service
          if (!service.endpoint) {
            alert('This service does not expose a direct purchase endpoint. Please open the service page.');
            setIsProcessing(false);
            return;
          }

          const serviceResult = await solanaClient.transferUSDC({
            to: service.merchant || service.endpoint,
            amount: service.price,
          });

          // Call service payment endpoint
          const serviceResponse = await fetch('/api/x402/solana/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: service.id,
              serviceName: service.name,
              proof: serviceResult.proof,
            }),
          });

          if (!serviceResponse.ok) {
            const errTxt = await serviceResponse.text();
            throw new Error(`Service payment failed: ${errTxt}`);
          }

          const serviceData = await serviceResponse.json();
          alert(`✅ Purchase successful! ${serviceData.message || 'Service accessed.'}`);
        } else {
          // Our services: single payment (no fee)
          if (!service.endpoint) {
            alert('This service does not expose a direct purchase endpoint. Please open the service page.');
            setIsProcessing(false);
            return;
          }

          const serviceResult = await solanaClient.transferUSDC({
            to: service.merchant || service.endpoint,
            amount: service.price,
          });

          // Call service payment endpoint
          const serviceResponse = await fetch('/api/x402/solana/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: service.id,
              serviceName: service.name,
              proof: serviceResult.proof,
            }),
          });

          if (!serviceResponse.ok) {
            const errTxt = await serviceResponse.text();
            throw new Error(`Service payment failed: ${errTxt}`);
          }

          const serviceData = await serviceResponse.json();
          alert(`✅ Purchase successful! ${serviceData.message || 'Service accessed.'}`);
        }
      } catch (error: any) {
        console.error('[Marketplace] Solana purchase error:', error);
        alert(`Purchase failed: ${error.message || 'Unknown error'}`);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // We primarily use same-origin proxies; x402 server URL is not strictly required here

    setIsProcessing(true);
    try {
      const basePrice = parseFloat(service.price);
      // Load runtime config for platform fee percentage
      const runtime = await getRuntimeConfig();
      const feePercentage = parseFloat(runtime.platformFeePercentage || '5');
      
      // Calculate fee (only for external services)
      let feeAmount = '0';
      if (service.isExternal) {
        feeAmount = (basePrice * feePercentage / 100).toFixed(6);
      }

      // For external services: pay fee then service
      // For our services: just pay service (no separate fee)
      if (service.isExternal && parseFloat(feeAmount) > 0) {
        if (!service.endpoint) {
          alert('This service does not expose a direct purchase endpoint. Please open the service page.');
          return;
        }
        const feeEndpoint = `/api/fees/collect`; // same-origin proxy to avoid CORS
        
        // Dual x402 payments: fee then service
        const { feeResponse, serviceResponse } = await x402Client.payFeeThenPurchase({
          feeEndpoint,
          feeAmount,
          service: {
            id: service.id,
            name: service.name,
            endpoint: service.endpoint || '',
            price: service.price,
            priceWithFee: service.priceWithFee,
            isExternal: service.isExternal,
          },
        });

        // Get payment receipts from headers (raw, will decode server-side)
        const feePaymentResponse = feeResponse.headers.get('x-payment-response');
        const servicePaymentResponse = serviceResponse.headers.get('x-payment-response');

        // Log purchases to our API
        try {
          await fetch('/api/purchases/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: service.id,
              serviceName: service.name,
              payer: address,
              feeReceipt: feePaymentResponse, // Raw header value
              serviceReceipt: servicePaymentResponse, // Raw header value
              feeAmount,
              servicePrice: service.price,
              type: 'external',
            }),
          });
        } catch (logError) {
          console.error('[Marketplace] Failed to log purchase:', logError);
          // Don't fail the purchase if logging fails
        }

        const serviceData = await serviceResponse.json();
        alert(`✅ Purchase successful! ${serviceData.message || 'Service accessed.'}`);
      } else {
        if (!service.endpoint) {
          alert('This service does not expose a direct purchase endpoint. Please open the service page.');
          return;
        }
        // Our services: single x402 payment (no fee)
        const response = await x402Client.purchaseService({
          id: service.id,
          name: service.name,
          endpoint: service.endpoint,
          price: service.price,
          isExternal: false,
        });

        const servicePaymentResponse = response.headers.get('x-payment-response');

        // Log purchase
        try {
          await fetch('/api/purchases/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceId: service.id,
              serviceName: service.name,
              payer: address,
              serviceReceipt: servicePaymentResponse, // Raw header value
              servicePrice: service.price,
              type: 'internal',
            }),
          });
        } catch (logError) {
          console.error('[Marketplace] Failed to log purchase:', logError);
        }

        const serviceData = await response.json();
        alert(`✅ Purchase successful! ${serviceData.message || 'Service accessed.'}`);
      }
    } catch (error: any) {
      console.error('[Marketplace] Purchase error:', error);
      alert(`Purchase failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
    >
      {/* Service Screenshot - Use cached screenshotUrl if available, fallback to websiteUrl */}
      {(service.screenshotUrl || service.websiteUrl) && (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
          <ServiceScreenshot 
            url={service.screenshotUrl || service.websiteUrl || ''} 
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
            {service.x402Ready !== false && (
              <span 
                className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                title="x402-compatible endpoint"
              >
                x402 Ready
              </span>
            )}
            {service.verified && (
              <span 
                className="text-xs text-purple-600 px-2 py-1 bg-purple-50 rounded"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                title="Ownership verified"
              >
                ✓ Verified
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

    </motion.div>
  );
});

