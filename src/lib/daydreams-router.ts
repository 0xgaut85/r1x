import { createClient, DreamsClient } from '@daydreamsai/ai-sdk-provider';

let client: DreamsClient | null = null;

export function getDaydreamsClient(): DreamsClient {
  if (client) return client;

  const baseUrl = process.env.NEXT_PUBLIC_DAYDREAMS_BASE_URL || 'https://api-beta.daydreams.systems';

  client = createClient({
    baseUrl,
    store: ['console'],
    logLevel: 'warn',
    callback: (_event, _message) => {},
  });

  return client;
}
