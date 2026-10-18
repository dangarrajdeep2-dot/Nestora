import React, { Suspense } from 'react';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Forgot Password | Nestora',
  description: 'Reset your Nestora student account password securely.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-all">
              <GraduationCap size={28} />
            </div>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Enter your student email and we&apos;ll send you a password reset link
          </p>
        </div>

        {/* Form Container with Suspense */}
        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Loading...</div>}>
          <ForgotPasswordForm />
        </Suspense>

      </div>
    </div>
  );
}
