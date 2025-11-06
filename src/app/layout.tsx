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
  metadataBase: new URL('https://server.r1xlabs.com'),
  title: "server.r1xlabs.com",
  description: "From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy.",
  alternates: {
    canonical: 'https://server.r1xlabs.com/',
  },
  openGraph: {
    title: "server.r1xlabs.com",
    description: "From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy.",
    siteName: 'R1X Labs',
    type: 'website',
    locale: 'en_US',
    url: 'https://server.r1xlabs.com/',
    images: [
      {
        url: 'https://server.r1xlabs.com/api/logo',
        width: 1200,
        height: 630,
        alt: 'R1X Labs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "server.r1xlabs.com",
    description: "From users to AI agents, from AI agents to robots. Enabling machines to operate in an autonomous economy.",
    images: ['https://server.r1xlabs.com/api/logo'],
  },
  other: {
    'og:image:secure_url': 'https://server.r1xlabs.com/api/logo',
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
