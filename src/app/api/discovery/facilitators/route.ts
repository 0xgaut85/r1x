import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAW_URL = 'https://raw.githubusercontent.com/Merit-Systems/x402scan/main/facilitators/config.ts';

export async function GET(_request: NextRequest) {
  try {
    const res = await fetch(RAW_URL, { headers: { 'Accept': 'text/plain' }, cache: 'no-store' });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      return NextResponse.json({ error: `Failed to fetch facilitators config: ${res.status}`, details: t }, { status: 502 });
    }
    const text = await res.text();

    // Naive parse: extract id and link fields from objects in the _FACILITATORS array
    const entries: Array<{ id: string; link?: string }> = [];
    const itemRegex = /\{([^{}]*?id:\s*'[^']+'[\s\S]*?)\}/g; // match object-ish blocks containing id
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(text)) !== null) {
      const block = match[1];
      const idMatch = block.match(/id:\s*'([^']+)'/);
      if (!idMatch) continue;
      const linkMatch = block.match(/link:\s*'([^']+)'/);
      entries.push({ id: idMatch[1], link: linkMatch ? linkMatch[1] : undefined });
    }

    return NextResponse.json({ success: true, count: entries.length, entries });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}
