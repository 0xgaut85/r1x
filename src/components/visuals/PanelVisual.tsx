'use client';

export default function PanelVisual() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      
      {/* Background */}
      <rect width="400" height="300" fill="#F7F7F7"/>
      <rect width="400" height="300" fill="url(#grid)"/>
      
      {/* Dashboard panels */}
      <rect x="20" y="20" width="160" height="100" fill="white" stroke="#E5E5E5" strokeWidth="2"/>
      <rect x="220" y="20" width="160" height="100" fill="white" stroke="#E5E5E5" strokeWidth="2"/>
      
      {/* Chart bars in left panel */}
      <rect x="40" y="80" width="20" height="20" fill="#FF4D00" opacity="0.3"/>
      <rect x="70" y="60" width="20" height="40" fill="#FF4D00" opacity="0.5"/>
      <rect x="100" y="50" width="20" height="50" fill="#FF4D00" opacity="0.7"/>
      <rect x="130" y="40" width="20" height="60" fill="#FF4D00"/>
      
      {/* Metrics in right panel */}
      <circle cx="300" cy="70" r="30" fill="none" stroke="#FF4D00" strokeWidth="4" opacity="0.3"/>
      <circle cx="300" cy="70" r="30" fill="none" stroke="#FF4D00" strokeWidth="4" strokeDasharray="60 130" opacity="0.8" transform="rotate(-90 300 70)"/>
      
      {/* Bottom data rows */}
      <rect x="20" y="140" width="360" height="40" fill="white" stroke="#E5E5E5" strokeWidth="2"/>
      <rect x="20" y="200" width="360" height="40" fill="white" stroke="#E5E5E5" strokeWidth="2"/>
      <rect x="20" y="260" width="360" height="20" fill="white" stroke="#E5E5E5" strokeWidth="2"/>
      
      {/* Data indicators */}
      <line x1="40" y1="160" x2="100" y2="160" stroke="#FF4D00" strokeWidth="2" opacity="0.6"/>
      <line x1="40" y1="220" x2="140" y2="220" stroke="#FF4D00" strokeWidth="2" opacity="0.4"/>
      <circle cx="360" cy="160" r="4" fill="#FF4D00"/>
      <circle cx="360" cy="220" r="4" fill="#FF4D00" opacity="0.5"/>
    </svg>
  );
}

