'use client';

export default function MachineEconomyVisual() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="300" fill="#0A0A0A"/>
      
      {/* Network nodes */}
      <circle cx="100" cy="80" r="20" fill="#FF4D00" opacity="0.2"/>
      <circle cx="100" cy="80" r="12" fill="#FF4D00" opacity="0.4"/>
      <circle cx="100" cy="80" r="6" fill="#FF4D00"/>
      
      <circle cx="300" cy="100" r="20" fill="#FF4D00" opacity="0.2"/>
      <circle cx="300" cy="100" r="12" fill="#FF4D00" opacity="0.4"/>
      <circle cx="300" cy="100" r="6" fill="#FF4D00"/>
      
      <circle cx="120" cy="220" r="20" fill="#FF4D00" opacity="0.2"/>
      <circle cx="120" cy="220" r="12" fill="#FF4D00" opacity="0.4"/>
      <circle cx="120" cy="220" r="6" fill="#FF4D00"/>
      
      <circle cx="280" cy="240" r="20" fill="#FF4D00" opacity="0.2"/>
      <circle cx="280" cy="240" r="12" fill="#FF4D00" opacity="0.4"/>
      <circle cx="280" cy="240" r="6" fill="#FF4D00"/>
      
      <circle cx="200" cy="150" r="25" fill="#FF4D00" opacity="0.3"/>
      <circle cx="200" cy="150" r="15" fill="#FF4D00" opacity="0.5"/>
      <circle cx="200" cy="150" r="8" fill="#FF4D00"/>
      
      {/* Connection lines */}
      <line x1="100" y1="80" x2="200" y2="150" stroke="#FF4D00" strokeWidth="2" opacity="0.3"/>
      <line x1="300" y1="100" x2="200" y2="150" stroke="#FF4D00" strokeWidth="2" opacity="0.3"/>
      <line x1="120" y1="220" x2="200" y2="150" stroke="#FF4D00" strokeWidth="2" opacity="0.3"/>
      <line x1="280" y1="240" x2="200" y2="150" stroke="#FF4D00" strokeWidth="2" opacity="0.3"/>
      
      {/* Data flow particles */}
      <circle cx="150" cy="115" r="2" fill="#FF4D00" opacity="0.8"/>
      <circle cx="250" cy="125" r="2" fill="#FF4D00" opacity="0.6"/>
      <circle cx="160" cy="185" r="2" fill="#FF4D00" opacity="0.7"/>
      <circle cx="240" cy="195" r="2" fill="#FF4D00" opacity="0.5"/>
    </svg>
  );
}

