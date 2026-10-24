'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  KeyRound
} from 'lucide-react';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const codeParam = searchParams.get('code');

  const [verifying, setVerifying] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [isInvalidLink, setIsInvalidLink] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyRecoverySession() {
      // If URL has error param, the link is definitely invalid or expired
      if (errorParam) {
        if (isMounted) {
          setIsInvalidLink(true);
          setVerifying(false);
        }
        return;
      }

      try {
        // If code param exists in current URL, exchange it for session
        if (codeParam) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(codeParam);
          if (exchangeError) {
            console.error('Recovery code exchange failed:', exchangeError);
            if (isMounted) {
              setIsInvalidLink(true);
              setVerifying(false);
            }
            return;
          }
        }

        // Check if an authenticated user session exists (established via callback or exchange)
        const { data: { user } } = await supabase.auth.getUser();

        if (user && isMounted) {
          setHasRecoverySession(true);
          setIsInvalidLink(false);
          setVerifying(false);
          return;
        }

        // Check if session exists in storage
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          setHasRecoverySession(true);
          setIsInvalidLink(false);
          setVerifying(false);
          return;
        }

        // If no user or session found
        if (isMounted) {
          setIsInvalidLink(true);
          setVerifying(false);
        }
      } catch (err) {
        console.error('Session verification error:', err);
        if (isMounted) {
          setIsInvalidLink(true);
          setVerifying(false);
        }
      }
    }

    verifyRecoverySession();

    // Listen to auth events (e.g. PASSWORD_RECOVERY or SIGNED_IN)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setHasRecoverySession(true);
        setIsInvalidLink(false);
        setVerifying(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [errorParam, codeParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Minimum password length validation
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // Password matching validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update password using the authenticated Supabase recovery session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Successfully updated! Sign out of the temporary recovery session so user can log in cleanly
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while updating your password.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Verifying session
  if (verifying) {
    return (
      <div className="glass-card bg-white/80 dark:bg-[#161024]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[24px] p-8 sm:p-12 shadow-[0_15px_35px_rgba(123,94,167,0.18)] text-center space-y-4">
        <Loader2 size={36} className="animate-spin text-[#7B5EA7] mx-auto" />
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/70">
          Verifying password reset link...
        </p>
      </div>
    );
  }

  // State 2: Success state
  if (isSuccess) {
    return (
      <div className="glass-card bg-white/80 dark:bg-[#161024]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[24px] p-8 sm:p-10 shadow-[0_15px_35px_rgba(123,94,167,0.18)] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/30 text-[#7B5EA7] dark:text-purple-200 flex items-center justify-center mx-auto border border-[#7B5EA7]/20 shadow-sm">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight text-[#1B1530] dark:text-white">Password Updated!</h2>
          <p className="text-xs sm:text-sm text-[#6B6580] dark:text-purple-200/70 max-w-sm mx-auto leading-relaxed">
            Your password has been reset successfully. You can now sign in to your student account using your new password.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-[0.08em] text-white bg-[#7B5EA7] hover:bg-[#4B2E83] transition duration-300 hover:-translate-y-0.5 shadow-[0_10px_25px_rgba(123,94,167,0.3)]"
          >
            <span>Sign In to Student Account</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // State 3: Invalid or expired link
  if (isInvalidLink || !hasRecoverySession) {
    return (
      <div className="glass-card bg-white/80 dark:bg-[#161024]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[24px] p-8 sm:p-10 shadow-[0_15px_35px_rgba(123,94,167,0.18)] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <AlertTriangle size={36} />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight text-[#1B1530] dark:text-white">Reset Link Expired</h2>
          <p className="text-xs sm:text-sm text-[#6B6580] dark:text-purple-200/70 max-w-sm mx-auto leading-relaxed">
            This password reset link is invalid, has expired, or has already been used. For your security, reset links are single-use only.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-[0.08em] text-white bg-[#7B5EA7] hover:bg-[#4B2E83] transition shadow-[0_8px_20px_rgba(123,94,167,0.25)]"
          >
            <KeyRound size={16} />
            <span>Request New Reset Link</span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-[0.08em] text-[#1B1530] dark:text-white bg-white/70 dark:bg-white/10 hover:bg-[#D9C8F0]/40 transition border border-white/80 dark:border-white/10"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  // State 4: Valid recovery session - Show reset password form
  return (
    <div className="glass-card bg-white/80 dark:bg-[#161024]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[24px] p-8 sm:p-10 shadow-[0_15px_35px_rgba(123,94,167,0.18)] space-y-6">
      
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/80 flex items-center gap-1.5">
            <Lock size={14} className="text-[#7B5EA7]" />
            <span>New Password (min 8 characters)</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              required
              minLength={8}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 rounded-2xl text-sm bg-white/70 dark:bg-black/30 border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white placeholder-[#6B6580]/50 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]/25 focus:border-[#7B5EA7] transition"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#6B6580] hover:text-[#1B1530] dark:hover:text-white transition cursor-pointer"
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/80 flex items-center gap-1.5">
            <Lock size={14} className="text-[#7B5EA7]" />
            <span>Confirm New Password</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              required
              minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 rounded-2xl text-sm bg-white/70 dark:bg-black/30 border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white placeholder-[#6B6580]/50 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]/25 focus:border-[#7B5EA7] transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#6B6580] hover:text-[#1B1530] dark:hover:text-white transition cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold uppercase tracking-[0.08em] text-white bg-[#7B5EA7] hover:bg-[#4B2E83] transition duration-300 hover:-translate-y-0.5 shadow-[0_10px_25px_rgba(123,94,167,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Updating password...</span>
            </>
          ) : (
            <>
              <span>Save New Password</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Footer link back to Sign In */}
      <div className="pt-4 border-t border-[#D9C8F0]/50 dark:border-white/10 text-center text-xs text-[#6B6580] dark:text-purple-200/70">
        Remembered your existing password?{' '}
        <Link href="/login" className="font-bold text-[#7B5EA7] dark:text-purple-300 hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
