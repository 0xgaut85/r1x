import { NextResponse } from 'next/server';

/**
 * Runtime API route to expose client-safe config from Railway env vars.
 * WARNING: Do NOT add secrets here.
 */
export async function GET() {
  // Public-safe values only
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || process.env.REOWN_PROJECT_ID || '';
  const platformFeePercentage = process.env.PLATFORM_FEE_PERCENTAGE || process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE || '5';
  const solanaFeeRecipient = process.env.SOLANA_FEE_RECIPIENT_ADDRESS || process.env.NEXT_PUBLIC_SOLANA_FEE_RECIPIENT_ADDRESS || '';
  const payaiFacilitatorUrl = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';
  const daydreamsFacilitatorUrl = process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems';
  const x402ServerUrl = process.env.X402_SERVER_URL || process.env.NEXT_PUBLIC_X402_SERVER_URL || '';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const logokitApiKey = process.env.NEXT_PUBLIC_LOGOKIT_API_KEY || '';
  const apiflashAccessKey = process.env.APIFLASH_ACCESS_KEY || process.env.NEXT_PUBLIC_APIFLASH_ACCESS_KEY || '';

  return NextResponse.json({
    projectId,
    platformFeePercentage,
    solanaFeeRecipient,
    payaiFacilitatorUrl,
    daydreamsFacilitatorUrl,
    x402ServerUrl,
    baseUrl,
    logokitApiKey,
    apiflashAccessKey,
  });
}


