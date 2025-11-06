import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Panel - Track Your x402 Transactions | r1x Labs',
  description: 'Monitor your x402 transactions, track spending, and view usage analytics. Complete transparency for your machine economy activity.',
  openGraph: {
    title: 'User Panel - Track Your x402 Transactions | r1x Labs',
    description: 'Monitor your x402 transactions, track spending, and view usage analytics.',
    type: 'website',
    url: 'https://www.r1xlabs.com/user-panel',
    siteName: 'r1x Labs',
    images: [
      {
        url: 'https://www.r1xlabs.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'r1x User Panel - Track your x402 transactions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'User Panel - Track Your x402 Transactions | r1x Labs',
    description: 'Monitor your x402 transactions, track spending, and view usage analytics.',
    images: ['https://www.r1xlabs.com/logo.png'],
  },
  icons: {
    icon: '/tg2.png',
    apple: '/tg2.png',
  },
};

export default function UserPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

