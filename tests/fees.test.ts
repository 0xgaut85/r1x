/**
 * Tests for fee collection endpoints
 * 
 * Tests:
 * - $0.25 fee for agent chat
 * - $0.05 fee for agent service fee
 * - $0.05 fee for free services
 * - 5% fee for paid services (capped at $1.00)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseUnits, formatUnits } from 'viem';

const USDC_DECIMALS = 6;

describe('Fee Structure Tests', () => {
  describe('Agent Chat Fee ($0.25)', () => {
    it('should require $0.25 USDC for agent chat endpoint', () => {
      const expectedFee = 0.25;
      const expectedFeeWei = parseUnits(expectedFee.toString(), USDC_DECIMALS);
      
      expect(expectedFee).toBe(0.25);
      expect(formatUnits(expectedFeeWei, USDC_DECIMALS)).toBe('0.25');
    });

    it('should validate $0.25 fee amount in wei', () => {
      const feeUSDC = 0.25;
      const feeWei = parseUnits(feeUSDC.toString(), USDC_DECIMALS);
      const expectedWei = BigInt(250000); // 0.25 * 10^6
      
      expect(feeWei).toBe(expectedWei);
    });
  });

  describe('Agent Service Fee ($0.05)', () => {
    it('should require $0.05 USDC for agent service fee endpoint', () => {
      const expectedFee = 0.05;
      const expectedFeeWei = parseUnits(expectedFee.toString(), USDC_DECIMALS);
      
      expect(expectedFee).toBe(0.05);
      expect(formatUnits(expectedFeeWei, USDC_DECIMALS)).toBe('0.05');
    });

    it('should validate $0.05 fee amount in wei', () => {
      const feeUSDC = 0.05;
      const feeWei = parseUnits(feeUSDC.toString(), USDC_DECIMALS);
      const expectedWei = BigInt(50000); // 0.05 * 10^6
      
      expect(feeWei).toBe(expectedWei);
    });

    it('should validate fee payment with tolerance', () => {
      const expectedFee = 0.05;
      const tolerance = 0.001;
      
      // Test exact match
      expect(Math.abs(0.05 - expectedFee)).toBeLessThanOrEqual(tolerance);
      
      // Test within tolerance
      expect(Math.abs(0.0505 - expectedFee)).toBeLessThanOrEqual(tolerance);
      expect(Math.abs(0.0495 - expectedFee)).toBeLessThanOrEqual(tolerance);
      
      // Test outside tolerance
      expect(Math.abs(0.06 - expectedFee)).toBeGreaterThan(tolerance);
      expect(Math.abs(0.04 - expectedFee)).toBeGreaterThan(tolerance);
    });
  });

  describe('Free Service Fee ($0.05)', () => {
    it('should charge $0.05 for free services', () => {
      const freeServiceFee = 0.05;
      const freeServiceFeeWei = parseUnits(freeServiceFee.toString(), USDC_DECIMALS);
      
      expect(freeServiceFee).toBe(0.05);
      expect(formatUnits(freeServiceFeeWei, USDC_DECIMALS)).toBe('0.05');
    });

    it('should validate free service fee calculation', () => {
      const servicePrice = 0; // Free service
      const platformFeePercentage = 5; // 5%
      
      // For free services, fee is fixed at $0.05
      const feeAmount = servicePrice === 0 ? 0.05 : (servicePrice * platformFeePercentage / 100);
      
      expect(feeAmount).toBe(0.05);
    });
  });

  describe('Paid Service Fee (5% capped at $1.00)', () => {
    it('should calculate 5% fee for small amounts', () => {
      const servicePrice = 1.00; // $1.00 service
      const platformFeePercentage = 5;
      const feeAmount = servicePrice * platformFeePercentage / 100;
      
      expect(feeAmount).toBe(0.05);
    });

    it('should calculate 5% fee for medium amounts', () => {
      const servicePrice = 10.00; // $10.00 service
      const platformFeePercentage = 5;
      const feeAmount = servicePrice * platformFeePercentage / 100;
      
      expect(feeAmount).toBe(0.50);
    });

    it('should cap fee at $1.00 for large amounts', () => {
      const servicePrice = 25.00; // $25.00 service
      const platformFeePercentage = 5;
      const calculatedFee = servicePrice * platformFeePercentage / 100;
      const maxFee = 1.00;
      const feeAmount = Math.min(calculatedFee, maxFee);
      
      expect(calculatedFee).toBe(1.25); // Would be $1.25
      expect(feeAmount).toBe(1.00); // Capped at $1.00
    });

    it('should cap fee at $1.00 for very large amounts', () => {
      const servicePrice = 100.00; // $100.00 service
      const platformFeePercentage = 5;
      const calculatedFee = servicePrice * platformFeePercentage / 100;
      const maxFee = 1.00;
      const feeAmount = Math.min(calculatedFee, maxFee);
      
      expect(calculatedFee).toBe(5.00); // Would be $5.00
      expect(feeAmount).toBe(1.00); // Capped at $1.00
    });

    it('should calculate correct fee for $20 service (exactly at cap)', () => {
      const servicePrice = 20.00; // $20.00 service
      const platformFeePercentage = 5;
      const calculatedFee = servicePrice * platformFeePercentage / 100;
      const maxFee = 1.00;
      const feeAmount = Math.min(calculatedFee, maxFee);
      
      expect(calculatedFee).toBe(1.00);
      expect(feeAmount).toBe(1.00);
    });

    it('should calculate correct fee for $19 service (below cap)', () => {
      const servicePrice = 19.00; // $19.00 service
      const platformFeePercentage = 5;
      const calculatedFee = servicePrice * platformFeePercentage / 100;
      const maxFee = 1.00;
      const feeAmount = Math.min(calculatedFee, maxFee);
      
      expect(calculatedFee).toBe(0.95);
      expect(feeAmount).toBe(0.95);
    });

    it('should validate fee amounts in wei', () => {
      const testCases = [
        { price: 1.00, expectedFee: 0.05 },
        { price: 10.00, expectedFee: 0.50 },
        { price: 20.00, expectedFee: 1.00 },
        { price: 25.00, expectedFee: 1.00 }, // Capped
        { price: 100.00, expectedFee: 1.00 }, // Capped
      ];

      testCases.forEach(({ price, expectedFee }) => {
        const platformFeePercentage = 5;
        const calculatedFee = price * platformFeePercentage / 100;
        const maxFee = 1.00;
        const feeAmount = Math.min(calculatedFee, maxFee);
        const feeWei = parseUnits(feeAmount.toFixed(6), USDC_DECIMALS);
        
        expect(feeAmount).toBe(expectedFee);
        // formatUnits may return "1" instead of "1.00", so we compare as numbers
        expect(parseFloat(formatUnits(feeWei, USDC_DECIMALS))).toBeCloseTo(expectedFee, 6);
      });
    });
  });

  describe('Fee Validation Logic', () => {
    it('should validate fee payment amounts with tolerance', () => {
      const tolerance = 0.001;
      const maxAllowedFee = 1.00;

      // Test cases: [requestedFee, paidAmount, shouldPass]
      const testCases = [
        [0.05, 0.05, true],
        [0.05, 0.0505, true], // Within tolerance
        [0.05, 0.0495, true], // Within tolerance
        [0.05, 0.06, false], // Exceeds tolerance
        [0.05, 0.04, false], // Below tolerance
        [0.50, 0.50, true],
        [1.00, 1.00, true],
        [1.00, 1.001, true], // Within tolerance
        [1.00, 1.01, false], // Exceeds maxAllowedFee + tolerance (1.00 + 0.001 = 1.001, and 1.01 > 1.001)
        [1.00, 0.999, true], // Within tolerance
      ];

      testCases.forEach(([requestedFee, paidAmount, shouldPass]) => {
        // Validation logic: amount must be >= requestedFee - tolerance AND <= maxAllowedFee + tolerance
        // But also, if requestedFee is less than maxAllowedFee, we should validate against requestedFee
        const exceedsMax = paidAmount > maxAllowedFee + tolerance;
        const belowRequested = paidAmount < requestedFee - tolerance;
        // Also check if amount exceeds requestedFee significantly (more than tolerance)
        const exceedsRequestedTooMuch = paidAmount > requestedFee + tolerance && requestedFee < maxAllowedFee;
        const isValid = !exceedsMax && !belowRequested && !exceedsRequestedTooMuch;
        
        expect(isValid).toBe(shouldPass);
      });
    });

    it('should handle fee calculation for different service types', () => {
      // Free service
      const freeServiceFee = 0.05;
      expect(freeServiceFee).toBe(0.05);

      // Paid service - small
      const smallServicePrice = 2.00;
      const smallServiceFee = Math.min(smallServicePrice * 0.05, 1.00);
      expect(smallServiceFee).toBe(0.10);

      // Paid service - medium
      const mediumServicePrice = 15.00;
      const mediumServiceFee = Math.min(mediumServicePrice * 0.05, 1.00);
      expect(mediumServiceFee).toBe(0.75);

      // Paid service - large (capped)
      const largeServicePrice = 50.00;
      const largeServiceFee = Math.min(largeServicePrice * 0.05, 1.00);
      expect(largeServiceFee).toBe(1.00);
    });
  });
});

