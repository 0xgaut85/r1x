'use client';

import { ReactNode } from 'react';

interface DocsCalloutVariantStyle {
  bg: string;
  border: string;
  accent: string;
  text: string;
}

interface DocsCalloutProps {
  children: ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'note';
  title?: string;
}

const CALLOUT_VARIANTS: Record<NonNullable<DocsCalloutProps['variant']>, DocsCalloutVariantStyle> = {
  info: {
    bg: '#000000',
    border: 'rgba(255, 255, 255, 0.15)',
    accent: '#FF4D00',
    text: 'rgba(255, 255, 255, 0.9)',
  },
  warning: {
    bg: 'rgba(255, 77, 0, 0.1)',
    border: '#FF4D00',
    accent: '#FF4D00',
    text: 'rgba(255, 255, 255, 0.9)',
  },
  success: {
    bg: 'rgba(0, 255, 0, 0.05)',
    border: 'rgba(0, 255, 0, 0.3)',
    accent: '#00FF00',
    text: 'rgba(255, 255, 255, 0.9)',
  },
  note: {
    bg: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.25)',
    accent: '#FFFFFF',
    text: 'rgba(255, 255, 255, 0.85)',
  },
};

export default function DocsCallout({ children, variant = 'info', title }: DocsCalloutProps) {
  const style = CALLOUT_VARIANTS[variant];

  return (
    <div
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        padding: '24px 32px',
        borderRadius: '0px',
        marginTop: '24px',
        marginBottom: '24px',
        position: 'relative',
      }}
    >
      {title && (
        <div
          style={{
            fontFamily: 'TWKEverettMono-Regular, monospace',
            fontSize: '12px',
            color: style.accent,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          fontFamily: 'BaselGrotesk-Regular, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6',
          color: style.text,
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '0',
          top: '0',
          width: '4px',
          height: '100%',
          backgroundColor: style.accent,
        }}
      />
    </div>
  );
}

