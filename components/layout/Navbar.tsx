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
      {/* Desktop Header: Soft Pastel Lavender Glassmorphism */}
      <header className="sticky top-0 z-30 transition-all duration-300 bg-white/70 dark:bg-[#161024]/75 backdrop-blur-xl border-b border-white/80 dark:border-white/10 shadow-[0_4px_24px_rgba(123,94,167,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo & Brand with Condensed Heading */}
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
              <span className="text-2xl sm:text-3xl font-heading tracking-wider bg-gradient-to-r from-[#7B5EA7] via-[#9D7FD3] to-[#4B2E83] dark:from-[#D9C8F0] dark:via-[#9D7FD3] dark:to-[#E6DAF5] bg-clip-text text-transparent">
                Nestora
              </span>
              <span className="hidden sm:block text-[10px] text-[#7B5EA7] dark:text-[#D9C8F0] font-bold tracking-[0.08em] uppercase -mt-1">
                Student Stays
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links: Small Uppercase Letter-Spaced */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-white/60 dark:bg-[#201438]/60 p-1.5 rounded-full border border-white/80 dark:border-white/10 backdrop-blur-md shadow-sm">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.08em] transition-all duration-200 ${
                pathname === '/'
                  ? 'text-[#4B2E83] dark:text-[#D9C8F0] bg-white dark:bg-[#2C1D4A] shadow-sm'
                  : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530] dark:hover:text-[#F3EDFB]'
              }`}
            >
              Home
            </Link>

            <Link
              href="/search"
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.08em] transition-all duration-200 ${
                pathname.startsWith('/search')
                  ? 'text-[#4B2E83] dark:text-[#D9C8F0] bg-white dark:bg-[#2C1D4A] shadow-sm'
                  : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530] dark:hover:text-[#F3EDFB]'
              }`}
            >
              Find Stay
            </Link>

            <Link
              href="/saved"
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.08em] transition-all duration-200 flex items-center gap-1.5 ${
                pathname === '/saved'
                  ? 'text-[#7B5EA7] dark:text-[#D9C8F0] bg-white dark:bg-[#2C1D4A] shadow-sm'
                  : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530] dark:hover:text-[#F3EDFB]'
              }`}
            >
              <Heart size={14} className={savedCount > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              <span>Saved</span>
              {savedCount > 0 && (
                <span className="bg-[#7B5EA7] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {savedCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Desktop Right Actions: Theme Toggle, List Property & Dark Purple Pill CTA */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2.5 rounded-full bg-white/70 dark:bg-[#2C1D4A]/70 hover:bg-white dark:hover:bg-[#2C1D4A] text-[#4B2E83] dark:text-[#D9C8F0] border border-white/80 dark:border-white/10 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Night Mode'}
            >
              {theme === 'dark' ? (
                <Sun size={17} className="text-amber-300 animate-spin-once" />
              ) : (
                <Moon size={17} className="text-[#4B2E83]" />
              )}
            </button>

            {/* List Property Glassy CTA */}
            <button
              type="button"
              onClick={() => setIsListModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.08em] text-[#4B2E83] dark:text-[#D9C8F0] bg-[#D9C8F0]/40 dark:bg-[#7B5EA7]/20 hover:bg-[#D9C8F0]/70 border border-[#7B5EA7]/25 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <PlusCircle size={15} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
              <span>List Property</span>
            </button>

            {/* Auth CTA: Right-Side Dark Purple Pill Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.08em] text-white bg-[#4B2E83] hover:bg-[#7B5EA7] transition-all active:scale-95 shadow-md shadow-[#4B2E83]/20"
                >
                  <User size={14} />
                  <span>{firstName}</span>
                </Link>
                <form onSubmit={handleSignOut} action={signOutStudentAction}>
                  <button
                    type="submit"
                    aria-label="Sign out"
                    title="Sign Out"
                    className="p-2 rounded-full text-[#6B6580] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <LogOut size={16} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-[#A89EC0] hover:text-[#4B2E83] dark:hover:text-[#D9C8F0] transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.08em] text-white bg-[#4B2E83] hover:bg-[#7B5EA7] transition-all active:scale-95 shadow-md shadow-[#4B2E83]/25"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Header Right */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            
            {/* Mobile Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full bg-white/70 dark:bg-[#2C1D4A]/70 text-[#4B2E83] dark:text-[#D9C8F0] border border-white/80 dark:border-white/10"
            >
              {theme === 'dark' ? (
                <Sun size={15} className="text-amber-300" />
              ) : (
                <Moon size={15} className="text-[#4B2E83]" />
              )}
            </button>

            {/* Mobile Saved Heart */}
            <Link
              href="/saved"
              className="relative p-2 text-[#4B2E83] dark:text-[#D9C8F0] hover:text-rose-500"
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
              className="text-[11px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 bg-[#D9C8F0]/50 dark:bg-[#7B5EA7]/20 text-[#4B2E83] dark:text-[#D9C8F0] rounded-full border border-[#7B5EA7]/25 whitespace-nowrap"
            >
              + List
            </button>

            {/* Mobile Sign In Button (When signed out) */}
            {!currentUser && (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[11px] font-bold uppercase tracking-[0.08em] px-3.5 py-1.5 bg-[#4B2E83] text-white rounded-full shadow-sm transition active:scale-95 cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar: Soft Lilac Glassmorphic */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/85 dark:bg-[#161024]/85 backdrop-blur-xl border-t border-white/80 dark:border-white/10 z-40 px-3 py-2 transition-colors shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              pathname === '/' 
                ? 'text-[#7B5EA7] dark:text-[#D9C8F0] font-bold' 
                : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530]'
            }`}
          >
            <Home size={19} />
            <span className="text-[10px] uppercase tracking-[0.06em]">Home</span>
          </Link>

          <Link
            href="/search"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
              pathname.startsWith('/search') 
                ? 'text-[#7B5EA7] dark:text-[#D9C8F0] font-bold' 
                : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530]'
            }`}
          >
            <Compass size={19} />
            <span className="text-[10px] uppercase tracking-[0.06em]">Search</span>
          </Link>

          <Link
            href="/saved"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl relative transition ${
              pathname === '/saved' 
                ? 'text-rose-500 font-bold' 
                : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530]'
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
            <span className="text-[10px] uppercase tracking-[0.06em]">Saved</span>
          </Link>

          {currentUser ? (
            <Link
              href="/profile"
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                pathname === '/profile' 
                  ? 'text-[#7B5EA7] dark:text-[#D9C8F0] font-bold' 
                  : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530]'
              }`}
            >
              <User size={19} />
              <span className="text-[10px] uppercase tracking-[0.06em]">{firstName}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                pathname === '/profile' 
                  ? 'text-[#7B5EA7] dark:text-[#D9C8F0] font-bold' 
                  : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530]'
              }`}
            >
              <User size={19} />
              <span className="text-[10px] uppercase tracking-[0.06em]">Sign In</span>
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
