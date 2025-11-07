'use client';
import { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import Footer from '@/components/Footer';

const Header = dynamicImport(() => import('@/components/Header'), { ssr: false });

export default function ClientForm() {
  const { address, isConnected } = useWallet();
  const { isConnected: wagmiConnected } = useAccount();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [formData, setFormData] = useState({
    endpoint: '',
    name: '',
    description: '',
    category: 'Other',
    websiteUrl: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/marketplace/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ownerAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit service');
        return;
      }

      setSuccess(`Service submitted successfully! Service ID: ${data.serviceId}`);
      
      // Redirect to marketplace after 2 seconds
      setTimeout(() => {
        router.push('/marketplace');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <Header />
      <main className="pt-24 md:pt-[138.641px]">
        <section style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ fontFamily: 'TWKEverett-Regular, sans-serif', color: '#000000' }}
            >
              List your x402 service
            </h1>
            <p 
              className="text-base sm:text-lg mb-8 text-gray-700"
              style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
            >
              Submit your x402-compatible endpoint to the marketplace. Your endpoint will be preflighted to verify it returns a valid 402 Payment Required response.
            </p>

            {!isConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  Please connect your wallet to submit a service.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  {error}
                </p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  {success}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  Endpoint URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  placeholder="https://your-service.com/api/endpoint"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                />
                <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  Must return 402 Payment Required with valid x402 schema
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Awesome Service"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what your service does..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                >
                  <option value="Other">Other</option>
                  <option value="AI">AI</option>
                  <option value="Data">Data</option>
                  <option value="Mint">Mint</option>
                  <option value="Content">Content</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}>
                  Website URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://your-website.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4D00] focus:border-transparent"
                  style={{ fontFamily: 'TWKEverettMono-Regular, monospace' }}
                />
              </div>

              <button
                type="submit"
                disabled={!isConnected || submitting}
                className="w-full px-6 py-3 bg-[#FF4D00] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '14px' }}
              >
                {submitting ? 'Submitting...' : 'Submit Service'}
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


