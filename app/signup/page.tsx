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
            <div className="w-14 h-14 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/30 text-[#7B5EA7] dark:text-purple-200 flex items-center justify-center border border-[#7B5EA7]/20 group-hover:scale-105 transition-all shadow-sm">
              <GraduationCap size={28} />
            </div>
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl text-[#1B1530] dark:text-white uppercase tracking-tight">
            <span className="text-[#7B5EA7]">Join</span> Nestora
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6580] dark:text-purple-200/70 font-medium">
            Find and secure verified student stays near your campus
          </p>
        </div>

        {/* Form Container */}
        <SignUpForm />

      </div>
    </div>
  );
}
