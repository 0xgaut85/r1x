'use client';
import dynamicImport from 'next/dynamic';
const ClientForm = dynamicImport(() => import('./ClientForm'), { ssr: false });

export default function MarketplaceSubmitPage() {
  return <ClientForm />;
}

