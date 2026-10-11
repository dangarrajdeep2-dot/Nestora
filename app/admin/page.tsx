import { getAdminProperties } from '@/lib/actions/admin';
import Link from 'next/link';
import { Building2, CheckCircle2, Archive, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const properties = await getAdminProperties();
  
  const total = properties.length;
  const verified = properties.filter(p => p.verification === 'verified' || p.verification === 'demo').length;
  const archived = properties.filter(p => p.verification === 'unverified').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor listing status, publish state, and overall property inventory.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Properties</span>
            <Building2 size={18} className="text-slate-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{total}</p>
          <p className="text-xs text-slate-400">All registered database listings</p>
        </div>
        
        <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Published (Live)</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">{verified}</p>
          <p className="text-xs text-slate-400">Active and visible to students</p>
        </div>
        
        <div className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Archived (Hidden)</span>
            <Archive size={18} className="text-slate-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-600 dark:text-slate-400">{archived}</p>
          <p className="text-xs text-slate-400">Unverified or unpublished drafts</p>
        </div>
      </div>

      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 border border-emerald-500/20 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold">Manage Listing Inventory</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Add new verified stays, update details, or toggle publish state with zero delay.
          </p>
        </div>
        <Link 
          href="/admin/properties"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.98]"
        >
          <span>Go to Properties</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
