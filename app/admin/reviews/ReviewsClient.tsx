'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Star, 
  Trash2, 
  CheckCircle2, 
  Search, 
  ExternalLink,
  ShieldAlert,
  Loader2,
  Building2,
  Sparkles
} from 'lucide-react';
import { AdminReview, deleteAdminReview, toggleReviewVerifiedStay } from '@/lib/actions/admin';

export function ReviewsClient({ initialReviews }: { initialReviews: AdminReview[] }) {
  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Statistics
  const totalCount = reviews.length;
  const avgRating = totalCount > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1) 
    : '0.0';
  const verifiedCount = reviews.filter(r => r.verified_stay).length;
  const fiveStarCount = reviews.filter(r => Math.round(r.rating) === 5).length;

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = 
          r.author_name.toLowerCase().includes(q) ||
          r.college.toLowerCase().includes(q) ||
          (r.course && r.course.toLowerCase().includes(q)) ||
          r.property_title.toLowerCase().includes(q) ||
          r.property_area.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 2. Rating Filter
      if (ratingFilter !== 'all') {
        const rounded = Math.round(r.rating);
        if (ratingFilter === '5' && rounded !== 5) return false;
        if (ratingFilter === '4' && rounded !== 4) return false;
        if (ratingFilter === '3' && rounded !== 3) return false;
        if (ratingFilter === 'low' && rounded > 2) return false;
      }

      // 3. Verification Filter
      if (verifiedFilter === 'verified' && !r.verified_stay) return false;
      if (verifiedFilter === 'unverified' && r.verified_stay) return false;

      return true;
    });
  }, [reviews, searchQuery, ratingFilter, verifiedFilter]);

  // Handle Toggle Verified Stay
  const handleToggleVerified = async (id: string, currentStatus: boolean) => {
    try {
      setLoadingId(id);
      await toggleReviewVerifiedStay(id, currentStatus);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, verified_stay: !currentStatus } : r));
    } catch {
      alert('Could not update review verification status');
    } finally {
      setLoadingId(null);
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async (id: string, author: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the review by "${author}"?`)) {
      return;
    }

    try {
      setLoadingId(id);
      await deleteAdminReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Could not delete review');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reviews</span>
            <Star size={18} className="text-amber-500 fill-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{totalCount}</p>
          <p className="text-xs text-slate-400">Student reviews across platform</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Rating</span>
            <Sparkles size={18} className="text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-500 dark:text-amber-400">{avgRating} / 5</p>
          <p className="text-xs text-slate-400">Average student satisfaction</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Stays</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{verifiedCount}</p>
          <p className="text-xs text-slate-400">Confirmed student residents</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">5-Star Feedback</span>
            <Star size={18} className="text-amber-400 fill-amber-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{fiveStarCount}</p>
          <p className="text-xs text-slate-400">Top-tier property ratings</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, college, property name, area, or review comment..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none"
          >
            <option value="all">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="low">⭐⭐ or less (1-2 Stars)</option>
          </select>

          {/* Verification filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified Stay Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Table / Card Container */}
      <div className="glass-card rounded-2xl border border-slate-200/60 dark:border-slate-800/80 overflow-hidden shadow-sm">
        {filteredReviews.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No reviews match your filters</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search query or reset rating and verification filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setRatingFilter('all');
                setVerifiedFilter('all');
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/75 dark:bg-slate-900/75 border-b border-slate-200/80 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Student Reviewer</th>
                  <th className="px-6 py-3.5 font-bold">Property</th>
                  <th className="px-6 py-3.5 font-bold">Rating</th>
                  <th className="px-6 py-3.5 font-bold">Feedback / Comment</th>
                  <th className="px-6 py-3.5 font-bold">Status</th>
                  <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {filteredReviews.map((rev) => {
                  const isLoading = loadingId === rev.id;

                  return (
                    <tr key={rev.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                      
                      {/* Reviewer */}
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                            {rev.author_name ? rev.author_name[0].toUpperCase() : 'S'}
                          </span>
                          <span>{rev.author_name}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-9">
                          {rev.course ? `${rev.course} • ` : ''}{rev.college}
                        </div>
                        <div className="text-[11px] text-slate-400 pl-9 mt-0.5">
                          {rev.date}
                        </div>
                      </td>

                      {/* Property Info */}
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building2 size={14} className="text-emerald-500 shrink-0" />
                          <span className="line-clamp-1">{rev.property_title}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {rev.property_area ? `${rev.property_area}, ` : ''}{rev.property_city}
                        </div>
                        <Link
                          href={`/property/${rev.property_id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline mt-1 font-semibold"
                        >
                          <span>View Listing</span>
                          <ExternalLink size={10} />
                        </Link>
                      </td>

                      {/* Star Rating */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold px-2 py-1 rounded-lg text-xs w-fit border border-amber-500/20">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span>{Number(rev.rating).toFixed(1)} / 5</span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={11}
                              className={s <= Math.round(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Feedback Comment */}
                      <td className="px-6 py-4 align-top max-w-xs sm:max-w-md">
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-50/70 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          &quot;{rev.comment}&quot;
                        </p>
                      </td>

                      {/* Verified Status Toggle */}
                      <td className="px-6 py-4 align-top">
                        <button
                          type="button"
                          onClick={() => handleToggleVerified(rev.id, rev.verified_stay)}
                          disabled={isLoading}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                            rev.verified_stay
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                          }`}
                          title="Click to toggle verified stay badge"
                        >
                          {isLoading ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={12} className={rev.verified_stay ? 'text-emerald-500' : 'text-slate-400'} />
                          )}
                          <span>{rev.verified_stay ? 'Verified Stay' : 'Unverified'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 align-top text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev.id, rev.author_name)}
                          disabled={isLoading}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                          title="Delete review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
