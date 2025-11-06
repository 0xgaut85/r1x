'use client';

export default function NavigationVisual() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="300" fill="#F7F7F7"/>
      
      {/* Grid pattern for map */}
      <defs>
        <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#mapGrid)"/>
      
      {/* Route path */}
      <path d="M 60 80 Q 120 120, 200 140 T 340 200" 
            fill="none" 
            stroke="#FF4D00" 
            strokeWidth="4" 
            strokeLinecap="round"
            opacity="0.6"/>
      
      {/* Waypoints */}
      <circle cx="60" cy="80" r="8" fill="#FF4D00"/>
      <circle cx="200" cy="140" r="8" fill="#FF4D00" opacity="0.6"/>
      <circle cx="340" cy="200" r="8" fill="#FF4D00"/>
      
      {/* Location markers */}
      <path d="M 60 60 L 60 80 L 70 70 Z" fill="#FF4D00"/>
      <path d="M 340 180 L 340 200 L 350 190 Z" fill="#FF4D00"/>
      
      {/* Distance indicators */}
      <line x1="80" y1="100" x2="120" y2="100" stroke="#000" strokeWidth="1" opacity="0.3"/>
      <text x="100" y="95" textAnchor="middle" fontSize="10" fill="#000" opacity="0.6">2.4km</text>
      
      <line x1="220" y1="160" x2="260" y2="160" stroke="#000" strokeWidth="1" opacity="0.3"/>
      <text x="240" y="155" textAnchor="middle" fontSize="10" fill="#000" opacity="0.6">1.8km</text>
    </svg>
  );
}

