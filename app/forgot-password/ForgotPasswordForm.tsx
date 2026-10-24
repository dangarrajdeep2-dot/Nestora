'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { requestPasswordResetAction, resendPasswordResetAction, AuthActionResult } from '@/lib/actions/userAuth';
import { Mail, CheckCircle2, ArrowRight, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    requestPasswordResetAction,
    null
  );

  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const handleResend = async (email: string) => {
    if (resendCooldown || resendLoading) return;
    setResendLoading(true);
    setResendStatus(null);
    try {
      const result = await resendPasswordResetAction(email);
      if (result.success) {
        setResendStatus('Reset link resent. Please check your inbox and spam folder.');
        setResendCooldown(true);
        setCooldownSeconds(60);
        const timer = setInterval(() => {
          setCooldownSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setResendCooldown(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setResendStatus(result.error || 'Failed to resend reset email.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  // If request succeeded, show neutral confirmation message
  if (state?.success) {
    return (
      <div className="glass-card bg-white/80 dark:bg-[#161024]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[24px] p-8 sm:p-10 shadow-[0_15px_35px_rgba(123,94,167,0.18)] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/30 text-[#7B5EA7] dark:text-purple-200 flex items-center justify-center mx-auto border border-[#7B5EA7]/20 shadow-sm">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight text-[#1B1530] dark:text-white">Check Your Email</h2>
          <p className="text-xs sm:text-sm text-[#6B6580] dark:text-purple-200/70 max-w-sm mx-auto leading-relaxed">
            If an account is associated with <strong className="text-[#1B1530] dark:text-white font-semibold">{state.email}</strong>, we have sent instructions to reset your password.
          </p>
          <p className="text-xs text-[#6B6580] dark:text-purple-200/60">
            Please check your inbox as well as your spam folder.
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
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-[#4B2E83] dark:text-purple-200 bg-[#D9C8F0]/50 hover:bg-[#D9C8F0] border border-[#7B5EA7]/20 transition disabled:opacity-50 cursor-pointer"
            >
              {resendLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              <span>{resendCooldown ? `Resend in ${cooldownSeconds}s` : 'Resend reset link'}</span>
            </button>
          )}

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.08em] text-[#1B1530] dark:text-white bg-white/70 dark:bg-white/10 hover:bg-[#D9C8F0]/40 transition border border-white/80 dark:border-white/10"
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card bg-white/80 dark:bg-[#161024]/80 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-[24px] p-8 sm:p-10 shadow-[0_15px_35px_rgba(123,94,167,0.18)] space-y-6">
      
      {state?.error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/80 flex items-center gap-1.5">
            <Mail size={14} className="text-[#7B5EA7]" />
            <span>Registered Email Address</span>
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold uppercase tracking-[0.08em] text-white bg-[#7B5EA7] hover:bg-[#4B2E83] transition duration-300 hover:-translate-y-0.5 shadow-[0_10px_25px_rgba(123,94,167,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Sending reset link...</span>
            </>
          ) : (
            <>
              <span>Send Password Reset Link</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Footer link back to Sign In */}
      <div className="pt-4 border-t border-[#D9C8F0]/50 dark:border-white/10 text-center text-xs text-[#6B6580] dark:text-purple-200/70">
        Remembered your password?{' '}
        <Link href="/login" className="font-bold text-[#7B5EA7] dark:text-purple-300 hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
