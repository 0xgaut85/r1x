import { NextRequest, NextResponse } from 'next/server';
import { syncDaydreamsServices } from '@/lib/daydreams-sync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const SYNC_SECRET = process.env.SYNC_SECRET;

    if (SYNC_SECRET) {
      const headerSecret = request.headers.get('x-sync-secret') || request.headers.get('authorization');
      const token = headerSecret?.startsWith('Bearer ')
        ? headerSecret.slice('Bearer '.length)
        : headerSecret;
      if (!token || token !== SYNC_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const count = await syncDaydreamsServices();
    return NextResponse.json({ success: true, synced: count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Sync failed' }, { status: 500 });
  }
}

