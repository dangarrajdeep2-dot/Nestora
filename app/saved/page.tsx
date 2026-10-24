'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Compass, Trash2 } from 'lucide-react';
import { Property } from '@/types';
import { getPropertyById } from '@/lib/api/properties';
import { useSavedProperties } from '@/lib/utils/favorites';
import { PropertyCard } from '@/components/listings/PropertyCard';
import { supabase } from '@/lib/supabase/client';
import { EmptySavedState, SearchResultsSkeleton } from '@/components/ui/States';

export default function SavedPage() {
  const { savedIds, isLoaded } = useSavedProperties();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    let isMounted = true;

    const loadProperties = async () => {
      setIsLoading(true);
      try {
        if (savedIds.length === 0) {
          if (isMounted) {
            setProperties([]);
          }
          return;
        }

        const fetchWithTimeout = (id: string) => {
          return Promise.race([
            getPropertyById(id),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
          ]);
        };

        const fetched = await Promise.all(
          savedIds.map((id) => fetchWithTimeout(id))
        );
        if (isMounted) {
          setProperties(fetched.filter((p): p is Property => p !== null));
        }
      } catch (err) {
        console.error('Failed to load saved properties:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, [savedIds, isLoaded]);

  const handleClearAll = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nestora_saved_properties');
      setProperties([]);
      window.dispatchEvent(new Event('nestora_saved_updated'));
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('favorites').delete().eq('user_id', user.id);
        }
      } catch (err) {
        console.error('Failed to clear server favorites:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-16 min-h-[70vh]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#D9C8F0]/40 dark:border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#4B2E83] dark:text-purple-200 bg-[#D9C8F0]/50 dark:bg-[#7B5EA7]/20 px-3 py-1 rounded-full mb-1.5 border border-[#7B5EA7]/20 shadow-sm">
            <Heart size={12} className="fill-rose-500 text-rose-500" />
            <span>Shortlisted by You</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight text-[#1B1530] dark:text-white">
            <span className="text-[#7B5EA7]">Saved</span> Accommodations
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6580] dark:text-purple-200/70 mt-0.5">
            Compare and contact your shortlisted PGs and hostels directly.
          </p>
        </div>

        {properties.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-3.5 py-2 rounded-full transition cursor-pointer border border-rose-300 dark:border-rose-900 shadow-sm"
            >
              <Trash2 size={13} />
              <span>Clear Shortlist</span>
            </button>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-white bg-[#7B5EA7] hover:bg-[#4B2E83] px-5 py-2 rounded-full transition duration-300 hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(123,94,167,0.25)]"
            >
              <Compass size={14} />
              <span>Explore More Stays</span>
              <span>→</span>
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
