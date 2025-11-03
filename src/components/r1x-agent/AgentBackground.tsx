'use client';

export default function AgentBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, rgba(255, 77, 0, 0.08) 0%, transparent 60%)',
            'radial-gradient(circle at 80% 70%, rgba(255, 77, 0, 0.08) 0%, transparent 60%)',
            'radial-gradient(circle at 50% 50%, rgba(255, 77, 0, 0.06) 0%, transparent 70%)',
            'radial-gradient(circle at 20% 30%, rgba(255, 77, 0, 0.08) 0%, transparent 60%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

