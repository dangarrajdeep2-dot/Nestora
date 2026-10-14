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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-200 border-r border-slate-850 flex flex-col shrink-0">
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
              <span className="text-xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
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
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
