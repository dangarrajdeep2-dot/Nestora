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
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Check Your Email</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            If an account is associated with <strong className="text-slate-900 dark:text-white font-semibold">{state.email}</strong>, we have sent instructions to reset your password.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please check your inbox as well as your spam folder.
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
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
      
      {state?.error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Mail size={14} className="text-emerald-500" />
            <span>Registered Email Address</span>
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
      <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-xs text-slate-500 dark:text-slate-400">
        Remembered your password?{' '}
        <Link href="/login" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
