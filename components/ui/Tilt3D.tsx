'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface Tilt3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees, default 8
  scale?: number; // Scale factor on hover, default 1.02
  enableGlare?: boolean; // Show specular reflection
}

export function Tilt3D({
  children,
  className = '',
  maxTilt = 8,
  scale = 1.02,
  enableGlare = true,
}: Tilt3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const [transformStyle, setTransformStyle] = useState<string>('');
  const [glareStyle, setGlareStyle] = useState<{ opacity: number; x: number; y: number }>({
    opacity: 0,
    x: 50,
    y: 50,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchOrMobile, setIsTouchOrMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Disable 3D tilt on devices with coarse pointer (touch) or mobile screen width (< 768px)
      const hasTouch = window.matchMedia('(pointer: coarse)').matches;
      const isMobileWidth = window.innerWidth < 768;
      setIsTouchOrMobile(hasTouch || isMobileWidth);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isTouchOrMobile || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = -((y - centerY) / centerY) * maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        setTransformStyle(
          `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
        );

        if (enableGlare) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          setGlareStyle({ opacity: 1, x: glareX, y: glareY });
        }
      });
    },
    [isTouchOrMobile, maxTilt, scale, enableGlare]
  );

  const handleMouseEnter = () => {
    if (isTouchOrMobile) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isTouchOrMobile) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsHovered(false);
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  // On mobile / touch devices, render plain clean container with zero 3D overhead
  if (isTouchOrMobile) {
    return <div className={`relative w-full max-w-full min-w-0 ${className}`}>{children}</div>;
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: isHovered
          ? 'transform 0.06s cubic-bezier(0.25, 1, 0.5, 1)'
          : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
      }}
      className={`relative w-full max-w-full min-w-0 preserve-3d will-change-transform ${className}`}
    >
      {children}

      {/* Dynamic 3D Specular Glare Reflection */}
      {enableGlare && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 z-30"
          style={{
            opacity: glareStyle.opacity ? 0.35 : 0,
            background: `radial-gradient(circle at ${glareStyle.x}% ${glareStyle.y}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 65%)`,
          }}
        />
      )}
    </div>
  );
}
