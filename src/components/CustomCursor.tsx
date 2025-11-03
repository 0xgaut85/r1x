'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on desktop
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (!isDesktop) return;

    setIsVisible(true);

    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Check for interactive elements using mouseover
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target;
      
      if (!target || !(target instanceof Element)) {
        return;
      }

      const element = target as Element;
      
      if (
        element.tagName === 'A' ||
        element.tagName === 'BUTTON' ||
        element.closest('a') ||
        element.closest('button') ||
        (element.classList && element.classList.contains('cursor-pointer'))
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver, true);

    return () => {
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver, true);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Custom cursor dot */}
      <div
        className="fixed pointer-events-none z-[9999] mix-blend-difference transition-transform duration-300 ease-out hidden md:block"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.8 : isHovering ? 1.5 : 1})`,
        }}
      >
        <div
          className="w-4 h-4 rounded-full transition-all duration-300"
          style={{
            backgroundColor: isHovering ? '#FF4D00' : '#FFFFFF',
            boxShadow: isHovering 
              ? `0 0 20px #FF4D00, 0 0 40px #FF4D00` 
              : `0 0 10px rgba(255, 255, 255, 0.5)`,
          }}
        />
      </div>

      {/* Cursor trail/follower */}
      <div
        className="fixed pointer-events-none z-[9998] mix-blend-difference transition-all duration-500 ease-out hidden md:block"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovering ? 2 : 1})`,
          opacity: isHovering ? 0.3 : 0.1,
        }}
      >
        <div
          className="w-8 h-8 rounded-full border transition-all duration-500"
          style={{
            borderColor: '#FF4D00',
            boxShadow: `0 0 30px #FF4D00`,
          }}
        />
      </div>
    </>
  );
}

