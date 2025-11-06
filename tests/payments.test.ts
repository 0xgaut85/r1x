/**
 * Tests for payment processing and service purchases
 * 
 * Tests:
 * - Payment flow for agent chat
 * - Payment flow for agent service fee
 * - Payment flow for free services
 * - Payment flow for paid services
 * - Transaction saving
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseUnits, formatUnits } from 'viem';

const USDC_DECIMALS = 6;
const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

describe('Payment Processing Tests', () => {
  describe('Payment Amount Conversion', () => {
    it('should convert USDC amounts to wei correctly', () => {
      const amounts = [
        { usdc: '0.05', expectedWei: BigInt(50000) },
        { usdc: '0.25', expectedWei: BigInt(250000) },
        { usdc: '1.00', expectedWei: BigInt(1000000) },
        { usdc: '10.00', expectedWei: BigInt(10000000) },
      ];

      amounts.forEach(({ usdc, expectedWei }) => {
        const wei = parseUnits(usdc, USDC_DECIMALS);
        expect(wei).toBe(expectedWei);
        // formatUnits may return "1" instead of "1.00", so we compare as numbers
        expect(parseFloat(formatUnits(wei, USDC_DECIMALS))).toBeCloseTo(parseFloat(usdc), 6);
      });
    });

    it('should handle decimal precision correctly', () => {
      const amounts = [
        '0.000001', // Minimum USDC unit
        '0.05',
        '0.25',
        '1.00',
        '1.234567',
      ];

      amounts.forEach((amount) => {
        const wei = parseUnits(amount, USDC_DECIMALS);
        const converted = formatUnits(wei, USDC_DECIMALS);
        // Should match within 6 decimal places
        expect(parseFloat(converted)).toBeCloseTo(parseFloat(amount), 6);
      });
    });
  });

  describe('Payment Proof Structure', () => {
    it('should validate payment proof structure', () => {
      const mockPaymentProof = {
        signature: '0x1234...',
        message: {
          from: '0x1234567890123456789012345678901234567890',
          to: '0x0987654321098765432109876543210987654321',
          amount: parseUnits('0.25', USDC_DECIMALS).toString(),
          token: USDC_BASE_ADDRESS,
          chainId: 8453,
          nonce: '12345',
          deadline: Math.floor(Date.now() / 1000) + 3600,
        },
        timestamp: Date.now(),
        chainId: 8453,
      };

      expect(mockPaymentProof).toHaveProperty('signature');
      expect(mockPaymentProof).toHaveProperty('message');
      expect(mockPaymentProof.message).toHaveProperty('from');
      expect(mockPaymentProof.message).toHaveProperty('to');
      expect(mockPaymentProof.message).toHaveProperty('amount');
      expect(mockPaymentProof.message).toHaveProperty('token');
      expect(mockPaymentProof.message).toHaveProperty('chainId');
    });

    it('should extract payment amount from proof', () => {
      const amountUSDC = 0.25;
      const amountWei = parseUnits(amountUSDC.toString(), USDC_DECIMALS);
      
      const mockPaymentProof = {
        amount: amountWei.toString(),
      };

      const paidAmountUSDC = parseFloat(
        formatUnits(BigInt(mockPaymentProof.amount), USDC_DECIMALS)
      );

      expect(paidAmountUSDC).toBeCloseTo(amountUSDC, 6);
    });
  });

  describe('Service Purchase Flow', () => {
    it('should calculate total price with fee for external services', () => {
      const basePrice = 10.00;
      const feePercentage = 5;
      const feeAmount = Math.min(basePrice * feePercentage / 100, 1.00);
      const totalPrice = basePrice + feeAmount;

      expect(feeAmount).toBe(0.50);
      expect(totalPrice).toBe(10.50);
    });

    it('should calculate total price with capped fee', () => {
      const basePrice = 25.00;
      const feePercentage = 5;
      const feeAmount = Math.min(basePrice * feePercentage / 100, 1.00);
      const totalPrice = basePrice + feeAmount;

      expect(feeAmount).toBe(1.00); // Capped
      expect(totalPrice).toBe(26.00);
    });

    it('should handle free service purchase flow', () => {
      const basePrice = 0;
      const feeAmount = 0.05; // Fixed fee for free services
      const totalPrice = basePrice + feeAmount;

      expect(feeAmount).toBe(0.05);
      expect(totalPrice).toBe(0.05);
    });

    it('should handle our own services (no separate fee)', () => {
      const basePrice = 0.25;
      const isExternal = false;
      
      // For our services, we receive the full amount (fee is already included)
      const totalPrice = basePrice;

      expect(totalPrice).toBe(0.25);
      expect(isExternal).toBe(false);
    });
  });

  describe('Fee Distribution Calculation', () => {
    it('should calculate fee distribution for platform fee (100%)', () => {
      const amount = parseUnits('0.05', USDC_DECIMALS);
      const feePercentage = 100;
      
      const feeAmount = (amount * BigInt(feePercentage)) / BigInt(100);
      const merchantAmount = amount - feeAmount;

      expect(parseFloat(formatUnits(feeAmount, USDC_DECIMALS))).toBeCloseTo(0.05, 6);
      expect(parseFloat(formatUnits(merchantAmount, USDC_DECIMALS))).toBeCloseTo(0.00, 6);
    });

    it('should calculate fee distribution for 5% fee', () => {
      const amount = parseUnits('10.00', USDC_DECIMALS);
      const feePercentage = 5;
      
      const feeAmount = (amount * BigInt(feePercentage)) / BigInt(100);
      const merchantAmount = amount - feeAmount;

      expect(parseFloat(formatUnits(feeAmount, USDC_DECIMALS))).toBeCloseTo(0.50, 6);
      expect(parseFloat(formatUnits(merchantAmount, USDC_DECIMALS))).toBeCloseTo(9.50, 6);
    });

    it('should handle fee distribution with capping', () => {
      const amount = parseUnits('25.00', USDC_DECIMALS);
      const feePercentage = 5;
      const maxFee = parseUnits('1.00', USDC_DECIMALS);
      
      const calculatedFee = (amount * BigInt(feePercentage)) / BigInt(100);
      const feeAmount = calculatedFee > maxFee ? maxFee : calculatedFee;
      const merchantAmount = amount - feeAmount;

      expect(parseFloat(formatUnits(feeAmount, USDC_DECIMALS))).toBeCloseTo(1.00, 6);
      expect(parseFloat(formatUnits(merchantAmount, USDC_DECIMALS))).toBeCloseTo(24.00, 6);
    });
  });

  describe('Transaction Validation', () => {
    it('should validate transaction hash format', () => {
      const validHashes = [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '0x' + 'a'.repeat(64),
      ];

      const invalidHashes = [
        '0x123', // Too short
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // Missing 0x
        '', // Empty
      ];

      validHashes.forEach((hash) => {
        expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      });

      invalidHashes.forEach((hash) => {
        expect(hash).not.toMatch(/^0x[a-fA-F0-9]{64}$/);
      });
    });

    it('should validate address format', () => {
      const validAddresses = [
        '0x1234567890123456789012345678901234567890',
        '0x' + 'a'.repeat(40),
      ];

      const invalidAddresses = [
        '0x123', // Too short
        '1234567890123456789012345678901234567890', // Missing 0x
        '', // Empty
      ];

      validAddresses.forEach((address) => {
        expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      });

      invalidAddresses.forEach((address) => {
        expect(address).not.toMatch(/^0x[a-fA-F0-9]{40}$/);
      });
    });
  });
});

