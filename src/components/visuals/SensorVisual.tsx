'use client';

export default function SensorVisual() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="300" fill="#F7F7F7"/>
      
      {/* Radar/sensor sweep */}
      <circle cx="200" cy="150" r="100" fill="none" stroke="#000" strokeWidth="1" opacity="0.1"/>
      <circle cx="200" cy="150" r="70" fill="none" stroke="#000" strokeWidth="1" opacity="0.15"/>
      <circle cx="200" cy="150" r="40" fill="none" stroke="#000" strokeWidth="1" opacity="0.2"/>
      
      {/* Center sensor */}
      <circle cx="200" cy="150" r="12" fill="#FF4D00" opacity="0.3"/>
      <circle cx="200" cy="150" r="6" fill="#FF4D00"/>
      
      {/* Sweep angle */}
      <path d="M 200 150 L 280 100" stroke="#FF4D00" strokeWidth="2" opacity="0.4"/>
      <path d="M 200 150 L 280 200" stroke="#FF4D00" strokeWidth="2" opacity="0.4"/>
      <path d="M 280 100 A 100 100 0 0 1 280 200" fill="#FF4D00" fillOpacity="0.05"/>
      
      {/* Data points detected */}
      <circle cx="240" cy="110" r="5" fill="#FF4D00" opacity="0.8"/>
      <circle cx="260" cy="140" r="5" fill="#FF4D00" opacity="0.6"/>
      <circle cx="250" cy="180" r="5" fill="#FF4D00" opacity="0.7"/>
      
      {/* Connection lines to data points */}
      <line x1="200" y1="150" x2="240" y2="110" stroke="#FF4D00" strokeWidth="1" opacity="0.3" strokeDasharray="2,2"/>
      <line x1="200" y1="150" x2="260" y2="140" stroke="#FF4D00" strokeWidth="1" opacity="0.3" strokeDasharray="2,2"/>
      <line x1="200" y1="150" x2="250" y2="180" stroke="#FF4D00" strokeWidth="1" opacity="0.3" strokeDasharray="2,2"/>
      
      {/* Grid overlay */}
      <line x1="0" y1="150" x2="400" y2="150" stroke="#000" strokeWidth="1" opacity="0.05"/>
      <line x1="200" y1="0" x2="200" y2="300" stroke="#000" strokeWidth="1" opacity="0.05"/>
    </svg>
  );
}

