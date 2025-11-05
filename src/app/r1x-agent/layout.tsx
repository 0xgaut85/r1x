import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'r1x Agent Chat - AI Assistant | r1x Labs',
  description: 'From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy. Chat with r1x AI Agent powered by Claude. $0.25 USDC per message on Base network.',
  openGraph: {
    title: 'r1x Agent Chat - AI Assistant | r1x Labs',
    description: 'From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy. Chat with r1x AI Agent powered by Claude. $0.25 USDC per message on Base network.',
    type: 'website',
    url: 'https://www.r1xlabs.com/r1x-agent',
    siteName: 'r1x Labs',
    images: [
      {
        url: 'https://www.r1xlabs.com/logosvg.svg',
        width: 1200,
        height: 630,
        alt: 'r1x Labs - Humanity\'s first blind computer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'r1x Agent Chat - AI Assistant | r1x Labs',
    description: 'From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy.',
    images: ['https://www.r1xlabs.com/logosvg.svg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  other: {
    'x402:service': 'r1x-agent-chat',
    'x402:price': '0.25',
    'x402:currency': 'USDC',
    'x402:network': 'base',
    'x402:merchant': 'r1x Labs',
  },
};

export default function R1xAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

