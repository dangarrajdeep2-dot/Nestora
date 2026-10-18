import React from 'react';
import { SignUpForm } from './SignUpForm';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Student Sign Up | Nestora',
  description: 'Create your Nestora student account to save stays, connect with verified owners, and manage enquiries.',
};

export default function SignUpPage() {
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
            Join Nestora
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Find and secure verified student stays near your campus
          </p>
        </div>

        {/* Form Container */}
        <SignUpForm />

      </div>
    </div>
  );
}
