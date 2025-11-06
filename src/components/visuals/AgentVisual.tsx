'use client';

export default function AgentVisual() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="300" fill="#F7F7F7"/>
      
      {/* Chat interface */}
      <rect x="40" y="40" width="320" height="220" fill="white" stroke="#E5E5E5" strokeWidth="2" rx="4"/>
      
      {/* User message bubble */}
      <rect x="220" y="60" width="120" height="40" fill="#FF4D00" opacity="0.2" rx="8"/>
      <line x1="230" y1="70" x2="320" y2="70" stroke="#FF4D00" strokeWidth="2" opacity="0.6"/>
      <line x1="230" y1="80" x2="300" y2="80" stroke="#FF4D00" strokeWidth="2" opacity="0.4"/>
      
      {/* AI response bubble */}
      <rect x="60" y="120" width="140" height="50" fill="#000000" opacity="0.05" rx="8"/>
      <line x1="70" y1="135" x2="180" y2="135" stroke="#000000" strokeWidth="2" opacity="0.3"/>
      <line x1="70" y1="145" x2="160" y2="145" stroke="#000000" strokeWidth="2" opacity="0.2"/>
      <line x1="70" y1="155" x2="170" y2="155" stroke="#000000" strokeWidth="2" opacity="0.2"/>
      
      {/* AI icon/avatar */}
      <circle cx="80" cy="210" r="20" fill="#FF4D00" opacity="0.1"/>
      <circle cx="80" cy="210" r="12" fill="#FF4D00" opacity="0.3"/>
      <circle cx="80" cy="210" r="6" fill="#FF4D00"/>
      
      {/* Processing indicator */}
      <circle cx="120" cy="210" r="3" fill="#FF4D00" opacity="0.8"/>
      <circle cx="135" cy="210" r="3" fill="#FF4D00" opacity="0.5"/>
      <circle cx="150" cy="210" r="3" fill="#FF4D00" opacity="0.3"/>
    </svg>
  );
}

