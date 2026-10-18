'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Building2, ArrowLeft, ShieldCheck, Star } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mobile Admin Navigation Header (< md) */}
      <div className="md:hidden bg-slate-950 text-slate-200 border-b border-slate-850 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-7 h-7 shrink-0">
              <Image
                src="/logo.png"
                alt="Nestora Logo"
                width={28}
                height={28}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="text-lg font-black text-white tracking-tight">Nestora</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck size={11} />
            <span>Admin</span>
          </div>
        </div>

        <nav className="flex items-center gap-2 mt-3 overflow-x-auto pb-0.5 text-xs font-semibold">
          <Link
            href="/admin"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition shrink-0 ${
              pathname === '/admin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/properties"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition shrink-0 ${
              pathname.startsWith('/admin/properties')
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Building2 size={14} />
            <span>Properties</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-400 hover:text-emerald-400 bg-slate-900/60 border border-slate-800 transition ml-auto shrink-0"
          >
            <ArrowLeft size={12} />
            <span>Website</span>
          </Link>
        </nav>
      </div>

      {/* Desktop Sidebar (>= md) */}
      <aside className="hidden md:flex w-64 bg-slate-950 text-slate-200 border-r border-slate-850 flex-col shrink-0">
        <div className="p-6 border-b border-slate-850 space-y-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 shrink-0">
              <Image
                src="/logo.png"
                alt="Nestora Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                Nestora
              </span>
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck size={11} />
            <span>Admin Console</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <Link
            href="/admin"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              pathname === '/admin'
                ? 'bg-emerald-500/15 text-white border border-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <LayoutDashboard size={16} className="text-emerald-400" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/properties"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              pathname.startsWith('/admin/properties')
                ? 'bg-emerald-500/15 text-white border border-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <Building2 size={16} className="text-emerald-400" />
            <span>Properties</span>
          </Link>
          <Link
            href="/admin/reviews"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              pathname.startsWith('/admin/reviews')
                ? 'bg-amber-500/15 text-white border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span>Ratings & Reviews</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-850">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto pb-24 md:pb-0">
        {children}
      </main>
    </div>
  );
}
