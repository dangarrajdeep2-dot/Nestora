'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Loader2, 
  GraduationCap, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { LocationRef } from '@/types';
import { searchLocations } from '@/lib/api/properties';

interface HeroSearchProps {
  onLocationDenied?: () => void;
}

export function HeroSearch({ onLocationDenied }: HeroSearchProps) {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'boys' | 'girls' | 'all'>('all');
  const [suggestions, setSuggestions] = useState<LocationRef[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat?: number; lng?: number }>({});

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search for suggestions (colleges shown first)
  useEffect(() => {
    let active = true;
    const fetchSugg = async () => {
      setIsSearchingSuggestions(true);
      try {
        const results = await searchLocations(query);
        if (active) {
          setSuggestions(results);
        }
      } catch {
        // ignore
      } finally {
        if (active) setIsSearchingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSugg, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (loc: LocationRef) => {
    setQuery(loc.name);
    setSelectedCoords({ lat: loc.latitude, lng: loc.longitude });
    setShowDropdown(false);

    // Navigate immediately to search with distance sorting
    const params = new URLSearchParams();
    params.set('q', loc.name);
    if (loc.latitude && loc.longitude) {
      params.set('lat', loc.latitude.toString());
      params.set('lng', loc.longitude.toString());
    }
    params.set('sortBy', 'distance');
    if (selectedGender !== 'all') {
      params.set('gender', selectedGender);
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      onLocationDenied?.();
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetectingLocation(false);
        const { latitude, longitude } = position.coords;
        setQuery('Near My Current Location');
        setSelectedCoords({ lat: latitude, lng: longitude });
        setShowDropdown(false);

        // Instantly navigate to nearby hostels sorted by closest distance
        const params = new URLSearchParams();
        params.set('q', 'Near My Current Location');
        params.set('lat', latitude.toString());
        params.set('lng', longitude.toString());
        params.set('sortBy', 'distance');
        if (selectedGender !== 'all') {
          params.set('gender', selectedGender);
        }
        router.push(`/search?${params.toString()}`);
      },
      (error) => {
        setIsDetectingLocation(false);
        console.warn('Geolocation denied or failed:', error.message);
        setLocationError('Location permission not granted. You can type your college or locality manually.');
        onLocationDenied?.();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleFindStay = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) {
      params.set('q', trimmed);
    }

    let lat = selectedCoords.lat;
    let lng = selectedCoords.lng;

    // If user typed college manually without picking from dropdown, auto-detect coordinates
    if ((!lat || !lng) && trimmed) {
      const results = await searchLocations(trimmed);
      const match = results.find(
        (r) =>
          r.name.toLowerCase() === trimmed.toLowerCase() ||
          r.name.toLowerCase().includes(trimmed.toLowerCase()) ||
          trimmed.toLowerCase().includes(r.name.toLowerCase())
      );
      if (match && match.latitude && match.longitude) {
        lat = match.latitude;
        lng = match.longitude;
      }
    }

    if (lat && lng) {
      params.set('lat', lat.toString());
      params.set('lng', lng.toString());
      params.set('sortBy', 'distance');
    } else {
      params.set('sortBy', 'distance');
    }

    if (selectedGender && selectedGender !== 'all') {
      params.set('gender', selectedGender);
    }

    setShowDropdown(false);
    router.push(`/search?${params.toString()}`);
  };

  const popularChips = [
    { name: 'Marwadi University', lat: 22.3687, lng: 70.8032, isCollege: true },
    { name: 'RK University', lat: 22.2415, lng: 70.9012, isCollege: true },
    { name: 'Saurashtra University', lat: 22.3015, lng: 70.7491, isCollege: true },
    { name: 'Atmiya University', lat: 22.2751, lng: 70.7712, isCollege: true },
    { name: 'Kotecha Chowk, Rajkot', lat: 22.2905, lng: 70.7818, isCollege: false },
    { name: 'Kalawad Road, Rajkot', lat: 22.2789, lng: 70.7654, isCollege: false },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Glassmorphic Search Card with Emerald Glow */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 md:p-8 relative">
        
        {/* Gender Selection Tabs with Glassy Feel */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl w-full sm:w-auto border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setSelectedGender('all')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedGender === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Stays
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('boys')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedGender === 'boys'
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Boys PG / Hostel
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('girls')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedGender === 'girls'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Girls PG / Hostel
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm">
            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Zero Brokerage • Nearest Hostels First</span>
          </div>
        </div>

        {/* Main Search Input Form */}
        <form onSubmit={handleFindStay} className="relative">
          <div className="flex flex-col md:flex-row items-stretch gap-2.5">
            {/* Search Input Box */}
            <div className="relative flex-1" ref={dropdownRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                <GraduationCap size={22} />
              </div>
              
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedCoords({});
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Enter your college (e.g. Marwadi University, RK University, Saurashtra University...)"
                className="w-full pl-12 pr-32 py-3.5 sm:py-4 bg-slate-50/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all shadow-inner"
              />

              {/* Clear button if typed */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedCoords({});
                  }}
                  className="absolute right-28 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1"
                >
                  Clear
                </button>
              )}

              {/* "Use GPS" Quick Trigger */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingLocation}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition border border-emerald-500/20 active:scale-95 cursor-pointer backdrop-blur-sm"
                title="Use GPS to find closest hostels to you"
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Locating...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Use GPS</span>
                  </>
                )}
              </button>

              {/* Autocomplete Dropdown: College First */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 py-2 z-50 max-h-80 overflow-y-auto">
                  <div className="px-4 py-2 text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 mb-1">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap size={14} />
                      <span>Suggested Colleges & Locations</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Nearest stays show first</span>
                  </div>

                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectLocation(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 flex items-center justify-between gap-3 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          item.type === 'college'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {item.type === 'college' ? <GraduationCap size={18} /> : <MapPin size={17} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
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

            {/* Primary CTA Button with Emerald Theme */}
            <button
              type="submit"
              className="btn-3d inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
            >
              <Search size={18} />
              <span>Find Stay</span>
            </button>
          </div>
        </form>

        {/* Location Error Notice if denied */}
        {locationError && (
          <div className="mt-3 text-xs text-amber-800 dark:text-amber-200 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-amber-500" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Popular / Recent Location Pills: Colleges First & GPS Shortcut */}
        <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-emerald-500" />
              <span>Popular Student Colleges & Hubs:</span>
            </div>

            {/* Direct GPS Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isDetectingLocation}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              <Navigation size={12} />
              <span>Use My GPS</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularChips.map((chip) => (
              <button
                key={chip.name}
                type="button"
                onClick={() => {
                  setQuery(chip.name);
                  setSelectedCoords({ lat: chip.lat, lng: chip.lng });
                  const params = new URLSearchParams();
                  params.set('q', chip.name);
                  params.set('lat', chip.lat.toString());
                  params.set('lng', chip.lng.toString());
                  params.set('sortBy', 'distance');
                  if (selectedGender !== 'all') params.set('gender', selectedGender);
                  router.push(`/search?${params.toString()}`);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border transition font-medium flex items-center gap-1.5 active:scale-95 ${
                  chip.isCollege
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800 hover:bg-emerald-100/80'
                    : 'bg-slate-100/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800 hover:bg-slate-200/60'
                }`}
              >
                {chip.isCollege ? (
                  <GraduationCap size={13} className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <MapPin size={12} className="text-slate-400" />
                )}
                <span>{chip.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
