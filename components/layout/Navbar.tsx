'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  Heart, 
  PlusCircle, 
  User, 
  Home, 
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useSavedProperties } from '@/lib/utils/favorites';
import { useTheme } from '@/lib/utils/theme';
import { ListPropertyModal } from '@/components/property/ListPropertyModal';

export function Navbar() {
  const pathname = usePathname();
  const { count: savedCount } = useSavedProperties();
  const { theme, toggleTheme } = useTheme();
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-30 transition-all duration-300 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo & Brand with Uploaded Icon */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-all duration-200 shrink-0">
              <Image
                src="/logo.png"
                alt="Nestora"
                width={40}
                height={40}
                className="w-full h-full object-contain drop-shadow-sm"
                priority
              />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-500 transition-colors">
                Nestora
              </span>
              <span className="hidden sm:block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase -mt-1">
                Student Stays
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links with Glassy Pill Styling */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-slate-100/70 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-md">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                pathname === '/'
                  ? 'text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Home
            </Link>

            <Link
              href="/search"
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                pathname.startsWith('/search')
                  ? 'text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Find Stay
            </Link>

            <Link
              href="/saved"
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                pathname === '/saved'
                  ? 'text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Heart size={15} className={savedCount > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {savedCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Desktop Right Actions: Theme Toggle, List Property & Profile */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800/80 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Night Mode'}
            >
              {theme === 'dark' ? (
                <Sun size={17} className="text-amber-400 animate-spin-once" />
              ) : (
                <Moon size={17} className="text-slate-700" />
              )}
            </button>

            {/* List Property Glassy CTA */}
            <button
              type="button"
              onClick={() => setIsListModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <PlusCircle size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>List Property</span>
            </button>

            {/* Profile CTA */}
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all active:scale-95 shadow-md shadow-emerald-500/10"
            >
              <User size={14} />
              <span>Profile</span>
            </Link>
          </div>

          {/* Mobile Header Right */}
          <div className="flex md:hidden items-center gap-2">
            
            {/* Mobile Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800"
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-amber-400" />
              ) : (
                <Moon size={16} className="text-slate-700" />
              )}
            </button>

            {/* Mobile Saved Heart */}
            <Link
              href="/saved"
              className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-rose-500"
              aria-label="Saved properties"
            >
              <Heart size={19} className={savedCount > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              {savedCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Mobile List Stay */}
            <button
              onClick={() => setIsListModalOpen(true)}
              className="text-[11px] font-bold px-2.5 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-500/20"
            >
              + List Stay
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Glassy & Dark Mode Ready) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/80 z-40 px-3 py-2 transition-colors">
        <div className="flex items-center justify-around max-w-md mx-auto">
          
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              pathname === '/' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Home size={19} />
            <span className="text-[10px]">Home</span>
          </Link>

          <Link
            href="/search"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              pathname.startsWith('/search') 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Compass size={19} />
            <span className="text-[10px]">Search</span>
          </Link>

          <Link
            href="/saved"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl relative transition ${
              pathname === '/saved' 
                ? 'text-rose-500 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <div className="relative">
              <Heart size={19} className={savedCount > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Saved</span>
          </Link>

          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              pathname === '/profile' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <User size={19} />
            <span className="text-[10px]">Profile</span>
          </Link>

        </div>
      </nav>

      {/* Modal for Property Listing */}
      <ListPropertyModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
      />
    </>
  );
}
