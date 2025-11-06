'use client';

export default function ApiServiceVisual() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="300" fill="#F7F7F7"/>
      
      {/* API endpoint boxes */}
      <g>
        {/* GET */}
        <rect x="60" y="60" width="100" height="40" fill="white" stroke="#4CAF50" strokeWidth="2"/>
        <text x="110" y="85" textAnchor="middle" fontSize="14" fill="#4CAF50" fontFamily="monospace" fontWeight="bold">GET</text>
        
        {/* POST */}
        <rect x="60" y="120" width="100" height="40" fill="white" stroke="#FF4D00" strokeWidth="2"/>
        <text x="110" y="145" textAnchor="middle" fontSize="14" fill="#FF4D00" fontFamily="monospace" fontWeight="bold">POST</text>
        
        {/* PUT */}
        <rect x="60" y="180" width="100" height="40" fill="white" stroke="#2196F3" strokeWidth="2"/>
        <text x="110" y="205" textAnchor="middle" fontSize="14" fill="#2196F3" fontFamily="monospace" fontWeight="bold">PUT</text>
      </g>
      
      {/* API paths */}
      <g>
        <line x1="160" y1="80" x2="240" y2="80" stroke="#4CAF50" strokeWidth="2" opacity="0.5"/>
        <line x1="160" y1="140" x2="240" y2="140" stroke="#FF4D00" strokeWidth="2"/>
        <line x1="160" y1="200" x2="240" y2="200" stroke="#2196F3" strokeWidth="2" opacity="0.5"/>
        
        {/* Endpoints */}
        <text x="250" y="85" fontSize="11" fill="#666" fontFamily="monospace">/api/data</text>
        <text x="250" y="145" fontSize="11" fill="#FF4D00" fontFamily="monospace">/api/x402</text>
        <text x="250" y="205" fontSize="11" fill="#666" fontFamily="monospace">/api/update</text>
      </g>
      
      {/* Price tag */}
      <rect x="240" y="120" width="100" height="40" fill="#FF4D00" fillOpacity="0.1" stroke="#FF4D00" strokeWidth="2" strokeDasharray="4,4"/>
      <text x="290" y="145" textAnchor="middle" fontSize="16" fill="#FF4D00" fontFamily="monospace" fontWeight="bold">$0.25</text>
    </svg>
  );
}

