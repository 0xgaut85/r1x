'use client';

interface DocsCodeBlockProps {
  children: string;
  language?: string;
  title?: string;
}

export default function DocsCodeBlock({ children, language = 'typescript', title }: DocsCodeBlockProps) {
  return (
    <div style={{ marginTop: '24px', marginBottom: '24px' }}>
      {title && (
        <div
          style={{
            fontFamily: 'TWKEverettMono-Regular, monospace',
            fontSize: '11px',
            color: '#000000',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '8px',
            paddingLeft: '4px',
          }}
        >
          {title}
        </div>
      )}
      <pre
        style={{
          backgroundColor: '#000000',
          color: '#FFFFFF',
          padding: '24px 32px',
          borderRadius: '0px',
          overflowX: 'auto',
          fontFamily: 'TWKEverettMono-Regular, monospace',
          fontSize: '14px',
          lineHeight: '1.6',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}

