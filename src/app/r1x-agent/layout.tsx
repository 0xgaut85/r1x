import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'r1x Agent Chat - AI Assistant | $0.25 per message',
  description: 'Chat with r1x AI Agent. Powered by Claude. Pay per message with USDC on Base network.',
  openGraph: {
    title: 'r1x Agent Chat - AI Assistant',
    description: 'Chat with r1x AI Agent. Powered by Claude. Pay per message with USDC on Base network.',
    type: 'website',
    url: 'https://www.r1xlabs.com/r1x-agent',
    images: [
      {
        url: 'https://www.r1xlabs.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'r1x Agent Chat',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'r1x Agent Chat - AI Assistant',
    description: 'Chat with r1x AI Agent. Powered by Claude. Pay per message with USDC on Base network.',
    images: ['https://www.r1xlabs.com/logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function R1xAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

