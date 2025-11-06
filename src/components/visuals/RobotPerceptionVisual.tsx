'use client';

export default function RobotPerceptionVisual() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="300" fill="#F7F7F7"/>
      
      {/* Camera frame */}
      <rect x="80" y="60" width="240" height="180" fill="white" stroke="#E5E5E5" strokeWidth="3" rx="4"/>
      
      {/* Lens circles */}
      <circle cx="200" cy="150" r="60" fill="none" stroke="#FF4D00" strokeWidth="2" opacity="0.3"/>
      <circle cx="200" cy="150" r="45" fill="none" stroke="#FF4D00" strokeWidth="2" opacity="0.5"/>
      <circle cx="200" cy="150" r="30" fill="none" stroke="#FF4D00" strokeWidth="2" opacity="0.7"/>
      <circle cx="200" cy="150" r="15" fill="#FF4D00" opacity="0.3"/>
      
      {/* Focus markers */}
      <line x1="120" y1="100" x2="140" y2="100" stroke="#FF4D00" strokeWidth="2"/>
      <line x1="120" y1="100" x2="120" y2="120" stroke="#FF4D00" strokeWidth="2"/>
      
      <line x1="280" y1="100" x2="260" y2="100" stroke="#FF4D00" strokeWidth="2"/>
      <line x1="280" y1="100" x2="280" y2="120" stroke="#FF4D00" strokeWidth="2"/>
      
      <line x1="120" y1="200" x2="140" y2="200" stroke="#FF4D00" strokeWidth="2"/>
      <line x1="120" y1="200" x2="120" y2="180" stroke="#FF4D00" strokeWidth="2"/>
      
      <line x1="280" y1="200" x2="260" y2="200" stroke="#FF4D00" strokeWidth="2"/>
      <line x1="280" y1="200" x2="280" y2="180" stroke="#FF4D00" strokeWidth="2"/>
      
      {/* Scan line */}
      <line x1="80" y1="150" x2="320" y2="150" stroke="#FF4D00" strokeWidth="1" opacity="0.4" strokeDasharray="5,5"/>
    </svg>
  );
}

