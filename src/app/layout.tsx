import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";
import WalletProvider from "@/components/WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "r1x - Humanity's first blind computer",
  description: "r1x decentralizes trust for sensitive data in the same way that blockchains decentralized transactions.",
  openGraph: {
    title: "r1x - Humanity's first blind computer",
    description: "r1x decentralizes trust for sensitive data in the same way that blockchains decentralized transactions.",
    type: 'website',
    url: 'https://www.r1xlabs.com',
    images: [
      {
        url: 'https://www.r1xlabs.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'r1x',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "r1x - Humanity's first blind computer",
    description: "r1x decentralizes trust for sensitive data in the same way that blockchains decentralized transactions.",
    images: ['https://www.r1xlabs.com/logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <CustomCursor />
          <SmoothScroll />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
