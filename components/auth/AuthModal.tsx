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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
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
        className="relative w-full max-w-[420px] bg-slate-900/95 dark:bg-slate-950/95 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 text-slate-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 motion-reduce:animate-none backdrop-blur-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm mb-0.5">
            <GraduationCap size={24} />
          </div>
          <h2
            id="auth-modal-title"
            className="text-xl sm:text-2xl font-black tracking-tight text-white"
          >
            {title}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
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
          <div className="w-full border-t border-slate-800" />
          <span className="absolute bg-slate-900 dark:bg-slate-950 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            OR
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Mail size={13} className="text-emerald-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock size={13} className="text-emerald-400" />
                <span>Password</span>
              </label>
              <Link
                href="/forgot-password"
                onClick={onClose}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition"
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
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
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
              </>
            )}
          </button>
        </form>

        {/* Footer: Sign Up & Guest Browsing */}
        <div className="pt-2 border-t border-slate-800/80 text-center space-y-2">
          <div className="text-xs text-slate-400">
            New to Nestora?{' '}
            <Link
              href={`/signup?next=${encodeURIComponent(nextParam)}`}
              onClick={onClose}
              className="font-bold text-emerald-400 hover:underline"
            >
              Create free account
            </Link>
          </div>

          <div>
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition cursor-pointer underline-offset-4 hover:underline"
            >
              Continue browsing as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
