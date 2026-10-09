'use client';

import React, { useState } from 'react';
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  // Subtle interactive tilt combined with default isometric angle
  const rotateY = -10 + mousePos.x * 12;
  const rotateX = 8 - mousePos.y * 12;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-lg mx-auto py-6 sm:py-10 perspective-1500 select-none"
    >
      {/* 3D Ambient Volumetric Glow Behind */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-tr from-emerald-500/25 via-teal-400/20 to-emerald-300/10 dark:from-emerald-600/30 dark:via-teal-600/20 dark:to-transparent rounded-full blur-3xl -z-10 animate-pulse-ring pointer-events-none" 
      />

      {/* Main 3D Floating Stage Container */}
      <div
        style={
          isHovered
            ? {
                transform: `perspective(1200px) rotateY(${rotateY.toFixed(2)}deg) rotateX(${rotateX.toFixed(2)}deg)`,
                transition: 'transform 0.15s ease-out',
                transformStyle: 'preserve-3d',
              }
            : {
                transformStyle: 'preserve-3d',
              }
        }
        className={`relative preserve-3d will-change-transform ${
          !isHovered ? 'animate-float-3d' : ''
        }`}
      >

        {/* 1. Main Base 3D Glass Card */}
        <div className="glass-card rounded-3xl overflow-hidden border border-white/60 dark:border-slate-800 shadow-2xl bg-white/90 dark:bg-slate-900/90 p-3.5 sm:p-4 transform translate-z-10">
          
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
              <span className="bg-emerald-600/95 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md backdrop-blur-md flex items-center gap-1">
                <Sparkles size={12} />
                Student Stay
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h4 className="font-extrabold text-base sm:text-lg drop-shadow-md">
                Student Home PG
              </h4>
              <p className="text-xs text-slate-200 flex items-center drop-shadow">
                <MapPin size={12} className="mr-1 text-emerald-400" />
                Near Saurashtra University • Kotecha Chowk
              </p>
            </div>
          </div>

          {/* Bottom Card Summary */}
          <div className="pt-3 px-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold">
              <span className="flex items-center gap-1">
                <Utensils size={13} className="text-emerald-500" />
                3 Meals
              </span>
              <span className="flex items-center gap-1">
                <Wifi size={13} className="text-emerald-500" />
                Wi-Fi
              </span>
              <span className="flex items-center gap-1">
                <Bed size={13} className="text-emerald-500" />
                AC Room
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                ₹7,500
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1">/month</span>
            </div>
          </div>
        </div>

        {/* 2. Floating 3D Element: Top-Left "Verified Stay" Badge */}
        <div
          style={{
            transform: `translateZ(45px) translateX(${mousePos.x * -8}px) translateY(${mousePos.y * -8}px)`,
          }}
          className="absolute -top-5 -left-4 sm:-left-6 glass rounded-2xl p-2.5 sm:p-3 shadow-xl border border-emerald-500/30 flex items-center gap-2.5 bg-white/95 dark:bg-slate-900/95 animate-float-slow z-20 pointer-events-none"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
              <span>Verified Stay</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">100% Student Safe</div>
          </div>
        </div>

        {/* 3. Floating 3D Element: Top-Right "Rating Review" Pill */}
        <div
          style={{
            transform: `translateZ(50px) translateX(${mousePos.x * 10}px) translateY(${mousePos.y * 10}px)`,
          }}
          className="absolute -top-3 -right-3 sm:-right-6 glass rounded-2xl p-2.5 sm:p-3 shadow-xl border border-amber-400/30 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 animate-float-reverse z-20 pointer-events-none"
        >
          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black px-2 py-1 rounded-lg text-xs border border-amber-500/20">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span>4.9</span>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white">Student Choice</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Zero Brokerage</div>
          </div>
        </div>

        {/* 4. Floating 3D Element: Bottom-Left "Distance" Pill */}
        <div
          style={{
            transform: `translateZ(40px) translateX(${mousePos.x * -12}px) translateY(${mousePos.y * -12}px)`,
          }}
          className="absolute -bottom-4 -left-3 sm:-left-5 glass rounded-2xl px-3 py-2 shadow-xl border border-emerald-500/30 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 z-20 pointer-events-none"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Navigation size={14} />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400">
              0.8 km from Campus
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400">5 mins walking</div>
          </div>
        </div>

        {/* 5. Floating 3D Element: Bottom-Right "Live Enquiry" Alert */}
        <div
          style={{
            transform: `translateZ(55px) translateX(${mousePos.x * 12}px) translateY(${mousePos.y * 12}px)`,
          }}
          className="absolute -bottom-5 -right-3 sm:-right-5 glass rounded-2xl px-3.5 py-2.5 shadow-2xl border border-emerald-500/30 flex items-center gap-2.5 bg-white/95 dark:bg-slate-900/95 animate-float-slow z-20 pointer-events-none"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-bold text-xs shadow-md">
              ✓
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <div className="text-[11px] font-black text-slate-900 dark:text-white">
              2 Beds Left Today
            </div>
            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
              Instant Owner Connect
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
