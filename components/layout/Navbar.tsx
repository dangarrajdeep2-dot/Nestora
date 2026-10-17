'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Sparkles,
  LogOut
} from 'lucide-react';
import { useSavedProperties } from '@/lib/utils/favorites';
import { useTheme } from '@/lib/utils/theme';
import { ListPropertyModal } from '@/components/property/ListPropertyModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/lib/supabase/client';
import { signOutStudentAction } from '@/lib/actions/userAuth';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

export function Navbar() {
  const pathname = usePathname();
  const { count: savedCount } = useSavedProperties();
  const { theme, toggleTheme } = useTheme();
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseAuthUser | null>(null);
  const [currentProfile, setCurrentProfile] = useState<{ name?: string } | null>(null);

  const syncAuthState = useCallback(async () => {
    try {
      const authPromise = supabase.auth.getUser();
      const authTimeout = new Promise<{ data: { user: null }; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: { user: null }, error: new Error('Auth timeout') }), 4000)
      );
      const { data: { user } } = await Promise.race([authPromise, authTimeout]);

      if (!user) {
        setCurrentUser(null);
        setCurrentProfile(null);
        return;
      }

      // Check if this user is an administrator; admins must not appear as students in the student navbar
      const adminPromise = supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      const adminTimeout = new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 3000)
      );
      const { data: adminRecord } = await Promise.race([adminPromise, adminTimeout]);

      if (adminRecord) {
        setCurrentUser(null);
        setCurrentProfile(null);
        return;
      }

      setCurrentUser(user);

      // Fetch student's profile name from public.users
      const profilePromise = supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();
      const profileTimeout = new Promise<{ data: null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 3000)
      );
      const { data: profile } = await Promise.race([profilePromise, profileTimeout]);

      if (profile?.name) {
        setCurrentProfile(profile);
      } else if (user.user_metadata?.name || user.user_metadata?.full_name) {
        setCurrentProfile({ name: user.user_metadata.name || user.user_metadata.full_name });
      } else {
        setCurrentProfile(null);
      }
    } catch (err) {
      console.error('Navbar sync error:', err);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      syncAuthState();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setCurrentUser(null);
        setCurrentProfile(null);
      } else if (session?.user) {
        syncAuthState();
      }
    });

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ name?: string }>;
      if (customEvent.detail?.name) {
        setCurrentProfile({ name: customEvent.detail.name });
      } else {
        syncAuthState();
      }
    };

    const handleAuthChange = () => {
      syncAuthState();
    };

    const handleFocus = () => {
      syncAuthState();
    };

    const handleOpenAuthModal = () => {
      setIsAuthModalOpen(true);
    };

    window.addEventListener('nestora_profile_updated', handleProfileUpdate);
    window.addEventListener('nestora_auth_changed', handleAuthChange);
    window.addEventListener('nestora_open_auth_modal', handleOpenAuthModal);
    window.addEventListener('focus', handleFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('nestora_profile_updated', handleProfileUpdate);
      window.removeEventListener('nestora_auth_changed', handleAuthChange);
      window.removeEventListener('nestora_open_auth_modal', handleOpenAuthModal);
      window.removeEventListener('focus', handleFocus);
    };
  }, [pathname, syncAuthState]);

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error on client:', err);
    }
    setCurrentUser(null);
    setCurrentProfile(null);
    window.dispatchEvent(new CustomEvent('nestora_auth_changed'));
    await signOutStudentAction();
  };

  const displayName = currentProfile?.name || currentUser?.user_metadata?.name || currentUser?.user_metadata?.full_name || 'Profile';
  const firstName = displayName.split(' ')[0];

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-30 transition-all duration-300 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
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
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent tracking-tight">
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

            {/* Auth CTA: Dynamic Student Session State */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all active:scale-95 shadow-md shadow-emerald-500/10"
                >
                  <User size={14} />
                  <span>{firstName}</span>
                </Link>
                <form onSubmit={handleSignOut} action={signOutStudentAction}>
                  <button
                    type="submit"
                    aria-label="Sign out"
                    title="Sign Out"
                    className="p-2 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    <LogOut size={16} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all active:scale-95 shadow-md shadow-emerald-500/10"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Header Right */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Mobile Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800"
            >
              {theme === 'dark' ? (
                <Sun size={15} className="text-amber-400" />
              ) : (
                <Moon size={15} className="text-slate-700" />
              )}
            </button>

            {/* Mobile Saved Heart */}
            <Link
              href="/saved"
              className="relative p-1.5 sm:p-2 text-slate-700 dark:text-slate-300 hover:text-rose-500"
              aria-label="Saved properties"
            >
              <Heart size={18} className={savedCount > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              {savedCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Mobile List Stay */}
            <button
              onClick={() => setIsListModalOpen(true)}
              className="text-[11px] font-bold px-2 sm:px-2.5 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-500/20 whitespace-nowrap"
            >
              + List Stay
            </button>

            {/* Mobile Sign In Button (When signed out) */}
            {!currentUser && (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[11px] font-bold px-2.5 py-1.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
              >
                Sign In
              </button>
            )}
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

          {currentUser ? (
            <Link
              href="/profile"
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                pathname === '/profile' 
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <User size={19} />
              <span className="text-[10px]">{firstName}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                pathname === '/profile' 
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <User size={19} />
              <span className="text-[10px]">Sign In</span>
            </button>
          )}

        </div>
      </nav>

      {/* Modal for Property Listing */}
      <ListPropertyModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
      />

      {/* Modal for Sign In / Sign Up */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        nextParam={pathname}
      />
    </>
  );
}
