'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Utensils, 
  Wifi, 
  Sparkles, 
  Bed, 
  Navigation 
} from 'lucide-react';

export function Hero3DVisualizer() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setMousePos({ x, y });
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  // Rest isometric angle
  const baseRotateY = -8;
  const baseRotateX = 6;

  // Active tilt angle
  const rotateY = baseRotateY + mousePos.x * 10;
  const rotateX = baseRotateX - mousePos.y * 10;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-lg mx-auto py-6 sm:py-10 perspective-1500 select-none cursor-pointer"
    >
      {/* 3D Ambient Volumetric Soft Lilac Glow Behind */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-tr from-[#D9C8F0]/40 via-[#7B5EA7]/25 to-transparent dark:from-[#7B5EA7]/25 dark:via-[#4B2E83]/15 dark:to-transparent rounded-full blur-3xl -z-10 animate-pulse-ring pointer-events-none" 
      />

      {/* Continuous Gentle Float Wrapper */}
      <div className="animate-float-slow preserve-3d will-change-transform">
        
        {/* Interactive Tilt Container */}
        <div
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateY(${rotateY.toFixed(2)}deg) rotateX(${rotateX.toFixed(2)}deg) scale(1.02)`
              : `perspective(1000px) rotateY(${baseRotateY}deg) rotateX(${baseRotateX}deg) scale(1)`,
            transition: isHovered 
              ? 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)' 
              : 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            transformStyle: 'preserve-3d',
          }}
          className="relative preserve-3d will-change-transform"
        >

          {/* 1. Main Base 3D Glass Card */}
          <div className="glass-card rounded-[24px] overflow-hidden border border-white/80 dark:border-white/15 shadow-2xl bg-white/80 dark:bg-[#1C142E]/80 p-4 transform translate-z-10">
            
            {/* Main Visual Image */}
            <div className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden shadow-inner">
              <Image
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
                alt="Student PG Room"
                fill
                priority
                className="object-cover"
              />
              {/* Top gradient shadow */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

              {/* In-Image Tag */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-[#7B5EA7]/95 text-white text-[10px] font-bold uppercase tracking-[0.06em] px-3 py-1 rounded-full shadow-md backdrop-blur-md flex items-center gap-1">
                  <Sparkles size={11} />
                  Student Stay
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-extrabold text-base sm:text-lg drop-shadow-md">
                  Student Home PG
                </h4>
                <p className="text-xs text-[#D9C8F0] flex items-center drop-shadow font-medium">
                  <MapPin size={12} className="mr-1 text-[#D9C8F0]" />
                  Near Saurashtra University • Kotecha Chowk
                </p>
              </div>
            </div>

            {/* Bottom Card Summary */}
            <div className="pt-3 px-2 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-[#6B6580] dark:text-[#A89EC0] font-semibold">
                <span className="flex items-center gap-1">
                  <Utensils size={13} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
                  3 Meals
                </span>
                <span className="flex items-center gap-1">
                  <Wifi size={13} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
                  Wi-Fi
                </span>
                <span className="flex items-center gap-1">
                  <Bed size={13} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
                  AC Room
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-[#7B5EA7] dark:text-[#9D7FD3]">
                  ₹7,500
                </span>
                <span className="text-[10px] text-[#6B6580] dark:text-[#A89EC0] block -mt-1">/month</span>
              </div>
            </div>
          </div>

          {/* 2. Floating 3D Element: Top-Left "Verified Stay" Badge */}
          <div className="absolute -top-5 -left-4 sm:-left-6 z-20 pointer-events-none animate-float-slow">
            <div
              style={{
                transform: `translateZ(45px) translateX(${mousePos.x * -6}px) translateY(${mousePos.y * -6}px)`,
                transition: 'transform 0.15s ease-out',
                transformStyle: 'preserve-3d',
              }}
              className="glass rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white/80 dark:border-white/15 flex items-center gap-2.5 bg-white/90 dark:bg-[#1E1535]/90"
            >
              <div className="w-9 h-9 rounded-full bg-[#7B5EA7] text-white flex items-center justify-center shadow-md shadow-[#7B5EA7]/30">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1B1530] dark:text-white flex items-center gap-1">
                  <span>Verified Stay</span>
                  <span className="w-2 h-2 rounded-full bg-[#7B5EA7] animate-ping" />
                </div>
                <div className="text-[10px] text-[#6B6580] dark:text-[#A89EC0] font-medium">100% Student Safe</div>
              </div>
            </div>
          </div>

          {/* 3. Floating 3D Element: Top-Right "Rating Review" Pill */}
          <div className="absolute -top-3 -right-3 sm:-right-6 z-20 pointer-events-none animate-float-reverse">
            <div
              style={{
                transform: `translateZ(50px) translateX(${mousePos.x * 6}px) translateY(${mousePos.y * 6}px)`,
                transition: 'transform 0.15s ease-out',
                transformStyle: 'preserve-3d',
              }}
              className="glass rounded-2xl p-2.5 sm:p-3 shadow-xl border border-white/80 dark:border-white/15 flex items-center gap-2 bg-white/90 dark:bg-[#1E1535]/90"
            >
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold px-2 py-1 rounded-full text-xs border border-amber-500/20">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span>4.9</span>
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#1B1530] dark:text-white">Student Choice</div>
                <div className="text-[10px] text-[#6B6580] dark:text-[#A89EC0]">Zero Brokerage</div>
              </div>
            </div>
          </div>

          {/* 4. Floating 3D Element: Bottom-Left "Distance" Pill */}
          <div className="absolute -bottom-4 -left-3 sm:-left-5 z-20 pointer-events-none">
            <div
              style={{
                transform: `translateZ(40px) translateX(${mousePos.x * -8}px) translateY(${mousePos.y * -8}px)`,
                transition: 'transform 0.15s ease-out',
                transformStyle: 'preserve-3d',
              }}
              className="glass rounded-2xl px-3.5 py-2 shadow-xl border border-white/80 dark:border-white/15 flex items-center gap-2 bg-white/90 dark:bg-[#1E1535]/90"
            >
              <div className="w-7 h-7 rounded-full bg-[#D9C8F0]/60 text-[#4B2E83] dark:text-[#D9C8F0] flex items-center justify-center">
                <Navigation size={13} />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-[#4B2E83] dark:text-[#D9C8F0]">
                  0.8 km from Campus
                </div>
                <div className="text-[9px] text-[#6B6580] dark:text-[#A89EC0]">5 mins walking</div>
              </div>
            </div>
          </div>

          {/* 5. Floating 3D Element: Bottom-Right "Live Beds" Alert */}
          <div className="absolute -bottom-5 -right-3 sm:-right-5 z-20 pointer-events-none animate-float-slow">
            <div
              style={{
                transform: `translateZ(55px) translateX(${mousePos.x * 8}px) translateY(${mousePos.y * 8}px)`,
                transition: 'transform 0.15s ease-out',
                transformStyle: 'preserve-3d',
              }}
              className="glass rounded-2xl px-3.5 py-2.5 shadow-2xl border border-white/80 dark:border-white/15 flex items-center gap-2.5 bg-white/90 dark:bg-[#1E1535]/90"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#7B5EA7] text-white flex items-center justify-center font-bold text-xs shadow-md">
                  ✓
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#9D7FD3] border-2 border-white dark:border-[#1E1535]" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#1B1530] dark:text-white">
                  2 Beds Left Today
                </div>
                <div className="text-[9px] text-[#7B5EA7] dark:text-[#D9C8F0] font-bold">
                  Instant Owner Connect
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
