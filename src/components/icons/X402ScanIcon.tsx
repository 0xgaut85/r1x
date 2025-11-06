'use client';

import Image from 'next/image';

interface X402ScanIconProps {
  className?: string;
}

export default function X402ScanIcon({ className = "w-4 h-4" }: X402ScanIconProps) {
  return (
    <div className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <Image
        src="/x402scan.jpg"
        alt="x402scan"
        width={20}
        height={20}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          borderRadius: '2px'
        }}
      />
    </div>
  );
}

