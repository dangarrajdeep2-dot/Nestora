'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  SlidersHorizontal, 
  LayoutGrid, 
  List, 
  Map as MapIcon, 
  Search, 
  X, 
  ArrowUpDown, 
  Navigation,
  Loader2
} from 'lucide-react';
import { FilterState, Property } from '@/types';
import { getProperties } from '@/lib/api/properties';
import { PropertyCard } from '@/components/listings/PropertyCard';
import { FilterSidebar } from '@/components/listings/FilterSidebar';
import dynamic from 'next/dynamic';
const PropertyMap = dynamic(() => import('@/components/listings/PropertyMap'), { ssr: false, loading: () => <div className="h-80 sm:h-96 w-full rounded-3xl bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center text-slate-400">Loading map...</div> });
import { 
  SearchResultsSkeleton, 
  NoResultsState, 
  LocationDeniedBanner, 
  ApiErrorState 
} from '@/components/ui/States';

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse initial state from URL search params
  const initialQuery = searchParams.get('q') || '';
  const initialLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const initialLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
  const initialGender = (searchParams.get('gender') as 'boys' | 'girls' | 'all') || 'all';

  const [filters, setFilters] = useState<FilterState>({
    query: initialQuery,
    lat: initialLat,
    lng: initialLng,
    gender: initialGender,
    sortBy: 'relevance',
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showLocationDeniedBanner, setShowLocationDeniedBanner] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Sync with searchParams on load or navigation
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const gender = (searchParams.get('gender') as 'boys' | 'girls' | 'all') || 'all';

    Promise.resolve().then(() => {
      setFilters((prev) => {
        if (
          prev.query === q &&
          prev.lat === lat &&
          prev.lng === lng &&
          prev.gender === gender
        ) {
          return prev;
        }
        return {
          ...prev,
          query: q,
          lat,
          lng,
          gender,
        };
      });
    });
  }, [searchParams]);

  // Fetch properties when filters change
  const fetchListingData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const timeoutPromise = new Promise<{ properties: Property[] }>((_, reject) =>
        setTimeout(() => reject(new Error('Search properties timeout')), 8000)
      );
      const response = await Promise.race([getProperties(filters), timeoutPromise]);
      setProperties(response.properties);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchListingData();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setShowLocationDeniedBanner(true);
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        setFilters((prev) => ({
          ...prev,
          query: 'Near My Location',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          sortBy: 'distance',
        }));
        setShowLocationDeniedBanner(false);
      },
      (err) => {
        setIsDetectingLocation(false);
        setShowLocationDeniedBanner(true);
      },
      { timeout: 7000 }
    );
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      lat: undefined,
      lng: undefined,
      gender: 'all',
      propertyType: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      maxDistanceKm: undefined,
      sharing: undefined,
      amenities: undefined,
      furnishedOnly: false,
      availableNowOnly: false,
      verifiedOnly: false,
      sortBy: 'relevance',
    });
  };

  // Determine active filter count for badge
  let activeFilterCount = 0;
  if (filters.gender && filters.gender !== 'all') activeFilterCount++;
  if (filters.propertyType && filters.propertyType.length > 0) activeFilterCount += filters.propertyType.length;
  if (filters.maxDistanceKm) activeFilterCount++;
  if (filters.minPrice || filters.maxPrice) activeFilterCount++;
  if (filters.sharing && filters.sharing.length > 0) activeFilterCount += filters.sharing.length;
  if (filters.amenities && filters.amenities.length > 0) activeFilterCount += filters.amenities.length;
  if (filters.furnishedOnly) activeFilterCount++;
  if (filters.availableNowOnly) activeFilterCount++;
  if (filters.verifiedOnly) activeFilterCount++;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-12">
      
      {/* Glassy Search Bar & Location Header */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 border border-slate-200/60 dark:border-slate-800/80 mb-6">
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          
          {/* Query input */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={filters.query || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              placeholder="Search college, area, or locality (e.g. Kotecha Chowk, Rajkot)"
              className="w-full pl-10 pr-24 py-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white text-sm outline-none transition"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, query: '' }))}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isDetectingLocation}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1 transition border border-emerald-500/20"
            >
              {isDetectingLocation ? (
                <Loader2 size={12} className="animate-spin text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Navigation size={12} className="text-emerald-600 dark:text-emerald-400" />
              )}
              <span>GPS</span>
            </button>
          </div>

          {/* Gender Selector in header */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl shrink-0 border border-slate-200/50 dark:border-slate-800/60">
            {(['all', 'boys', 'girls'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, gender: g }))}
                className={`px-3 py-2 text-xs font-semibold rounded-xl capitalize transition ${
                  filters.gender === g 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {g === 'all' ? 'All Stays' : g}
              </button>
            ))}
          </div>

          {/* Mobile Filter Sheet Trigger Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            <SlidersHorizontal size={14} />
            <span>Filters ({activeFilterCount})</span>
          </button>

        </div>
      </div>

      {/* Geolocation Denied Banner (Requirement #9) */}
      {showLocationDeniedBanner && (
        <LocationDeniedBanner
          onDismiss={() => setShowLocationDeniedBanner(false)}
          onSelectManual={(area) => {
            setFilters((prev) => ({ ...prev, query: area, lat: undefined, lng: undefined }));
            setShowLocationDeniedBanner(false);
          }}
        />
      )}

      {/* Results Header: Count, Sort Dropdown, View Switcher & Map Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 gap-4 border-b border-slate-200/60 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {filters.query ? `Stays near "${filters.query}"` : 'Student Accommodations'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isLoading ? 'Searching verified stays...' : `${properties.length} properties available near you`}
          </p>
        </div>

        {/* View mode, Sort & Map controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          
          {/* Sort Dropdown (Requirement #3) */}
          <div className="flex items-center gap-1.5 glass-card px-3 py-2 rounded-2xl text-xs font-medium border border-slate-200/80 dark:border-slate-800">
            <ArrowUpDown size={13} className="text-slate-500" />
            <select
              value={filters.sortBy || 'relevance'}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold outline-none cursor-pointer"
            >
              <option value="relevance" className="dark:bg-slate-900">Relevance</option>
              <option value="distance" className="dark:bg-slate-900">Distance: nearest first</option>
              <option value="price_low_high" className="dark:bg-slate-900">Price: low to high</option>
              <option value="rating_high_low" className="dark:bg-slate-900">Rating: high to low</option>
            </select>
          </div>

          {/* Map View Toggle with Emerald theme */}
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border flex items-center gap-1.5 transition ${
              showMap
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25'
                : 'glass-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <MapIcon size={14} />
            <span>{showMap ? 'Hide Map' : 'Map View'}</span>
          </button>

          {/* Grid / List Switcher */}
          <div className="hidden sm:flex items-center bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="List view"
            >
              <List size={15} />
            </button>
          </div>

        </div>
      </div>

      {/* Active Filter Badges Row */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">Active Filters:</span>
          {filters.gender && filters.gender !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 text-xs px-2.5 py-1 rounded-full font-semibold">
              <span>{filters.gender === 'girls' ? 'Girls Only' : 'Boys Only'}</span>
              <X size={12} className="cursor-pointer" onClick={() => setFilters((p) => ({ ...p, gender: 'all' }))} />
            </span>
          )}
          {filters.maxDistanceKm && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 text-xs px-2.5 py-1 rounded-full font-semibold">
              <span>Within {filters.maxDistanceKm} km</span>
              <X size={12} className="cursor-pointer" onClick={() => setFilters((p) => ({ ...p, maxDistanceKm: undefined }))} />
            </span>
          )}
          {filters.verifiedOnly && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 text-xs px-2.5 py-1 rounded-full font-semibold">
              <span>Verified Only</span>
              <X size={12} className="cursor-pointer" onClick={() => setFilters((p) => ({ ...p, verifiedOnly: false }))} />
            </span>
          )}
          {filters.amenities?.map((a) => (
            <span key={a} className="inline-flex items-center gap-1 glass-card text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium border border-slate-200 dark:border-slate-800">
              <span>{a}</span>
              <X
                size={12}
                className="cursor-pointer"
                onClick={() => setFilters((p) => ({ ...p, amenities: p.amenities?.filter((x) => x !== a) }))}
              />
            </span>
          ))}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-rose-500 hover:underline font-semibold ml-2 cursor-pointer"
          >
            Clear all ({activeFilterCount})
          </button>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Desktop Filter Sidebar (1 Col) */}
        <div className="hidden md:block md:col-span-1 sticky top-24">
          <FilterSidebar
            filters={filters}
            onChange={(updated) => setFilters(updated)}
            onReset={handleResetFilters}
          />
        </div>

        {/* Properties Column (3 Cols) */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Map view (toggleable on top or split) */}
          {showMap && (
            <div className="h-80 sm:h-96 w-full rounded-3xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 mb-6">
              <PropertyMap
                properties={properties}
                searchedLocation={{
                  name: filters.query || 'Searched Location',
                  latitude: filters.lat,
                  longitude: filters.lng,
                }}
              />
            </div>
          )}

          {/* Content States */}
          {isLoading ? (
            <SearchResultsSkeleton />
          ) : hasError ? (
            <ApiErrorState onRetry={fetchListingData} />
          ) : properties.length === 0 ? (
            <NoResultsState
              onResetFilters={handleResetFilters}
              onSelectSuggestion={(location) => {
                setFilters((prev) => ({
                  ...prev,
                  query: location,
                  lat: undefined,
                  lng: undefined,
                }));
              }}
            />
          ) : (
            <div
              className={`grid gap-5 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {properties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} viewMode={viewMode} />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Mobile Filters Drawer / Sheet Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-end">
          <div className="bg-white dark:bg-slate-950 w-full max-w-md h-full flex flex-col p-4 animate-in slide-in-from-right text-slate-900 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <h3 className="font-bold text-base">Filter Stays</h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar
                filters={filters}
                onChange={(updated) => setFilters(updated)}
                onReset={handleResetFilters}
                isMobileDrawer={true}
                onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
