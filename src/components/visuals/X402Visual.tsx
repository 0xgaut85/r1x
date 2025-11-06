'use client';

export default function X402Visual() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="300" fill="#F7F7F7"/>
      
      {/* Payment flow diagram */}
      
      {/* Request box */}
      <rect x="40" y="60" width="100" height="60" fill="white" stroke="#E5E5E5" strokeWidth="2"/>
      <text x="90" y="95" textAnchor="middle" fontSize="14" fill="#000" fontFamily="monospace">REQUEST</text>
      
      {/* Arrow 1 */}
      <path d="M 140 90 L 180 90" stroke="#FF4D00" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
      
      {/* 402 box */}
      <rect x="180" y="60" width="100" height="60" fill="#FF4D00" fillOpacity="0.1" stroke="#FF4D00" strokeWidth="2"/>
      <text x="230" y="90" textAnchor="middle" fontSize="16" fill="#FF4D00" fontFamily="monospace" fontWeight="bold">402</text>
      <text x="230" y="105" textAnchor="middle" fontSize="10" fill="#000" fontFamily="monospace">PAYMENT</text>
      
      {/* Arrow 2 down */}
      <path d="M 230 120 L 230 160" stroke="#FF4D00" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
      
      {/* Payment box */}
      <rect x="180" y="160" width="100" height="60" fill="white" stroke="#FF4D00" strokeWidth="2"/>
      <text x="230" y="185" textAnchor="middle" fontSize="12" fill="#000" fontFamily="monospace">USDC</text>
      <text x="230" y="200" textAnchor="middle" fontSize="10" fill="#000" fontFamily="monospace">Base</text>
      
      {/* Arrow 3 right */}
      <path d="M 280 190 L 320 190" stroke="#FF4D00" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
      
      {/* Access granted box */}
      <rect x="320" y="160" width="60" height="60" fill="#FF4D00" fillOpacity="0.2" stroke="#FF4D00" strokeWidth="2"/>
      <text x="350" y="195" textAnchor="middle" fontSize="24" fill="#FF4D00">✓</text>
      
      {/* Arrow marker definition */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#FF4D00"/>
        </marker>
      </defs>
      
      {/* Labels */}
      <text x="90" y="50" textAnchor="middle" fontSize="10" fill="#666" fontFamily="monospace">Client</text>
      <text x="230" y="50" textAnchor="middle" fontSize="10" fill="#666" fontFamily="monospace">Quote</text>
      <text x="350" y="150" textAnchor="middle" fontSize="10" fill="#666" fontFamily="monospace">Resource</text>
    </svg>
  );
}

