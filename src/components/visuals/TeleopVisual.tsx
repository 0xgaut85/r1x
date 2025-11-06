'use client';

export default function TeleopVisual() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="300" fill="#F7F7F7"/>
      
      {/* Robot side */}
      <rect x="40" y="60" width="140" height="180" fill="white" stroke="#E5E5E5" strokeWidth="2"/>
      <text x="110" y="50" textAnchor="middle" fontSize="12" fill="#666" fontFamily="monospace">ROBOT</text>
      
      {/* Robot icon */}
      <circle cx="110" cy="130" r="30" fill="none" stroke="#000" strokeWidth="2" opacity="0.2"/>
      <circle cx="100" cy="125" r="4" fill="#000" opacity="0.3"/>
      <circle cx="120" cy="125" r="4" fill="#000" opacity="0.3"/>
      <path d="M 95 140 Q 110 148, 125 140" fill="none" stroke="#000" strokeWidth="2" opacity="0.3"/>
      
      {/* Human operator side */}
      <rect x="220" y="60" width="140" height="180" fill="white" stroke="#E5E5E5" strokeWidth="2"/>
      <text x="290" y="50" textAnchor="middle" fontSize="12" fill="#666" fontFamily="monospace">OPERATOR</text>
      
      {/* Human icon */}
      <circle cx="290" cy="120" r="20" fill="none" stroke="#FF4D00" strokeWidth="2" opacity="0.6"/>
      <path d="M 270 160 L 270 180 M 310 160 L 310 180 M 260 200 L 280 220 M 320 200 L 300 220" 
            stroke="#FF4D00" 
            strokeWidth="2" 
            opacity="0.6" 
            strokeLinecap="round"/>
      
      {/* Connection lines */}
      <path d="M 180 100 L 220 100" stroke="#FF4D00" strokeWidth="2" strokeDasharray="5,5" opacity="0.4"/>
      <path d="M 180 150 L 220 150" stroke="#FF4D00" strokeWidth="2" strokeDasharray="5,5" opacity="0.6"/>
      <path d="M 180 200 L 220 200" stroke="#FF4D00" strokeWidth="2" strokeDasharray="5,5" opacity="0.4"/>
      
      {/* Signal indicators */}
      <circle cx="200" cy="100" r="4" fill="#FF4D00" opacity="0.8"/>
      <circle cx="200" cy="150" r="4" fill="#FF4D00"/>
      <circle cx="200" cy="200" r="4" fill="#FF4D00" opacity="0.6"/>
    </svg>
  );
}

