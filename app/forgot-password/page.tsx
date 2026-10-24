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
            <div className="w-14 h-14 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/30 text-[#7B5EA7] dark:text-purple-200 flex items-center justify-center border border-[#7B5EA7]/20 group-hover:scale-105 transition-all shadow-sm">
              <GraduationCap size={28} />
            </div>
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl text-[#1B1530] dark:text-white uppercase tracking-tight">
            <span className="text-[#7B5EA7]">Reset</span> Password
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6580] dark:text-purple-200/70 font-medium">
            Enter your student email and we&apos;ll send you a password reset link
          </p>
        </div>

        {/* Form Container with Suspense */}
        <Suspense fallback={<div className="p-8 text-center text-xs font-bold uppercase tracking-[0.08em] text-[#6B6580]">Loading...</div>}>
          <ForgotPasswordForm />
        </Suspense>

      </div>
    </div>
  );
}
