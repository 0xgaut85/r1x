import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token';
import { getSolanaRpcUrl } from '@/lib/solana-rpc-config';
import { Keypair } from '@solana/web3.js';

const R1X_MINT = '5DDYWuhWN8PDgNyu9Khgmqt4AkJmtAZarFBKah4Epump';
const STAKING_ADDRESS = 'HdjRVLjPNpkayysqTsKo1oYBHwzLHAVmgp6uLVH4Sk4Q';
const UNSTAKE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Complete unstake - transfer tokens back to user
 * POST /api/staking/unstake/complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress } = body;

    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required' },
        { status: 400 }
      );
    }

    // Check if server wallet is configured
    const serverStakingWalletPrivateKey = process.env.SERVER_STAKING_WALLET_PRIVATE_KEY;
    if (!serverStakingWalletPrivateKey) {
      return NextResponse.json(
        { error: 'Server staking wallet not configured. Set SERVER_STAKING_WALLET_PRIVATE_KEY in Railway.' },
        { status: 500 }
      );
    }

    // Get staking record
    const staking = await prisma.staking.findUnique({
      where: { userAddress },
    });

    if (!staking || staking.status !== 'unstaking') {
      return NextResponse.json(
        { error: 'No active unstake request found' },
        { status: 400 }
      );
    }

    // Verify cooldown has passed
    if (!staking.unstakeRequestedAt) {
      return NextResponse.json(
        { error: 'Invalid unstake request' },
        { status: 400 }
      );
    }

    const timeElapsed = Date.now() - staking.unstakeRequestedAt.getTime();
    if (timeElapsed < UNSTAKE_COOLDOWN_MS) {
      const remainingMs = UNSTAKE_COOLDOWN_MS - timeElapsed;
      return NextResponse.json({
        error: 'Cooldown period not yet completed',
        remainingMs,
        canUnstake: false,
      });
    }

    // Get RPC URL
    const rpcUrl = await getSolanaRpcUrl();
    const connection = new Connection(rpcUrl, 'confirmed');

    // Create server wallet from private key
    // Private key should be base58 string or array of numbers
    let serverKeypair: Keypair;
    try {
      const privateKeyArray = JSON.parse(serverStakingWalletPrivateKey);
      serverKeypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
    } catch {
      // Try as base58 string
      const { decode } = await import('bs58');
      serverKeypair = Keypair.fromSecretKey(decode(serverStakingWalletPrivateKey));
    }

    const stakingPubkey = new PublicKey(STAKING_ADDRESS);
    const userPubkey = new PublicKey(userAddress);
    const mintPubkey = new PublicKey(R1X_MINT);

    // Verify server wallet matches staking address
    if (!serverKeypair.publicKey.equals(stakingPubkey)) {
      return NextResponse.json(
        { error: 'Server wallet does not match staking address' },
        { status: 500 }
      );
    }

    // Get token accounts
    const stakingTokenAccount = await getAssociatedTokenAddress(mintPubkey, stakingPubkey);
    const userTokenAccount = await getAssociatedTokenAddress(mintPubkey, userPubkey);

    // Check staking account balance
    const stakingAccount = await getAccount(connection, stakingTokenAccount);
    const stakedAmountAtomic = BigInt(staking.stakedAmount) * BigInt(1_000_000); // Convert to atomic units

    if (stakingAccount.amount < stakedAmountAtomic) {
      return NextResponse.json(
        { error: 'Insufficient balance in staking account' },
        { status: 500 }
      );
    }

    // Create transfer transaction
    const transaction = new Transaction();
    transaction.add(
      createTransferInstruction(
        stakingTokenAccount,
        userTokenAccount,
        stakingPubkey,
        stakedAmountAtomic,
        []
      )
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = stakingPubkey;

    // Sign transaction
    transaction.sign(serverKeypair);

    // Send transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      { skipPreflight: false }
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    // Update database
    await prisma.staking.update({
      where: { userAddress },
      data: {
        status: 'unstaked',
        unstakeCompletedAt: new Date(),
        stakedAmount: '0',
      },
    });

    return NextResponse.json({
      success: true,
      signature,
      unstakeCompletedAt: new Date(),
    });
  } catch (error: any) {
    console.error('[Unstake Complete] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete unstake' },
      { status: 500 }
    );
  }
}

