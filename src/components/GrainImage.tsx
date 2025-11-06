import React from 'react';

interface GrainImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function GrainImage({ src, alt, className, style }: GrainImageProps) {
  return (
    <div className={className} style={{ position: 'relative', ...style }}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ filter: 'grayscale(100%) contrast(120%) brightness(90%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'url(/grain.svg)', backgroundRepeat: 'repeat', opacity: 0.55 as unknown as number, mixBlendMode: 'overlay' as unknown as any }}
      />
    </div>
  );
}


