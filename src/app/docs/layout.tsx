import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocsShell from '@/components/docs/DocsShell';

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

