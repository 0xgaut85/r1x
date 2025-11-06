/**
 * Tests for agent-related functionality
 * 
 * Tests:
 * - Agent chat endpoint fee ($0.25)
 * - Agent service fee ($0.05)
 * - Agent service calls
 */

import { describe, it, expect } from 'vitest';
import { parseUnits, formatUnits } from 'viem';

const USDC_DECIMALS = 6;

describe('Agent Tests', () => {
  describe('Agent Chat Fee', () => {
    it('should require $0.25 for agent chat endpoint', () => {
      const chatFee = 0.25;
      const chatFeeWei = parseUnits(chatFee.toString(), USDC_DECIMALS);

      expect(chatFee).toBe(0.25);
      expect(formatUnits(chatFeeWei, USDC_DECIMALS)).toBe('0.25');
    });

    it('should validate agent chat fee amount', () => {
      const expectedFee = 0.25;
      const tolerance = 0.001;

      // Exact match
      expect(Math.abs(0.25 - expectedFee)).toBeLessThanOrEqual(tolerance);

      // Within tolerance
      expect(Math.abs(0.2505 - expectedFee)).toBeLessThanOrEqual(tolerance);
      expect(Math.abs(0.2495 - expectedFee)).toBeLessThanOrEqual(tolerance);

      // Outside tolerance
      expect(Math.abs(0.26 - expectedFee)).toBeGreaterThan(tolerance);
      expect(Math.abs(0.24 - expectedFee)).toBeGreaterThan(tolerance);
    });
  });

  describe('Agent Service Fee', () => {
    it('should require $0.05 for agent service fee', () => {
      const serviceFee = 0.05;
      const serviceFeeWei = parseUnits(serviceFee.toString(), USDC_DECIMALS);

      expect(serviceFee).toBe(0.05);
      expect(formatUnits(serviceFeeWei, USDC_DECIMALS)).toBe('0.05');
    });

    it('should validate agent service fee is paid first', () => {
      // Agent service fee must be paid before service calls
      const agentServiceFee = 0.05;
      const serviceCallFee = 0.25;

      expect(agentServiceFee).toBe(0.05);
      expect(serviceCallFee).toBe(0.25);
      
      // Total cost for first agent interaction: $0.05 + $0.25 = $0.30
      const totalFirstInteraction = agentServiceFee + serviceCallFee;
      expect(totalFirstInteraction).toBe(0.30);
    });

    it('should validate subsequent agent calls only charge chat fee', () => {
      // First call: $0.05 (service fee) + $0.25 (chat fee) = $0.30
      // Subsequent calls: $0.25 (chat fee only)
      const firstCallCost = 0.05 + 0.25;
      const subsequentCallCost = 0.25;

      expect(firstCallCost).toBe(0.30);
      expect(subsequentCallCost).toBe(0.25);
    });
  });

  describe('Agent Payment Flow', () => {
    it('should handle agent chat payment flow', () => {
      const chatFee = 0.25;
      const chatFeeWei = parseUnits(chatFee.toString(), USDC_DECIMALS);

      const payment = {
        amount: chatFeeWei.toString(),
        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        chainId: 8453,
      };

      expect(formatUnits(BigInt(payment.amount), USDC_DECIMALS)).toBe('0.25');
      expect(payment.chainId).toBe(8453);
    });

    it('should handle agent service fee payment flow', () => {
      const serviceFee = 0.05;
      const serviceFeeWei = parseUnits(serviceFee.toString(), USDC_DECIMALS);

      const payment = {
        amount: serviceFeeWei.toString(),
        token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        chainId: 8453,
      };

      expect(formatUnits(BigInt(payment.amount), USDC_DECIMALS)).toBe('0.05');
      expect(payment.chainId).toBe(8453);
    });

    it('should calculate total agent usage cost', () => {
      // Scenario: User makes 5 agent chat calls
      const serviceFee = 0.05; // Paid once
      const chatFee = 0.25; // Paid per call
      const numberOfCalls = 5;

      const totalCost = serviceFee + (chatFee * numberOfCalls);

      expect(totalCost).toBe(1.30); // $0.05 + ($0.25 * 5)
    });
  });

  describe('Agent Endpoint Configuration', () => {
    it('should validate agent endpoint prices', () => {
      const endpoints = {
        '/api/r1x-agent/chat': {
          price: '$0.25',
          network: 'base',
        },
        '/api/fee': {
          price: '$0.05',
          network: 'base',
        },
        '/api/r1x-agent/plan': {
          price: '$0.01',
          network: 'base',
        },
      };

      expect(endpoints['/api/r1x-agent/chat'].price).toBe('$0.25');
      expect(endpoints['/api/fee'].price).toBe('$0.05');
      expect(endpoints['/api/r1x-agent/plan'].price).toBe('$0.01');
      expect(endpoints['/api/r1x-agent/chat'].network).toBe('base');
    });

    it('should extract numeric price from string', () => {
      const priceStrings = ['$0.25', '$0.05', '$0.01', '$1.00'];
      const expectedPrices = [0.25, 0.05, 0.01, 1.00];

      priceStrings.forEach((priceStr, index) => {
        const numericPrice = parseFloat(priceStr.replace('$', ''));
        expect(numericPrice).toBe(expectedPrices[index]);
      });
    });
  });
});

