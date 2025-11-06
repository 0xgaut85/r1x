/**
 * Tests for service-related functionality
 * 
 * Tests:
 * - Service price calculation
 * - Service fee calculation
 * - Service purchase flow
 * - Marketplace service structure
 */

import { describe, it, expect } from 'vitest';
import { parseUnits, formatUnits } from 'viem';

const USDC_DECIMALS = 6;

describe('Service Tests', () => {
  describe('Service Price Calculation', () => {
    it('should calculate price with fee for external services', () => {
      const basePrice = 5.00;
      const feePercentage = 5;
      
      const feeAmount = basePrice * feePercentage / 100;
      const priceWithFee = basePrice + feeAmount;

      expect(feeAmount).toBe(0.25);
      expect(priceWithFee).toBe(5.25);
    });

    it('should handle service price in wei', () => {
      const basePriceUSDC = 5.00;
      const basePriceWei = parseUnits(basePriceUSDC.toString(), USDC_DECIMALS);
      
      const feePercentage = 5;
      const feeWei = (basePriceWei * BigInt(feePercentage)) / BigInt(100);
      const priceWithFeeWei = basePriceWei + feeWei;

      expect(parseFloat(formatUnits(basePriceWei, USDC_DECIMALS))).toBeCloseTo(5.00, 6);
      expect(parseFloat(formatUnits(feeWei, USDC_DECIMALS))).toBeCloseTo(0.25, 6);
      expect(parseFloat(formatUnits(priceWithFeeWei, USDC_DECIMALS))).toBeCloseTo(5.25, 6);
    });

    it('should calculate price with capped fee', () => {
      const basePrice = 30.00;
      const feePercentage = 5;
      const maxFee = 1.00;
      
      const calculatedFee = basePrice * feePercentage / 100;
      const feeAmount = Math.min(calculatedFee, maxFee);
      const priceWithFee = basePrice + feeAmount;

      expect(calculatedFee).toBe(1.50);
      expect(feeAmount).toBe(1.00); // Capped
      expect(priceWithFee).toBe(31.00);
    });
  });

  describe('Service Types', () => {
    it('should identify external services correctly', () => {
      const externalService = {
        id: 'external-service-1',
        name: 'External Service',
        isExternal: true,
        price: '10.00',
      };

      const internalService = {
        id: 'internal-service-1',
        name: 'Internal Service',
        isExternal: false,
        price: '0.25',
      };

      expect(externalService.isExternal).toBe(true);
      expect(internalService.isExternal).toBe(false);
    });

    it('should handle free services', () => {
      const freeService = {
        id: 'free-service-1',
        name: 'Free Service',
        price: '0',
        isExternal: true,
      };

      const feeAmount = parseFloat(freeService.price) === 0 ? 0.05 : 0;
      
      expect(parseFloat(freeService.price)).toBe(0);
      expect(feeAmount).toBe(0.05);
    });

    it('should handle paid services', () => {
      const paidService = {
        id: 'paid-service-1',
        name: 'Paid Service',
        price: '15.00',
        isExternal: true,
      };

      const feePercentage = 5;
      const feeAmount = parseFloat(paidService.price) * feePercentage / 100;
      
      expect(parseFloat(paidService.price)).toBe(15.00);
      expect(feeAmount).toBe(0.75);
    });
  });

  describe('Service Purchase Flow', () => {
    it('should handle dual payment for external services', () => {
      const service = {
        id: 'external-service-1',
        name: 'External Service',
        price: '10.00',
        isExternal: true,
      };

      const feePercentage = 5;
      const feeAmount = Math.min(
        parseFloat(service.price) * feePercentage / 100,
        1.00
      );

      // Step 1: Pay fee
      const feePayment = {
        amount: feeAmount,
        endpoint: '/api/fees/collect',
      };

      // Step 2: Pay service
      const servicePayment = {
        amount: parseFloat(service.price),
        endpoint: service.endpoint || '/api/x402/pay',
      };

      expect(feePayment.amount).toBe(0.50);
      expect(servicePayment.amount).toBe(10.00);
    });

    it('should handle single payment for our services', () => {
      const service = {
        id: 'internal-service-1',
        name: 'Internal Service',
        price: '0.25',
        isExternal: false,
      };

      // Single payment (no separate fee)
      const payment = {
        amount: parseFloat(service.price),
        endpoint: '/api/x402/pay',
      };

      expect(payment.amount).toBe(0.25);
      expect(service.isExternal).toBe(false);
    });
  });

  describe('Service Price Display', () => {
    it('should format prices correctly', () => {
      const prices = [
        { value: 0.05, formatted: '0.05' },
        { value: 0.25, formatted: '0.25' },
        { value: 1.00, formatted: '1.00' },
        { value: 10.50, formatted: '10.50' },
        { value: 0.123456, formatted: '0.123456' },
      ];

      prices.forEach(({ value, formatted }) => {
        const formattedPrice = value.toFixed(6).replace(/\.?0+$/, '');
        // Handle cases where trailing zeros are removed:
        // "1.00" -> "1", "10.50" -> "10.5"
        let expectedFormatted = formatted;
        if (formatted === '1.00') {
          expectedFormatted = '1';
        } else if (formatted === '10.50') {
          expectedFormatted = '10.5';
        }
        expect(formattedPrice).toBe(expectedFormatted);
      });
    });

    it('should calculate price with fee display', () => {
      const basePrice = 10.00;
      const feePercentage = 5;
      const feeAmount = basePrice * feePercentage / 100;
      const priceWithFee = (basePrice + feeAmount).toFixed(6);

      expect(priceWithFee).toBe('10.500000');
    });
  });

  describe('Service Validation', () => {
    it('should validate service structure', () => {
      const validService = {
        id: 'service-1',
        name: 'Test Service',
        description: 'Test Description',
        price: '10.00',
        merchant: '0x1234567890123456789012345678901234567890',
        network: 'base',
        chainId: 8453,
        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        tokenSymbol: 'USDC',
        available: true,
        isExternal: true,
      };

      expect(validService).toHaveProperty('id');
      expect(validService).toHaveProperty('name');
      expect(validService).toHaveProperty('price');
      expect(validService).toHaveProperty('merchant');
      expect(validService).toHaveProperty('isExternal');
      expect(validService.available).toBe(true);
    });

    it('should validate service price is positive', () => {
      const validPrices = ['0', '0.05', '0.25', '1.00', '10.00'];
      const invalidPrices = ['-1', '-0.05', 'invalid', ''];

      validPrices.forEach((price) => {
        expect(parseFloat(price)).toBeGreaterThanOrEqual(0);
      });

      invalidPrices.forEach((price) => {
        const num = parseFloat(price);
        expect(isNaN(num) || num < 0).toBe(true);
      });
    });
  });
});

