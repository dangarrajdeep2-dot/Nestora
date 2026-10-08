'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Compass, Trash2 } from 'lucide-react';
import { Property } from '@/types';
import { getPropertyById } from '@/lib/api/properties';
import { useSavedProperties } from '@/lib/utils/favorites';
import { PropertyCard } from '@/components/listings/PropertyCard';
import { EmptySavedState, SearchResultsSkeleton } from '@/components/ui/States';

export default function SavedPage() {
  const { savedIds, isLoaded } = useSavedProperties();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const loadProperties = async () => {
      setIsLoading(true);
      if (savedIds.length === 0) {
        setProperties([]);
        setIsLoading(false);
        return;
      }

      const fetched = await Promise.all(
        savedIds.map((id) => getPropertyById(id))
      );
      setProperties(fetched.filter((p): p is Property => p !== null));
      setIsLoading(false);
    };

    loadProperties();
  }, [savedIds, isLoaded]);

  const handleClearAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nestora_saved_properties');
      window.dispatchEvent(new Event('nestora_saved_updated'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-16 min-h-[70vh]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200/60 dark:border-slate-800/80 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full mb-1 border border-rose-500/20">
            <Heart size={13} className="fill-rose-500 text-rose-500" />
            <span>Shortlisted by You</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Saved Accommodations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Compare and contact your shortlisted PGs and hostels directly.
          </p>
        </div>

        {properties.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 rounded-xl transition cursor-pointer border border-rose-500/20"
            >
              <Trash2 size={13} />
              <span>Clear Shortlist</span>
            </button>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition shadow-md shadow-emerald-500/20"
            >
              <Compass size={14} />
              <span>Explore More Stays</span>
            </Link>
          </div>
        )}
      </div>

      {/* Main body */}
      {!isLoaded || isLoading ? (
        <SearchResultsSkeleton />
      ) : properties.length === 0 ? (
        <EmptySavedState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}

    </div>
  );
}
