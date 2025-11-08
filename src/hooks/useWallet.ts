'use client';

import { useAccount, useWalletClient, usePublicClient, useChainId } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { parseAbi } from 'viem';

const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`;
const USDC_DECIMALS = 6;

const USDC_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
]);

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();

  const transferUSDC = async (to: string, amount: string): Promise<string> => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    if (chainId !== base.id) {
      throw new Error('Please switch to Base network');
    }

    const amountWei = parseUnits(amount, USDC_DECIMALS);

    try {
      const hash = await walletClient.writeContract({
        address: USDC_BASE_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [to as `0x${string}`, amountWei],
      });

      return hash;
    } catch (error: any) {
      console.error('USDC transfer error:', error);
      throw error;
    }
  };

  const getUSDCBalance = async (): Promise<string> => {
    if (!publicClient || !address) {
      return '0';
    }

    try {
      const balance = await publicClient.readContract({
        address: USDC_BASE_ADDRESS,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      });

      return formatUnits(balance, USDC_DECIMALS);
    } catch (error) {
      console.error('Balance check error:', error);
      return '0';
    }
  };

  const formatUSDC = (amount: string): string => {
    try {
      return formatUnits(BigInt(amount), USDC_DECIMALS);
    } catch {
      return amount;
    }
  };

  return {
    address,
    isConnected,
    chainId,
    walletClient, // Expose walletClient for x402-fetch
    transferUSDC,
    getUSDCBalance,
    formatUSDC,
  };
}
