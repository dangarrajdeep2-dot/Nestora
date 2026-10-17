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
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
      
      {(state?.error || initialError || googleError) && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold space-y-2">
          <p>{googleError || state?.error || initialError}</p>
          
          {state?.needsConfirmation && state.email && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleResend(state.email!)}
                disabled={resendLoading || resendCooldown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
              >
                {resendLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                <span>{resendCooldown ? 'Wait 60s' : 'Resend verification link'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {resendStatus && (
        <div className="p-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
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
        <div className="w-full border-t border-slate-200/80 dark:border-slate-800/80" />
        <span className="absolute bg-white/90 dark:bg-slate-900/90 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 backdrop-blur-sm">
          OR
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={nextParam} />

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Mail size={14} className="text-emerald-500" />
            <span>Email Address</span>
          </label>
          <input
            type="email"
            name="email"
            required
            defaultValue={state?.email || ''}
            placeholder="student@university.edu"
            className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock size={14} className="text-emerald-500" />
              <span>Password</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
            </>
          )}
        </button>
      </form>

      {/* Footer link to Sign Up */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-500 dark:text-slate-400">
        New to Nestora?{' '}
        <Link href="/signup" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
          Create an Account
        </Link>
      </div>
    </div>
  );
}
