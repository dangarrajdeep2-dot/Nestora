'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { signUpStudentAction, resendConfirmationAction, AuthActionResult } from '@/lib/actions/userAuth';
import { User, Mail, Lock, Sparkles, CheckCircle2, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    signUpStudentAction,
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
        setResendStatus('Confirmation link resent successfully. Please check your inbox.');
        setResendCooldown(true);
        setTimeout(() => setResendCooldown(false), 60000);
      } else {
        setResendStatus(result.error || 'Failed to resend confirmation email.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  // If signup succeeded and confirmation is pending:
  if (state?.success && state.needsConfirmation) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verify Your Email</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            We sent a verification link to <strong className="text-slate-900 dark:text-white font-semibold">{state.email}</strong>. Please check your inbox and click the link to activate your student account.
          </p>
        </div>

        {resendStatus && (
          <div className="p-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {resendStatus}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
          {state.email && (
            <button
              type="button"
              onClick={() => handleResend(state.email!)}
              disabled={resendLoading || resendCooldown}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              {resendLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              <span>{resendCooldown ? 'Wait 60s to resend' : 'Resend verification link'}</span>
            </button>
          )}

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 transition shadow-md"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
      
      {(state?.error || googleError) && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold">
          {googleError || state?.error}
        </div>
      )}

      {/* Google Sign In */}
      <GoogleSignInButton
        disabled={isPending}
        onError={setGoogleError}
        text="Continue with Google"
      />

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200/80 dark:border-slate-800/80" />
        <span className="absolute bg-white/90 dark:bg-slate-900/90 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 backdrop-blur-sm">
          OR
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User size={14} className="text-emerald-500" />
            <span>Full Name</span>
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Scholar Student"
            className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

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
            placeholder="student@university.edu"
            className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Lock size={14} className="text-emerald-500" />
            <span>Password (min. 8 characters)</span>
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Lock size={14} className="text-emerald-500" />
            <span>Confirm Password</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Create Student Account</span>
            </>
          )}
        </button>
      </form>

      {/* Footer link to Login */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-500 dark:text-slate-400">
        Already have a Nestora account?{' '}
        <Link href="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
