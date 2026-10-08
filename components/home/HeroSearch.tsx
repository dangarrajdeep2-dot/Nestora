'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Loader2, 
  School, 
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

  // Debounced search for suggestions
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

    const timer = setTimeout(fetchSugg, 200);
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
      },
      (error) => {
        setIsDetectingLocation(false);
        console.warn('Geolocation denied or failed:', error.message);
        setLocationError('Location permission not granted. You can type any college or locality manually.');
        onLocationDenied?.();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleFindStay = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('q', query.trim());
    }
    if (selectedCoords.lat && selectedCoords.lng) {
      params.set('lat', selectedCoords.lat.toString());
      params.set('lng', selectedCoords.lng.toString());
    }
    if (selectedGender && selectedGender !== 'all') {
      params.set('gender', selectedGender);
    }

    router.push(`/search?${params.toString()}`);
  };

  const popularChips = [
    { name: 'Kotecha Chowk, Rajkot', lat: 22.2905, lng: 70.7818 },
    { name: 'Kalawad Road, Rajkot', lat: 22.2789, lng: 70.7654 },
    { name: 'Saurashtra University', lat: 22.3015, lng: 70.7491 },
    { name: 'RK University', lat: 22.2415, lng: 70.9012 },
    { name: 'Marwadi University', lat: 22.3687, lng: 70.8032 },
    { name: 'FC Road, Pune', lat: 18.5284, lng: 73.8415 },
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
            <span>Zero Brokerage • Verified PGs</span>
          </div>
        </div>

        {/* Main Search Input Form */}
        <form onSubmit={handleFindStay} className="relative">
          <div className="flex flex-col md:flex-row items-stretch gap-2.5">
            {/* Search Input Box */}
            <div className="relative flex-1" ref={dropdownRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search size={20} />
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
                placeholder="Search college, area, or locality (e.g. Kotecha Chowk, Rajkot)"
                className="w-full pl-11 pr-28 py-3.5 sm:py-4 bg-slate-50/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all shadow-inner"
              />

              {/* Clear button if typed */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedCoords({});
                  }}
                  className="absolute right-24 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1"
                >
                  Clear
                </button>
              )}

              {/* "Use Current Location" Quick GPS Trigger */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingLocation}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition border border-emerald-500/20 active:scale-95 cursor-pointer backdrop-blur-sm"
                title="Use device GPS location"
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Detecting...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Use GPS</span>
                  </>
                )}
              </button>

              {/* Autocomplete Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 py-2 z-50 max-h-80 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                    Suggested Locations & Colleges
                  </div>

                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectLocation(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 flex items-start gap-3 transition"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        {item.type === 'college' ? <School size={16} /> : <MapPin size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.subtitle || `${item.area}, ${item.city}`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary CTA Button with Emerald Theme */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
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

        {/* Popular / Recent Location Pills */}
        <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-800/80">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Sparkles size={13} className="text-emerald-500" />
            <span>Popular Student Hubs:</span>
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
                  if (selectedGender !== 'all') params.set('gender', selectedGender);
                  router.push(`/search?${params.toString()}`);
                }}
                className="text-xs bg-slate-100/70 dark:bg-slate-900/60 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 transition font-medium flex items-center gap-1.5 active:scale-95"
              >
                <MapPin size={11} className="text-emerald-500" />
                <span>{chip.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
