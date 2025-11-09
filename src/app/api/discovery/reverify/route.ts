import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { preflight402Endpoint } from '@/lib/marketplace/preflight';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') || undefined; // 'base' | 'solana' | undefined
    const source = searchParams.get('source') || undefined; // 'payai' | 'selfserve' | 'daydreams' | undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200);

    const where: any = { available: true };
    if (network) where.network = network;
    if (source) where.source = source;

    const services = await prisma.service.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    let updated = 0;
    const results: Array<{ serviceId: string; status: string; reason?: string }> = [];

    for (const svc of services) {
      try {
        if (!svc.endpoint) {
          results.push({ serviceId: svc.serviceId, status: 'skipped', reason: 'no endpoint' });
          continue;
        }
        const pre = await preflight402Endpoint(svc.endpoint);
        if (!pre.success) {
          await prisma.service.update({
            where: { id: svc.id },
            data: {
              lastPreflightAt: new Date(),
              lastPreflightStatus: 'failed',
              metadata: { ...(svc as any).metadata, lastPreflightError: pre.error },
            } as any,
          });
          results.push({ serviceId: svc.serviceId, status: 'failed', reason: pre.error });
          continue;
        }

        await prisma.service.update({
          where: { id: svc.id },
          data: {
            // Do not overwrite user-provided name/description/category
            network: pre.network || svc.network,
            chainId: pre.chainId ?? svc.chainId,
            token: pre.tokenAddress || svc.token,
            price: pre.maxAmountRequired || svc.price,
            priceDisplay: pre.maxAmountRequired
              ? (Number(pre.maxAmountRequired) / 1_000_000).toFixed(6)
              : svc.priceDisplay,
            facilitatorUrl: pre.facilitatorUrl || (svc as any).facilitatorUrl || null,
            x402Ready: true,
            lastPreflightAt: new Date(),
            lastPreflightStatus: 'success',
            metadata: { ...(svc as any).metadata, lastPreflightNetwork: pre.network, lastPreflightChainId: pre.chainId },
          } as any,
        });
        updated++;
        results.push({ serviceId: svc.serviceId, status: 'updated' });
      } catch (e: any) {
        results.push({ serviceId: svc.serviceId, status: 'error', reason: e?.message || 'update error' });
      }
    }

    return NextResponse.json({ success: true, scanned: services.length, updated, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Internal error' }, { status: 500 });
  }
}

