import React, { Suspense } from 'react';
import { LoginForm } from './LoginForm';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Student Sign In | Nestora',
  description: 'Sign in to your Nestora student account to access saved stays, track enquiries, and view your profile.',
};

export default function LoginPage() {
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
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Sign in to access your saved stays and student enquiries
          </p>
        </div>

        {/* Form Container with Suspense for useSearchParams */}
        <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>

      </div>
    </div>
  );
}
