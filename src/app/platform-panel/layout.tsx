import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Panel - Analytics & Insights | r1x Labs',
  description: 'Complete analytics and insights for r1x platform. Monitor transactions, fees, services, and user growth in real-time.',
  openGraph: {
    title: 'Platform Panel - Analytics & Insights | r1x Labs',
    description: 'Complete analytics and insights for r1x platform. Monitor transactions, fees, services, and user growth.',
    type: 'website',
    url: 'https://www.r1xlabs.com/platform-panel',
    siteName: 'r1x Labs',
    images: [
      {
        url: 'https://www.r1xlabs.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'r1x Platform Panel - Analytics and insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Platform Panel - Analytics & Insights | r1x Labs',
    description: 'Complete analytics and insights for r1x platform.',
    images: ['https://www.r1xlabs.com/logo.png'],
  },
  icons: {
    icon: '/tg2.png',
    apple: '/tg2.png',
  },
};

export default function PlatformPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

