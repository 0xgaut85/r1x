import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'r1x Agent Builder - Build AI Agents That Pay | r1x Labs',
  description: 'No-code platform for building stateful AI agents with built-in x402 payment capabilities. Zapier meets AutoGPT meets crypto wallets.',
  openGraph: {
    title: 'r1x Agent Builder - Build AI Agents That Pay | r1x Labs',
    description: 'No-code platform for building stateful AI agents with built-in x402 payment capabilities. Zapier meets AutoGPT meets crypto wallets.',
    type: 'website',
    url: 'https://www.r1xlabs.com/agent-builder',
    siteName: 'r1x Labs',
    images: [
      {
        url: 'https://www.r1xlabs.com/logosvg.svg',
        width: 1200,
        height: 630,
        alt: 'r1x Agent Builder - Build AI Agents That Pay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'r1x Agent Builder - Build AI Agents That Pay | r1x Labs',
    description: 'No-code platform for building stateful AI agents with built-in x402 payment capabilities.',
    images: ['https://www.r1xlabs.com/logosvg.svg'],
  },
  icons: {
    icon: '/tg2.png',
    apple: '/tg2.png',
  },
};

export default function AgentBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}



