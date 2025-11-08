import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocsShell from '@/components/docs/DocsShell';
import './docs-override.css';

export const dynamic = 'force-dynamic';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <DocsShell>{children}</DocsShell>
      <Footer />
    </>
  );
}



