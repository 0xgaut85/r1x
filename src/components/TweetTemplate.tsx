'use client';

export default function TweetTemplate() {
  return (
    <div 
      className="relative w-full h-full bg-black overflow-hidden"
      style={{
        borderRadius: '0px',
        minHeight: '400px',
        aspectRatio: '16/9'
      }}
    >
      {/* Grain overlay */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none z-[1]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 0.8px, transparent 0.8px),
            radial-gradient(circle at 8px 5px, rgba(255,255,255,0.35) 0.7px, transparent 0.7px),
            radial-gradient(circle at 15px 12px, rgba(255,255,255,0.3) 0.9px, transparent 0.9px)
          `,
          backgroundSize: '8px 8px, 9px 9px, 10px 10px'
        }}
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 79px, rgba(255,255,255,0.08) 79px, rgba(255,255,255,0.08) 80px),
            repeating-linear-gradient(-45deg, transparent, transparent 79px, rgba(255,255,255,0.08) 79px, rgba(255,255,255,0.08) 80px)
          `
        }}
      />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.7) 100%)'
        }}
      />
      
      {/* Corner marks */}
      <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-white/40 z-[20]" />
      <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/40 z-[20]" />
      <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/40 z-[20]" />
      <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-white/40 z-[20]" />
      
      {/* Content */}
      <div className="absolute top-8 left-8 max-w-[90%] z-[10]">
        <h3 
          className="text-white mb-4"
          style={{
            fontFamily: 'TWKEverett-Regular, sans-serif',
            fontSize: 'clamp(32px, 5vw, 60px)',
            lineHeight: '1.1',
            letterSpacing: '-2px',
            fontWeight: 400
          }}
        >
          R1X JOINS LOCUS HACKATHON
        </h3>
        <p 
          className="text-white/85"
          style={{
            fontFamily: 'BaselGrotesk-Regular, sans-serif',
            fontSize: 'clamp(14px, 2vw, 18px)',
            lineHeight: '1.6',
            fontWeight: 400
          }}
        >
          Showcasing r1x Agent at the forefront of autonomous payments. The next economy starts here.
        </p>
      </div>
      
      {/* Logo badge */}
      <div className="absolute top-6 right-6 z-[10] flex items-center gap-3">
        <div 
          className="flex items-center gap-2 px-4 py-2"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <img 
            src="/logosvg.svg" 
            alt="r1x Logo" 
            className="w-6 h-6"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
        <div className="w-10 h-0.5 bg-[#FF4D00]" />
      </div>
      
      {/* Baseline bar */}
      <div className="absolute bottom-6 left-8 right-8 z-[10] flex items-center gap-4">
        <div className="flex gap-2 flex-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-px h-4 bg-white/40" />
          ))}
        </div>
        <div 
          className="px-3 py-1 text-white border border-[#FF4D00]"
          style={{
            fontFamily: 'TWKEverettMono-Regular, monospace',
            fontSize: '10px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          Hackathon
        </div>
      </div>
      
      {/* Partner logos */}
      <div className="absolute bottom-20 left-8 z-[10] flex items-center gap-6 flex-wrap">
        {['Y Combinator', 'Coinbase', 'Anthropic', 'OpenAI', 'Replit', 'Locus'].map((name, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div 
              className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center"
              style={{ fontFamily: 'TWKEverettMono-Regular, monospace', fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}
            >
              {name.charAt(0)}
            </div>
            <div 
              className="text-white/60"
              style={{
                fontFamily: 'TWKEverettMono-Regular, monospace',
                fontSize: '8px',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              {name}
            </div>
          </div>
        ))}
      </div>
      
      {/* Side labels */}
      <div className="absolute left-2 top-32 bottom-32 z-[10] flex flex-col gap-16">
        <div 
          className="text-white/40"
          style={{
            fontFamily: 'TWKEverettMono-Regular, monospace',
            fontSize: '8px',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}
        >
          Community
        </div>
        <div 
          className="text-white/40"
          style={{
            fontFamily: 'TWKEverettMono-Regular, monospace',
            fontSize: '8px',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}
        >
          Announcement
        </div>
      </div>
    </div>
  );
}

