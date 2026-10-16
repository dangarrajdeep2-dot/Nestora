'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef, useTransition } from 'react';
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
  Loader2,
  GraduationCap,
  MapPin
} from 'lucide-react';
import { FilterState, Property, LocationRef } from '@/types';
import { getProperties, searchLocations } from '@/lib/api/properties';
import { PropertyCard } from '@/components/listings/PropertyCard';
import { FilterSidebar } from '@/components/listings/FilterSidebar';
import PropertyMap from '@/components/listings/PropertyMap';
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
  const initialSortBy = (searchParams.get('sortBy') as any) || (initialLat && initialLng ? 'distance' : 'relevance');

  const [filters, setFilters] = useState<FilterState>({
    query: initialQuery,
    lat: initialLat,
    lng: initialLng,
    gender: initialGender,
    sortBy: initialSortBy,
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMap, setShowMap] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showLocationDeniedBanner, setShowLocationDeniedBanner] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Autocomplete suggestions for colleges & locations on search page
  const [suggestions, setSuggestions] = useState<LocationRef[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with searchParams on load or navigation
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const gender = (searchParams.get('gender') as 'boys' | 'girls' | 'all') || 'all';

    Promise.resolve().then(() => {
      setFilters((prev) => ({
        ...prev,
        query: q,
        lat,
        lng,
        gender,
      }));
    });
  }, [searchParams]);

  // Fetch properties when filters change
  const fetchListingData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await getProperties(filters);
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

    // Debounced search for suggestions (colleges shown first)
    useEffect(() => {
      let active = true;
      const timer = setTimeout(async () => {
        try {
          const results = await searchLocations(filters.query || '');
          if (active) setSuggestions(results);
        } catch {
          // ignore
        }
      }, 150);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }, [filters.query]);

    // Click outside listener for dropdown
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setShowSuggestions(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSuggestion = (loc: LocationRef) => {
      setShowSuggestions(false);
      setFilters((prev) => ({
        ...prev,
        query: loc.name,
        lat: loc.latitude,
        lng: loc.longitude,
        sortBy: 'distance',
      }));

      const params = new URLSearchParams();
      params.set('q', loc.name);
      if (loc.latitude && loc.longitude) {
        params.set('lat', loc.latitude.toString());
        params.set('lng', loc.longitude.toString());
      }
      params.set('sortBy', 'distance');
      if (filters.gender && filters.gender !== 'all') params.set('gender', filters.gender);
      router.replace(`/search?${params.toString()}`);
    };

    const handleSearchKeyDown = async (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        setShowSuggestions(false);
        const trimmed = (filters.query || '').trim();
        if (!trimmed) return;

        const results = await searchLocations(trimmed);
        const match = results.find(
          (r) =>
            r.name.toLowerCase() === trimmed.toLowerCase() ||
            r.name.toLowerCase().includes(trimmed.toLowerCase()) ||
            trimmed.toLowerCase().includes(r.name.toLowerCase())
        );

        if (match && match.latitude && match.longitude) {
          setFilters((prev) => ({
            ...prev,
            query: match.name,
            lat: match.latitude,
            lng: match.longitude,
            sortBy: 'distance',
          }));
          const params = new URLSearchParams();
          params.set('q', match.name);
          params.set('lat', match.latitude.toString());
          params.set('lng', match.longitude.toString());
          params.set('sortBy', 'distance');
          if (filters.gender && filters.gender !== 'all') params.set('gender', filters.gender);
          router.replace(`/search?${params.toString()}`);
        } else {
          setFilters((prev) => ({ ...prev, sortBy: 'distance' }));
        }
      }
    };

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
          const params = new URLSearchParams();
          params.set('q', 'Near My Location');
          params.set('lat', pos.coords.latitude.toString());
          params.set('lng', pos.coords.longitude.toString());
          params.set('sortBy', 'distance');
          if (filters.gender && filters.gender !== 'all') params.set('gender', filters.gender);
          router.replace(`/search?${params.toString()}`);
        },
        (err) => {
          setIsDetectingLocation(false);
          setShowLocationDeniedBanner(true);
        },
        { timeout: 7000, enableHighAccuracy: true }
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
      setShowSuggestions(false);
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
            
            {/* Query input with College Autocomplete & GPS */}
            <div className="relative flex-1" ref={dropdownRef}>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
                <GraduationCap size={19} />
              </div>
              <input
                type="text"
                value={filters.query || ''}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, query: e.target.value }));
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Enter your college (e.g. Marwadi University, RK University, Saurashtra University...)"
                className="w-full pl-10 pr-28 py-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white text-sm outline-none transition"
              />
              {filters.query && (
                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, query: '', lat: undefined, lng: undefined, sortBy: 'relevance' }));
                    setShowSuggestions(false);
                    router.replace('/search');
                  }}
                  className="absolute right-24 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1 transition border border-emerald-500/20 active:scale-95"
                title="Find stays near my current GPS location"
              >
                {isDetectingLocation ? (
                  <Loader2 size={12} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Navigation size={12} className="text-emerald-600 dark:text-emerald-400" />
                )}
                <span>GPS</span>
              </button>

              {/* Autocomplete Dropdown: Colleges First */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 py-2 z-50 max-h-72 overflow-y-auto">
                  <div className="px-4 py-1.5 text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 mb-1">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap size={13} />
                      <span>Suggested Colleges & Locations</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Nearest stays show first</span>
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 flex items-center justify-between gap-3 transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          item.type === 'college'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {item.type === 'college' ? <GraduationCap size={16} /> : <MapPin size={15} />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {item.subtitle || `${item.area}, ${item.city}`}
                          </div>
                        </div>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.type === 'college'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {item.type === 'college' ? '🎓 College' : '📍 Area'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
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
              setFilters((prev) => ({ ...prev, query: area, lat: undefined, lng: undefined, sortBy: 'distance' }));
              setShowLocationDeniedBanner(false);
            }}
          />
        )}

        {/* Results Header: Count, Sort Dropdown, View Switcher & Map Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 gap-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {filters.query ? `Stays near "${filters.query}"` : 'Student Accommodations'}
              </h1>
              {filters.sortBy === 'distance' && (
                <span className="text-[11px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  📍 Nearest First
                </span>
              )}
            </div>
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

      {/* Active College / Search Distance Notice Banner */}
      {filters.query && (
        <div className="bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                <span>Stays near &quot;{filters.query}&quot;</span>
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                  📍 Nearest First
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Sabhi PGs aur hostels &quot;{filters.query}&quot; se distance ke hisab se sorted hain (sabse kam doori wale pehle).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setFilters((prev) => ({ ...prev, query: '', lat: undefined, lng: undefined, sortBy: 'relevance' }));
              setShowSuggestions(false);
              router.replace('/search');
            }}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 px-3.5 py-2 rounded-xl transition self-start sm:self-auto cursor-pointer"
          >
            Clear Filter (Show All Stays)
          </button>
        </div>
      )}

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
                <PropertyCard 
                  key={prop.id} 
                  property={prop} 
                  viewMode={viewMode} 
                  referenceLocation={filters.query} 
                />
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
