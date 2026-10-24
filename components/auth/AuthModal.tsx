'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, LogIn, Mail, Lock, Loader2, GraduationCap } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { supabase } from '@/lib/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  nextParam?: string;
  onSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  title = 'Welcome Back',
  subtitle = 'Sign in to access your saved stays, contact owners, and manage enquiries.',
  nextParam = '/',
  onSuccess,
}: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Support Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes('email not confirmed')) {
          setError('Your email has not been verified yet. Please check your inbox.');
        } else {
          setError(signInError.message || 'Invalid email or password.');
        }
        setIsSubmitting(false);
        return;
      }

      if (data?.user) {
        // Verify user is not an admin attempting to use student portal
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (adminRecord) {
          await supabase.auth.signOut();
          setError('This account is registered as an administrator. Please use the Admin Portal.');
          setIsSubmitting(false);
          return;
        }
      }

      // Success: notify application listeners
      window.dispatchEvent(new CustomEvent('nestora_auth_changed'));
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1B1530]/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="relative w-full max-w-[420px] bg-white/95 dark:bg-[#161024]/95 border border-white/80 dark:border-white/10 rounded-[24px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(123,94,167,0.25)] space-y-4 text-[#1B1530] dark:text-white animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 motion-reduce:animate-none backdrop-blur-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 rounded-full text-[#6B6580] hover:text-[#1B1530] dark:text-purple-200/70 dark:hover:text-white bg-white/70 dark:bg-white/10 border border-white/80 dark:border-white/10 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D9C8F0]/60 border border-[#7B5EA7]/20 text-[#7B5EA7] dark:bg-[#7B5EA7]/30 dark:text-purple-200 shadow-sm mb-0.5 mx-auto">
            <GraduationCap size={24} />
          </div>
          <h2
            id="auth-modal-title"
            className="font-heading text-2xl sm:text-3xl uppercase tracking-tight text-[#1B1530] dark:text-white"
          >
            {title}
          </h2>
          <p className="text-xs text-[#6B6580] dark:text-purple-200/70 leading-relaxed max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Google OAuth Sign In */}
        <div className="pt-1">
          <GoogleSignInButton
            disabled={isSubmitting}
            nextParam={nextParam}
            onError={setError}
            className="w-full"
          />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-1">
          <div className="w-full border-t border-[#D9C8F0]/60 dark:border-white/10" />
          <span className="absolute bg-white dark:bg-[#161024] px-3 text-[10px] font-bold uppercase tracking-wider text-[#6B6580] dark:text-purple-300/70">
            OR
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/80 flex items-center gap-1.5">
              <Mail size={13} className="text-[#7B5EA7]" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-white/70 dark:bg-black/30 border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white placeholder-[#6B6580]/50 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]/25 focus:border-[#7B5EA7] transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/80 flex items-center gap-1.5">
                <Lock size={13} className="text-[#7B5EA7]" />
                <span>Password</span>
              </label>
              <Link
                href="/forgot-password"
                onClick={onClose}
                className="text-[11px] font-bold text-[#7B5EA7] hover:text-[#4B2E83] dark:text-purple-300 dark:hover:underline transition"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm bg-white/70 dark:bg-black/30 border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white placeholder-[#6B6580]/50 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]/25 focus:border-[#7B5EA7] transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-full text-xs sm:text-sm font-bold uppercase tracking-[0.08em] text-white bg-[#7B5EA7] hover:bg-[#4B2E83] transition duration-300 hover:-translate-y-0.5 shadow-[0_10px_25px_rgba(123,94,167,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={15} />
                <span>Sign In to Student Account</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>

        {/* Footer: Sign Up & Guest Browsing */}
        <div className="pt-2 border-t border-[#D9C8F0]/50 dark:border-white/10 text-center space-y-2">
          <div className="text-xs text-[#6B6580] dark:text-purple-200/70">
            New to Nestora?{' '}
            <Link
              href={`/signup?next=${encodeURIComponent(nextParam)}`}
              onClick={onClose}
              className="font-bold text-[#7B5EA7] dark:text-purple-300 hover:underline"
            >
              Create free account
            </Link>
          </div>

          <div>
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-[#6B6580] dark:text-purple-300/60 hover:text-[#1B1530] dark:hover:text-white transition cursor-pointer underline-offset-4 hover:underline"
            >
              Continue browsing as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
