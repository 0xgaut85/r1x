'use client';

export default function InfrastructureVisual() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="300" fill="#F7F7F7"/>
      
      {/* Charging station */}
      <rect x="60" y="100" width="80" height="120" fill="white" stroke="#E5E5E5" strokeWidth="3" rx="4"/>
      <rect x="70" y="110" width="60" height="80" fill="#FF4D00" opacity="0.1"/>
      
      {/* Charging bolt */}
      <path d="M 100 130 L 90 155 L 105 155 L 95 180" 
            fill="none" 
            stroke="#FF4D00" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
      
      {/* Power indicator */}
      <rect x="75" y="200" width="50" height="10" fill="#FF4D00" opacity="0.3"/>
      <rect x="75" y="200" width="35" height="10" fill="#FF4D00"/>
      
      {/* Dock slots */}
      <rect x="180" y="80" width="40" height="60" fill="white" stroke="#E5E5E5" strokeWidth="2"/>
      <rect x="230" y="80" width="40" height="60" fill="white" stroke="#FF4D00" strokeWidth="2"/>
      <rect x="280" y="80" width="40" height="60" fill="white" stroke="#E5E5E5" strokeWidth="2"/>
      
      {/* Active dock indicator */}
      <circle cx="250" cy="110" r="8" fill="#FF4D00"/>
      
      {/* Network connections */}
      <line x1="100" y1="240" x2="200" y2="260" stroke="#FF4D00" strokeWidth="2" strokeDasharray="3,3" opacity="0.4"/>
      <line x1="200" y1="260" x2="300" y2="240" stroke="#FF4D00" strokeWidth="2" strokeDasharray="3,3" opacity="0.4"/>
      
      {/* Network nodes */}
      <circle cx="100" cy="240" r="6" fill="#FF4D00" opacity="0.6"/>
      <circle cx="200" cy="260" r="6" fill="#FF4D00"/>
      <circle cx="300" cy="240" r="6" fill="#FF4D00" opacity="0.6"/>
      
      {/* Status text */}
      <text x="250" y="125" textAnchor="middle" fontSize="8" fill="#FF4D00" fontFamily="monospace">ACTIVE</text>
    </svg>
  );
}

