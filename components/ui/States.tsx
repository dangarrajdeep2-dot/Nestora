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
    <div className="glass-card rounded-[24px] border border-white/80 dark:border-white/10 overflow-hidden animate-pulse flex flex-col shadow-[0_10px_30px_rgba(123,94,167,0.08)]">
      <div className="h-52 bg-[#E6DAF5]/60 dark:bg-[#1B1530]/60 relative w-full" />
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-5 bg-[#D9C8F0]/50 dark:bg-white/10 rounded-full w-3/4" />
          <div className="h-4 bg-[#D9C8F0]/30 dark:bg-white/5 rounded-full w-1/2" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-[#D9C8F0]/40 dark:bg-white/5 rounded-full" />
          <div className="h-6 w-16 bg-[#D9C8F0]/40 dark:bg-white/5 rounded-full" />
          <div className="h-6 w-16 bg-[#D9C8F0]/40 dark:bg-white/5 rounded-full" />
        </div>
        <div className="pt-3 border-t border-[#D9C8F0]/40 dark:border-white/10 flex items-center justify-between">
          <div className="h-6 bg-[#D9C8F0]/50 dark:bg-white/10 rounded-full w-24" />
          <div className="h-8 bg-[#D9C8F0]/50 dark:bg-white/10 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-pulse">
        <div className="h-6 bg-[#D9C8F0]/50 dark:bg-white/10 rounded-full w-48" />
        <div className="h-8 bg-[#D9C8F0]/50 dark:bg-white/10 rounded-full w-32" />
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
      <div className="h-72 sm:h-96 bg-[#E6DAF5]/60 dark:bg-[#1B1530]/60 rounded-[24px]" />
      <div className="space-y-4">
        <div className="h-8 bg-[#D9C8F0]/50 dark:bg-white/10 rounded-full w-2/3" />
        <div className="h-5 bg-[#D9C8F0]/30 dark:bg-white/5 rounded-full w-1/3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="h-40 bg-[#D9C8F0]/30 dark:bg-white/5 rounded-[24px]" />
          <div className="h-40 bg-[#D9C8F0]/30 dark:bg-white/5 rounded-[24px]" />
        </div>
        <div className="h-64 bg-[#D9C8F0]/30 dark:bg-white/5 rounded-[24px]" />
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
    <div className="glass-card rounded-[24px] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-[0_10px_30px_rgba(123,94,167,0.12)] my-6 border border-white/80 dark:border-white/10">
      <div className="w-16 h-16 bg-[#D9C8F0]/60 text-[#7B5EA7] dark:bg-[#7B5EA7]/20 dark:text-purple-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#7B5EA7]/20 shadow-sm">
        <SearchX size={32} />
      </div>
      <h3 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight text-[#1B1530] dark:text-white mb-2">No accommodations found</h3>
      <p className="text-[#6B6580] dark:text-purple-200/70 text-xs sm:text-sm mb-6 leading-relaxed">
        We couldn&apos;t find any PGs or hostels matching your exact filter combination. Try loosening your budget or expanding your distance radius.
      </p>

      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7B5EA7] hover:bg-[#4B2E83] text-white font-bold text-xs uppercase tracking-[0.08em] rounded-full shadow-[0_10px_25px_rgba(123,94,167,0.25)] transition duration-300 hover:-translate-y-0.5 cursor-pointer"
        >
          <RotateCcw size={14} />
          Reset All Filters
        </button>
      )}

      {suggestedAreas.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#D9C8F0]/40 dark:border-white/10 text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7B5EA7] dark:text-[#D9C8F0] mb-3">
            Popular nearby hubs with stays:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedAreas.map((area) => (
              <button
                key={area}
                onClick={() => onSelectSuggestion?.(area)}
                className="text-xs bg-white/70 dark:bg-white/5 hover:bg-[#D9C8F0]/50 text-[#4B2E83] dark:text-purple-200 px-3.5 py-1.5 rounded-full border border-white/80 dark:border-white/10 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <MapPin size={12} className="text-[#7B5EA7]" />
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
    <div className="glass-card bg-rose-500/5 border border-rose-500/20 rounded-[24px] p-8 max-w-md mx-auto text-center my-8 shadow-sm text-[#1B1530] dark:text-white">
      <div className="w-14 h-14 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
        <AlertCircle size={28} />
      </div>
      <h3 className="font-heading text-xl uppercase tracking-tight mb-2">Connection Issue</h3>
      <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold uppercase tracking-[0.08em] shadow transition cursor-pointer"
        >
          <RotateCcw size={14} />
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
    <div className="glass-card bg-white/70 dark:bg-[#161024]/70 border border-white/80 dark:border-white/10 rounded-[20px] p-4 sm:p-5 mb-6 text-[#1B1530] dark:text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#D9C8F0]/60 text-[#7B5EA7] dark:bg-[#7B5EA7]/30 dark:text-purple-200 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-[#7B5EA7]/20">
          <MapPinOff size={18} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-[#1B1530] dark:text-white">Location Access Not Enabled</h4>
          <p className="text-xs text-[#6B6580] dark:text-purple-200/70 mt-0.5">
            Location permission is never mandatory! Search any college, area, or pick from popular student localities below.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {['Kotecha Chowk, Rajkot', 'Kalawad Road', 'Saurashtra University'].map((area) => (
              <button
                key={area}
                onClick={() => onSelectManual?.(area)}
                className="text-xs bg-white/80 dark:bg-white/10 text-[#4B2E83] dark:text-purple-200 px-3 py-1 rounded-full border border-[#D9C8F0] dark:border-white/10 font-semibold hover:bg-[#D9C8F0]/50 transition cursor-pointer"
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
          className="text-xs font-bold uppercase tracking-[0.08em] text-[#6B6580] hover:text-[#1B1530] dark:text-purple-200/70 dark:hover:text-white px-3 py-1.5 rounded-full border border-white/80 dark:border-white/10 self-end sm:self-center shrink-0 bg-white/60 dark:bg-white/5 hover:bg-[#D9C8F0]/30 cursor-pointer"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

export function EmptySavedState() {
  return (
    <div className="glass-card rounded-[24px] p-8 sm:p-12 text-center max-w-md mx-auto shadow-[0_10px_30px_rgba(123,94,167,0.12)] my-10 border border-white/80 dark:border-white/10">
      <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
        <HeartCrack size={32} />
      </div>
      <h3 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight text-[#1B1530] dark:text-white mb-2">No Saved Properties Yet</h3>
      <p className="text-[#6B6580] dark:text-purple-200/70 text-xs sm:text-sm mb-6 leading-relaxed">
        You haven&apos;t bookmarked any PGs or hostels. Browse stays near your college and tap the heart icon to shortlist your favorites.
      </p>
      <Link
        href="/search"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#7B5EA7] hover:bg-[#4B2E83] text-white font-bold text-xs uppercase tracking-[0.08em] rounded-full shadow-[0_10px_25px_rgba(123,94,167,0.25)] transition duration-300 hover:-translate-y-0.5"
      >
        <Home size={16} />
        <span>Explore Stays Near Campus</span>
        <span>→</span>
      </Link>
    </div>
  );
}

export function PropertyUnavailableState() {
  return (
    <div className="glass-card rounded-[24px] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-[0_10px_30px_rgba(123,94,167,0.12)] my-12 border border-white/80 dark:border-white/10">
      <div className="w-16 h-16 bg-[#D9C8F0]/60 text-[#7B5EA7] dark:bg-[#7B5EA7]/20 dark:text-purple-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#7B5EA7]/20 shadow-sm">
        <ShieldAlert size={32} />
      </div>
      <h2 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight text-[#1B1530] dark:text-white mb-2">Property Currently Unavailable</h2>
      <p className="text-[#6B6580] dark:text-purple-200/70 text-xs sm:text-sm mb-6 leading-relaxed">
        This accommodation has been fully booked or temporarily taken down by the owner. Don&apos;t worry, there are plenty of verified options nearby!
      </p>
      <Link
        href="/search"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#7B5EA7] hover:bg-[#4B2E83] text-white font-bold text-xs uppercase tracking-[0.08em] rounded-full shadow-[0_10px_25px_rgba(123,94,167,0.25)] transition duration-300 hover:-translate-y-0.5"
      >
        <span>Browse Other Nearby Stays</span>
        <span>→</span>
      </Link>
    </div>
  );
}
