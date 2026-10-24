'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signInStudentAction, resendConfirmationAction, AuthActionResult } from '@/lib/actions/userAuth';
import { Mail, Lock, LogIn, Loader2, RefreshCw } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next') || '/profile';
  const errorParam = searchParams.get('error');

  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    signInStudentAction,
    null
  );

  const [googleError, setGoogleError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);

  const handleResend = async (email: string) => {
    if (resendCooldown) return;
    setResendLoading(true);
    setResendStatus(null);
    try {
      const result = await resendConfirmationAction(email);
      if (result.success) {
        setResendStatus('Verification link resent. Please check your inbox.');
        setResendCooldown(true);
        setTimeout(() => setResendCooldown(false), 60000);
      } else {
        setResendStatus(result.error || 'Failed to resend confirmation email.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const initialError = errorParam === 'invalid_or_expired_link'
    ? 'The confirmation link has expired or is invalid. Please sign in or request a new one.'
    : errorParam === 'access_denied'
    ? 'Sign in with Google was cancelled. Please try again.'
    : errorParam
    ? decodeURIComponent(errorParam)
    : null;

  return (
    <div className="glass-card bg-white/80 dark:bg-[#161024]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[24px] p-8 sm:p-10 shadow-[0_15px_35px_rgba(123,94,167,0.18)] space-y-6">
      
      {(state?.error || initialError || googleError) && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold space-y-2">
          <p>{googleError || state?.error || initialError}</p>
          
          {state?.needsConfirmation && state.email && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleResend(state.email!)}
                disabled={resendLoading || resendCooldown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#4B2E83] dark:text-purple-200 bg-[#D9C8F0]/50 hover:bg-[#D9C8F0] border border-[#7B5EA7]/20 transition disabled:opacity-50 cursor-pointer"
              >
                {resendLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                <span>{resendCooldown ? 'Wait 60s' : 'Resend verification link'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {resendStatus && (
        <div className="p-3 text-xs rounded-2xl bg-[#D9C8F0]/30 text-[#4B2E83] dark:text-purple-200 border border-[#7B5EA7]/20">
          {resendStatus}
        </div>
      )}

      {/* Google Sign In */}
      <GoogleSignInButton
        disabled={isPending}
        nextParam={nextParam}
        onError={setGoogleError}
      />

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-[#D9C8F0]/50 dark:border-white/10" />
        <span className="absolute bg-white/90 dark:bg-[#161024]/90 px-3 text-[11px] font-bold uppercase tracking-wider text-[#6B6580] dark:text-purple-300/70 backdrop-blur-sm">
          OR
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={nextParam} />

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/80 flex items-center gap-1.5">
            <Mail size={14} className="text-[#7B5EA7]" />
            <span>Email Address</span>
          </label>
          <input
            type="email"
            name="email"
            required
            defaultValue={state?.email || ''}
            placeholder="student@university.edu"
            className="w-full px-4 py-3 rounded-2xl text-sm bg-white/70 dark:bg-black/30 border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white placeholder-[#6B6580]/50 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]/25 focus:border-[#7B5EA7] transition"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/80 flex items-center gap-1.5">
              <Lock size={14} className="text-[#7B5EA7]" />
              <span>Password</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#7B5EA7] dark:text-purple-300 hover:text-[#4B2E83] hover:underline transition"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-2xl text-sm bg-white/70 dark:bg-black/30 border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white placeholder-[#6B6580]/50 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]/25 focus:border-[#7B5EA7] transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold uppercase tracking-[0.08em] text-white bg-[#7B5EA7] hover:bg-[#4B2E83] transition duration-300 hover:-translate-y-0.5 shadow-[0_10px_25px_rgba(123,94,167,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn size={16} />
              <span>Sign In to Student Account</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      {/* Footer link to Sign Up */}
      <div className="pt-4 border-t border-[#D9C8F0]/50 dark:border-white/10 text-center text-xs text-[#6B6580] dark:text-purple-200/70">
        New to Nestora?{' '}
        <Link href="/signup" className="font-bold text-[#7B5EA7] dark:text-purple-300 hover:underline">
          Create an Account
        </Link>
      </div>
    </div>
  );
}
