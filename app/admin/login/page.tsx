'use client';

import { useActionState, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  const displayError = state?.error || (urlError ? decodeURIComponent(urlError) : null);

  return (
    <div className="w-full max-w-md bg-slate-900/85 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10 space-y-6">
      
      {/* Header with Nestora Brand & Logo */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center gap-2.5">
          <div className="relative w-10 h-10 shrink-0">
            <Image
              src="/logo.png"
              alt="Nestora Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain drop-shadow"
              priority
            />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Nestora</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider">
          <ShieldCheck size={14} />
          <span>Admin Portal</span>
        </div>

        <p className="text-xs text-slate-400">
          Sign in with authorized administrator credentials to manage properties and listings.
        </p>
      </div>

      {displayError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
          <span>{displayError}</span>
        </div>
      )}

      {/* Google Sign In for Admins */}
      <GoogleSignInButton
        nextParam="/admin/properties"
        text="Sign in with Google as Admin"
        className="!bg-slate-950 !border-slate-800 !text-slate-100 hover:!bg-slate-900"
      />

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-800" />
        <span className="absolute bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          OR EMAIL & PASSWORD
        </span>
      </div>

      {/* Login Form */}
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail size={16} />
            </div>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition"
              placeholder="admin@nestora.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending ? 'Signing in...' : 'Sign In with Password'}
        </button>
      </form>

      {/* Back Link */}
      <div className="text-center pt-2 border-t border-slate-800/80">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft size={13} />
          <span>Back to Nestora Home</span>
        </Link>
      </div>

    </div>
  );
}

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Ambient background glow matching Nestora theme */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-slate-400 text-sm">Loading admin login...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
