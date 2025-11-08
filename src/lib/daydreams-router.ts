import { DaydreamsClient } from '@daydreamsai/ai-sdk-provider';

let client: DaydreamsClient | null = null;

export function getDaydreamsClient(): DaydreamsClient {
  if (client) return client;

  const baseUrl = process.env.NEXT_PUBLIC_DAYDREAMS_BASE_URL || 'https://api-beta.daydreams.systems';

  client = new DaydreamsClient({
    baseUrl,
  });

  return client;
}
