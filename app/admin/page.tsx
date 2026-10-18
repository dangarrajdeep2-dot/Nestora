import { getAdminProperties, getAdminReviews } from '@/lib/actions/admin';
import Link from 'next/link';
import { Building2, CheckCircle2, Archive, ArrowRight, Star, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [properties, reviews] = await Promise.all([
    getAdminProperties(),
    getAdminReviews(),
  ]);
  
  const total = properties.length;
  const verified = properties.filter(p => p.verification === 'verified' || p.verification === 'demo').length;
  const archived = properties.filter(p => p.verification === 'unverified').length;

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full min-w-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor listing status, student ratings & reviews, and overall property inventory.
        </p>
      </div>
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        <Link 
          href="/admin/reviews" 
          className="glass-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 space-y-2 hover:border-amber-500/40 transition group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider group-hover:text-amber-500 transition-colors">
              Student Reviews
            </span>
            <Star size={18} className="text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-black text-amber-500 dark:text-amber-400">{totalReviews}</p>
            <span className="text-xs font-bold text-slate-500">({avgRating} ★ avg)</span>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 group-hover:underline flex items-center gap-1 font-semibold">
            <span>Moderate student feedback</span>
            <ArrowRight size={12} />
          </p>
        </Link>
      </div>

      {/* Two Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 border border-emerald-500/20 text-white flex flex-col justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Building2 size={12} />
              <span>Listing Inventory</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Manage Properties</h2>
            <p className="text-xs text-slate-300">
              Add new verified stays, update room amenities, change rents, or toggle published status.
            </p>
          </div>
          <div>
            <Link 
              href="/admin/properties"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.98]"
            >
              <span>Go to Properties</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-slate-900 via-slate-950 to-amber-950 border border-amber-500/20 text-white flex flex-col justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Sparkles size={12} />
              <span>Community Moderation</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Moderate Ratings & Reviews</h2>
            <p className="text-xs text-slate-300">
              Inspect student feedback, grant &quot;Verified Resident&quot; badges, and remove invalid ratings.
            </p>
          </div>
          <div>
            <Link 
              href="/admin/reviews"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-600/25 transition active:scale-[0.98]"
            >
              <span>Go to Ratings & Reviews</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
