/**
 * Tests for 402 preflight validation
 * Tests Base and Solana network detection
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { preflight402Endpoint } from '@/lib/marketplace/preflight';

// Mock fetch globally
global.fetch = vi.fn();

describe('402 Preflight Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Base Network Detection', () => {
    it('should detect Base network from 402 response', async () => {
      const mockResponse = {
        status: 402,
        headers: new Headers(),
        text: async () => JSON.stringify({
          accepts: [{
            payTo: '0x1234567890123456789012345678901234567890',
            facilitatorUrl: 'https://facilitator.payai.network',
            asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            network: 'base',
            chainId: 8453,
            maxAmountRequired: '1000000', // 1 USDC
          }],
        }),
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await preflight402Endpoint('https://example.com/api/service');

      expect(result.success).toBe(true);
      expect(result.network).toBe('base');
      expect(result.chainId).toBe(8453);
      expect(result.payTo).toBe('0x1234567890123456789012345678901234567890');
    });
  });

  describe('Solana Network Detection', () => {
    it('should detect Solana network from 402 response', async () => {
      const mockResponse = {
        status: 402,
        headers: new Headers(),
        text: async () => JSON.stringify({
          accepts: [{
            payTo: 'FJ1D5BAoHJpTfahmd8Ridq6kDciJq8d5XNU7WnwKExoz',
            facilitatorUrl: 'https://facilitator.daydreams.systems',
            network: 'solana',
            maxAmountRequired: '250000', // 0.25 USDC
          }],
        }),
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await preflight402Endpoint('https://example.com/api/solana-service');

      expect(result.success).toBe(true);
      expect(result.network).toBe('solana');
      expect(result.chainId).toBe(0);
      expect(result.payTo).toBe('FJ1D5BAoHJpTfahmd8Ridq6kDciJq8d5XNU7WnwKExoz');
    });
  });

  describe('Invalid Endpoints', () => {
    it('should reject non-HTTPS endpoints', async () => {
      const result = await preflight402Endpoint('http://example.com/api');
      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTPS');
    });

    it('should reject invalid URL format', async () => {
      const result = await preflight402Endpoint('not-a-url');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should reject endpoints that do not return 402', async () => {
      const mockResponse = {
        status: 200,
        headers: new Headers(),
        text: async () => JSON.stringify({ data: 'success' }),
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await preflight402Endpoint('https://example.com/api');
      expect(result.success).toBe(false);
      expect(result.error).toContain('402');
    });

    it('should reject 402 responses without accepts array', async () => {
      const mockResponse = {
        status: 402,
        headers: new Headers(),
        text: async () => JSON.stringify({ error: 'Payment required' }),
      };

      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await preflight402Endpoint('https://example.com/api');
      expect(result.success).toBe(false);
      expect(result.error).toContain('accepts');
    });
  });

  describe('Timeout Handling', () => {
    it('should handle timeout errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('timeout'));

      const result = await preflight402Endpoint('https://example.com/api');
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});


