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
  AlertCircle,
  ArrowRight
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
      (pos) => {
        setIsDetectingLocation(false);
        const { latitude, longitude } = pos.coords;
        const params = new URLSearchParams();
        params.set('lat', latitude.toString());
        params.set('lng', longitude.toString());
        params.set('q', 'Current Location');
        params.set('sortBy', 'distance');
        if (selectedGender !== 'all') {
          params.set('gender', selectedGender);
        }
        router.push(`/search?${params.toString()}`);
      },
      (err) => {
        setIsDetectingLocation(false);
        let msg = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please search your college or area manually.';
          onLocationDenied?.();
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again or search manually.';
        }
        setLocationError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleFindStay = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (query.trim()) {
      params.set('q', query.trim());
    }

    let lat = selectedCoords.lat;
    let lng = selectedCoords.lng;

    // Check if query exactly matches one of our suggestions
    if (!lat && query.trim() && suggestions.length > 0) {
      const match = suggestions.find((s) => s.name.toLowerCase() === query.trim().toLowerCase());
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
      {/* Translucent Soft Pastel Lavender Glass Card */}
      <div className="glass-card rounded-[24px] p-5 sm:p-7 md:p-8 relative">
        
        {/* Gender Selection Tabs with Soft Lilac Background */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1.5 bg-[#D9C8F0]/35 dark:bg-[#2C1D4A]/60 rounded-full w-full sm:w-auto border border-white/70 dark:border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setSelectedGender('all')}
              className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.08em] transition-all text-center whitespace-nowrap cursor-pointer ${
                selectedGender === 'all'
                  ? 'bg-white dark:bg-[#371E68] text-[#1B1530] dark:text-white shadow-sm'
                  : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530] dark:hover:text-white'
              }`}
            >
              <span className="sm:hidden">All</span>
              <span className="hidden sm:inline">All Stays</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('boys')}
              className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.08em] transition-all text-center whitespace-nowrap cursor-pointer ${
                selectedGender === 'boys'
                  ? 'bg-[#7B5EA7] text-white shadow-md shadow-[#7B5EA7]/30'
                  : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530] dark:hover:text-white'
              }`}
            >
              <span className="sm:hidden">Boys</span>
              <span className="hidden sm:inline">Boys PG / Hostel</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('girls')}
              className={`flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.08em] transition-all text-center whitespace-nowrap cursor-pointer ${
                selectedGender === 'girls'
                  ? 'bg-[#9D7FD3] text-white shadow-md shadow-[#9D7FD3]/30'
                  : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530] dark:hover:text-white'
              }`}
            >
              <span className="sm:hidden">Girls</span>
              <span className="hidden sm:inline">Girls PG / Hostel</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#4B2E83] dark:text-[#D9C8F0] font-bold uppercase tracking-[0.06em] bg-[#D9C8F0]/40 dark:bg-[#7B5EA7]/20 px-3.5 py-1.5 rounded-full border border-[#7B5EA7]/20 backdrop-blur-sm">
            <CheckCircle2 size={13} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
            <span>Zero Brokerage • Nearest First</span>
          </div>
        </div>

        {/* Main Search Input Form */}
        <form onSubmit={handleFindStay} className="relative">
          <div className="flex flex-col md:flex-row items-stretch gap-2.5">
            {/* Search Input Box */}
            <div className="relative flex-1" ref={dropdownRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#7B5EA7] dark:text-[#D9C8F0]">
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
                className="w-full pl-12 pr-32 py-3.5 sm:py-4 bg-white/75 dark:bg-[#201538]/70 hover:bg-white dark:hover:bg-[#1D1333] focus:bg-white dark:focus:bg-[#160E28] text-[#1B1530] dark:text-white placeholder:text-[#6B6580] dark:placeholder:text-[#A89EC0] text-sm sm:text-base rounded-2xl border border-white/80 dark:border-white/10 focus:border-[#7B5EA7] focus:ring-4 focus:ring-[#7B5EA7]/20 outline-none transition-all shadow-inner"
              />

              {/* Clear button if typed */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedCoords({});
                  }}
                  className="absolute right-28 top-1/2 -translate-y-1/2 text-[#6B6580] hover:text-[#1B1530] dark:hover:text-white text-xs px-2 py-1"
                >
                  Clear
                </button>
              )}

              {/* "Use GPS" Quick Trigger */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingLocation}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#D9C8F0]/50 dark:bg-[#7B5EA7]/25 hover:bg-[#D9C8F0] dark:hover:bg-[#7B5EA7]/40 text-[#4B2E83] dark:text-[#D9C8F0] text-xs font-bold uppercase tracking-[0.06em] transition border border-[#7B5EA7]/20 active:scale-95 cursor-pointer backdrop-blur-sm"
                title="Use GPS to find closest hostels to you"
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-[#7B5EA7]" />
                    <span className="hidden sm:inline">Locating...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={13} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
                    <span>Use GPS</span>
                  </>
                )}
              </button>

              {/* Autocomplete Dropdown: College First */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-[#1E1535]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/90 dark:border-white/10 py-2 z-50 max-h-80 overflow-y-auto">
                  <div className="px-4 py-2 text-[11px] font-bold uppercase text-[#7B5EA7] dark:text-[#D9C8F0] tracking-[0.08em] flex items-center justify-between border-b border-slate-100 dark:border-white/5 mb-1">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap size={14} />
                      <span>Suggested Colleges & Locations</span>
                    </span>
                    <span className="text-[10px] text-[#6B6580] dark:text-[#A89EC0] font-normal normal-case">Nearest stays show first</span>
                  </div>

                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectLocation(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#D9C8F0]/25 dark:hover:bg-[#7B5EA7]/20 flex items-center justify-between gap-3 transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          item.type === 'college'
                            ? 'bg-[#D9C8F0]/60 text-[#4B2E83] dark:bg-[#7B5EA7]/30 dark:text-[#D9C8F0]'
                            : 'bg-slate-100 dark:bg-white/5 text-[#6B6580]'
                        }`}>
                          {item.type === 'college' ? <GraduationCap size={17} /> : <MapPin size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-[#1B1530] dark:text-white truncate group-hover:text-[#7B5EA7] dark:group-hover:text-[#D9C8F0] transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-[#6B6580] dark:text-[#A89EC0] truncate">
                            {item.subtitle || `${item.area}, ${item.city}`}
                          </div>
                        </div>
                      </div>

                      <span className={`shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        item.type === 'college'
                          ? 'bg-[#D9C8F0]/40 dark:bg-[#7B5EA7]/25 text-[#4B2E83] dark:text-[#D9C8F0] border-[#7B5EA7]/20'
                          : 'bg-slate-50 dark:bg-white/5 text-[#6B6580] dark:text-[#A89EC0] border-slate-200 dark:border-white/10'
                      }`}>
                        {item.type === 'college' ? '🎓 College' : '📍 Area'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary CTA Button: Pill Shape, --primary background, uppercase with trailing arrow */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full bg-[#7B5EA7] hover:bg-[#4B2E83] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-[0.08em] shadow-lg shadow-[#7B5EA7]/30 transition-all shrink-0 cursor-pointer hover:-translate-y-0.5"
            >
              <span>Find Stay</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* Location Error Notice if denied */}
        {locationError && (
          <div className="mt-3 text-xs text-amber-900 dark:text-amber-200 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-amber-600" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Popular / Recent Location Pills: Colleges First & GPS Shortcut */}
        <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-white/10">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2 text-xs font-semibold text-[#6B6580] dark:text-[#A89EC0]">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
              <span className="uppercase tracking-[0.06em] text-[11px] font-bold">Popular Student Colleges & Hubs:</span>
            </div>

            {/* Direct GPS Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isDetectingLocation}
              className="inline-flex items-center gap-1.5 text-xs text-[#7B5EA7] dark:text-[#D9C8F0] hover:underline font-bold uppercase tracking-[0.06em]"
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
                className={`text-xs px-3.5 py-1.5 rounded-full border transition font-medium flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                  chip.isCollege
                    ? 'bg-[#D9C8F0]/40 dark:bg-[#7B5EA7]/20 text-[#4B2E83] dark:text-[#D9C8F0] border-[#7B5EA7]/20 hover:bg-[#D9C8F0]/80'
                    : 'bg-white/60 dark:bg-white/5 text-[#1B1530] dark:text-[#F3EDFB] border-white/80 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                {chip.isCollege ? (
                  <GraduationCap size={13} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
                ) : (
                  <MapPin size={12} className="text-[#6B6580]" />
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
