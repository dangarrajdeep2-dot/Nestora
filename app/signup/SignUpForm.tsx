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
      <div className="glass-card bg-white/80 dark:bg-[#161024]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[24px] p-8 sm:p-10 shadow-[0_15px_35px_rgba(123,94,167,0.18)] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/30 text-[#7B5EA7] dark:text-purple-200 flex items-center justify-center mx-auto border border-[#7B5EA7]/20 shadow-sm">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight text-[#1B1530] dark:text-white">Verify Your Email</h2>
          <p className="text-xs sm:text-sm text-[#6B6580] dark:text-purple-200/70 max-w-sm mx-auto">
            We sent a verification link to <strong className="text-[#1B1530] dark:text-white font-semibold">{state.email}</strong>. Please check your inbox and click the link to activate your student account.
          </p>
        </div>

        {resendStatus && (
          <div className="p-3 text-xs rounded-2xl bg-[#D9C8F0]/30 text-[#4B2E83] dark:text-purple-200 border border-[#7B5EA7]/20">
            {resendStatus}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
          {state.email && (
            <button
              type="button"
              onClick={() => handleResend(state.email!)}
              disabled={resendLoading || resendCooldown}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-[#4B2E83] dark:text-purple-200 bg-[#D9C8F0]/50 hover:bg-[#D9C8F0] border border-[#7B5EA7]/20 transition disabled:opacity-50 cursor-pointer"
            >
              {resendLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              <span>{resendCooldown ? 'Wait 60s to resend' : 'Resend verification link'}</span>
            </button>
          )}

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.08em] text-white bg-[#7B5EA7] hover:bg-[#4B2E83] transition duration-300 hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(123,94,167,0.25)]"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card bg-white/80 dark:bg-[#161024]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[24px] p-8 sm:p-10 shadow-[0_15px_35px_rgba(123,94,167,0.18)] space-y-6">
      
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
        <div className="w-full border-t border-[#D9C8F0]/50 dark:border-white/10" />
        <span className="absolute bg-white/90 dark:bg-[#161024]/90 px-3 text-[11px] font-bold uppercase tracking-wider text-[#6B6580] dark:text-purple-300/70 backdrop-blur-sm">
          OR
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/80 flex items-center gap-1.5">
            <User size={14} className="text-[#7B5EA7]" />
            <span>Full Name</span>
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Scholar Student"
            className="w-full px-4 py-3 rounded-2xl text-sm bg-white/70 dark:bg-black/30 border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white placeholder-[#6B6580]/50 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]/25 focus:border-[#7B5EA7] transition"
          />
        </div>

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
            placeholder="student@university.edu"
            className="w-full px-4 py-3 rounded-2xl text-sm bg-white/70 dark:bg-black/30 border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white placeholder-[#6B6580]/50 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]/25 focus:border-[#7B5EA7] transition"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/80 flex items-center gap-1.5">
            <Lock size={14} className="text-[#7B5EA7]" />
            <span>Password (min. 8 characters)</span>
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-2xl text-sm bg-white/70 dark:bg-black/30 border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white placeholder-[#6B6580]/50 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7]/25 focus:border-[#7B5EA7] transition"
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/80 flex items-center gap-1.5">
            <Lock size={14} className="text-[#7B5EA7]" />
            <span>Confirm Password</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Create Student Account</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      {/* Footer link to Login */}
      <div className="pt-4 border-t border-[#D9C8F0]/50 dark:border-white/10 text-center text-xs text-[#6B6580] dark:text-purple-200/70">
        Already have a Nestora account?{' '}
        <Link href="/login" className="font-bold text-[#7B5EA7] dark:text-purple-300 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
