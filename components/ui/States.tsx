'use client';

import React from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  MapPinOff, 
  SearchX, 
  HeartCrack, 
  RotateCcw, 
  MapPin, 
  Home, 
  ShieldAlert 
} from 'lucide-react';

export function PropertyCardSkeleton() {
  return (
    <div className="glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/80 overflow-hidden animate-pulse flex flex-col">
      <div className="h-52 bg-slate-200 dark:bg-slate-800 relative w-full" />
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
          <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded-md w-1/2" />
        </div>
        <div className="flex gap-1.5 pt-2">
          <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
          <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
          <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-24" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-48" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function PropertyDetailsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="h-72 sm:h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3" />
        <div className="h-5 bg-slate-100 dark:bg-slate-850 rounded-md w-1/3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="h-40 bg-slate-100 dark:bg-slate-850 rounded-2xl" />
          <div className="h-40 bg-slate-100 dark:bg-slate-850 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-850 rounded-2xl" />
      </div>
    </div>
  );
}

export function NoResultsState({
  onResetFilters,
  onSelectSuggestion,
}: {
  onResetFilters?: () => void;
  onSelectSuggestion?: (location: string) => void;
}) {
  const suggestedAreas = [
    'Kotecha Chowk, Rajkot',
    'Kalawad Road, Rajkot',
    'Saurashtra University',
    'RK University',
  ];

  return (
    <div className="glass-card rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-6 border border-slate-200/60 dark:border-slate-800/80">
      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
        <SearchX size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No accommodations found</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
        We couldn&apos;t find any PGs or hostels matching your exact filter combination. Try loosening your budget or expanding your distance radius.
      </p>

      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/25 transition cursor-pointer"
        >
          <RotateCcw size={16} />
          Reset All Filters
        </button>
      )}

      {suggestedAreas.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/80 text-left">
          <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">
            Popular nearby hubs with stays:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedAreas.map((area) => (
              <button
                key={area}
                onClick={() => onSelectSuggestion?.(area)}
                className="text-xs bg-slate-100/70 dark:bg-slate-900/60 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin size={12} className="text-emerald-500" />
                {area}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ApiErrorState({
  onRetry,
  message = 'There was an issue fetching stay listings. Please check your internet connection or retry.',
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <div className="glass-card bg-red-500/5 border border-red-500/20 rounded-3xl p-8 max-w-md mx-auto text-center my-8 shadow-sm text-slate-900 dark:text-white">
      <div className="w-14 h-14 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
        <AlertCircle size={28} />
      </div>
      <h3 className="text-lg font-bold mb-2">Connection Issue</h3>
      <p className="text-sm text-rose-700 dark:text-rose-300 mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow transition cursor-pointer"
        >
          <RotateCcw size={16} />
          Retry Connection
        </button>
      )}
    </div>
  );
}

export function LocationDeniedBanner({
  onDismiss,
  onSelectManual,
}: {
  onDismiss?: () => void;
  onSelectManual?: (area: string) => void;
}) {
  return (
    <div className="glass-card bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 mb-6 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/20">
          <MapPinOff size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-amber-950 dark:text-amber-100">Location Access Not Enabled</h4>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
            Location permission is never mandatory! Search any college, area, or pick from popular student localities below.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['Kotecha Chowk, Rajkot', 'Kalawad Road', 'Saurashtra University'].map((area) => (
              <button
                key={area}
                onClick={() => onSelectManual?.(area)}
                className="text-xs bg-white/80 dark:bg-slate-900 text-amber-950 dark:text-amber-200 px-2.5 py-1 rounded-md border border-amber-500/30 font-semibold hover:bg-amber-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white px-3 py-1.5 rounded-lg border border-amber-500/30 self-end sm:self-center shrink-0 hover:bg-amber-500/15 cursor-pointer"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

export function EmptySavedState() {
  return (
    <div className="glass-card rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm my-10 border border-slate-200/60 dark:border-slate-800/80">
      <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
        <HeartCrack size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Saved Properties Yet</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
        You haven&apos;t bookmarked any PGs or hostels. Browse stays near your college and tap the heart icon to shortlist your favorites.
      </p>
      <Link
        href="/search"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition"
      >
        <Home size={18} />
        Explore Stays Near Campus
      </Link>
    </div>
  );
}

export function PropertyUnavailableState() {
  return (
    <div className="glass-card rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-12 border border-slate-200/60 dark:border-slate-800/80">
      <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
        <ShieldAlert size={32} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Property Currently Unavailable</h2>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
        This accommodation has been fully booked or temporarily taken down by the owner. Don&apos;t worry, there are plenty of verified options nearby!
      </p>
      <Link
        href="/search"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition"
      >
        Browse Other Nearby Stays
      </Link>
    </div>
  );
}
