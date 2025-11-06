'use client';

export default function InfrastructureNodeVisual() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="300" fill="#F7F7F7"/>
      
      {/* Server rack visualization */}
      <g>
        {/* Rack outline */}
        <rect x="120" y="40" width="160" height="220" fill="white" stroke="#E5E5E5" strokeWidth="3" rx="4"/>
        
        {/* Server slots */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x="130" y={60 + i * 40} width="140" height="30" 
                  fill={i === 2 ? "#FF4D00" : "#000"} 
                  opacity={i === 2 ? "0.1" : "0.02"} 
                  stroke={i === 2 ? "#FF4D00" : "#E5E5E5"} 
                  strokeWidth="1"/>
            {/* Status lights */}
            <circle cx="250" cy={75 + i * 40} r="3" 
                    fill={i === 2 ? "#FF4D00" : "#666"} 
                    opacity={i === 2 ? "1" : "0.3"}/>
          </g>
        ))}
      </g>
      
      {/* Network connections */}
      <g>
        <line x1="280" y1="140" x2="340" y2="140" stroke="#FF4D00" strokeWidth="2" opacity="0.6"/>
        <line x1="60" y1="140" x2="120" y2="140" stroke="#FF4D00" strokeWidth="2" opacity="0.6"/>
        
        {/* Connection nodes */}
        <circle cx="340" cy="140" r="6" fill="#FF4D00" opacity="0.8"/>
        <circle cx="60" cy="140" r="6" fill="#FF4D00" opacity="0.8"/>
      </g>
      
      {/* Data flow indicators */}
      <g opacity="0.5">
        <rect x="290" y="135" width="10" height="3" fill="#FF4D00"/>
        <rect x="310" y="142" width="10" height="3" fill="#FF4D00"/>
        <rect x="100" y="138" width="10" height="3" fill="#FF4D00"/>
      </g>
    </svg>
  );
}

