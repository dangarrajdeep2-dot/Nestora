'use client';

import React from 'react';
import { 
  RotateCcw, 
  Check, 
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Armchair
} from 'lucide-react';
import { FilterState, PropertyType, SharingType } from '@/types';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (updatedFilters: FilterState) => void;
  onReset: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

const PROPERTY_TYPES: PropertyType[] = ['PG', 'Hostel', 'Room'];

const SHARING_OPTIONS: { id: SharingType; label: string }[] = [
  { id: 'single', label: 'Single sharing' },
  { id: '2-sharing', label: '2 sharing' },
  { id: '3-sharing', label: '3 sharing' },
  { id: '4-plus-sharing', label: '4+ sharing' },
];

const AMENITIES_LIST = [
  'Wi-Fi',
  'Food',
  'AC',
  'Laundry',
  'Parking',
  'Study table',
  'Attached bathroom',
  'Power backup',
  'CCTV',
  'Housekeeping',
];

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: FilterSidebarProps) {
  
  const handleGenderChange = (val: 'boys' | 'girls' | 'all') => {
    onChange({ ...filters, gender: val });
  };

  const handlePropertyTypeToggle = (type: PropertyType) => {
    const current = filters.propertyType || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ ...filters, propertyType: updated });
  };

  const handleSharingToggle = (sharing: SharingType) => {
    const current = filters.sharing || [];
    const updated = current.includes(sharing)
      ? current.filter((s) => s !== sharing)
      : [...current, sharing];
    onChange({ ...filters, sharing: updated });
  };

  const handleAmenityToggle = (amenity: string) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onChange({ ...filters, amenities: updated });
  };

  const handleDistanceChange = (km: number) => {
    onChange({ ...filters, maxDistanceKm: km });
  };

  const handleMinPriceChange = (val: number) => {
    onChange({ ...filters, minPrice: val });
  };

  const handleMaxPriceChange = (val: number) => {
    onChange({ ...filters, maxPrice: val });
  };

  // Count active filters
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
    <div className={`glass-card rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800/80 ${isMobileDrawer ? 'h-full overflow-y-auto' : 'shadow-sm'}`}>
      
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80 mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      <div className="space-y-6">

        {/* 1. For (Gender) */}
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2.5">
            Gender / Accommodation For
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => handleGenderChange('all')}
              className={`py-2 text-xs font-semibold rounded-xl transition ${
                !filters.gender || filters.gender === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange('boys')}
              className={`py-2 text-xs font-semibold rounded-xl transition ${
                filters.gender === 'boys'
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Boys
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange('girls')}
              className={`py-2 text-xs font-semibold rounded-xl transition ${
                filters.gender === 'girls'
                  ? 'bg-rose-500 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Girls
            </button>
          </div>
        </div>

        {/* 2. Property Type */}
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2.5">
            Property Type
          </label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => {
              const isSelected = filters.propertyType?.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePropertyTypeToggle(type)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-500/20'
                      : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {isSelected && <Check size={12} />}
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Distance / Radius */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Distance Radius
            </label>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {filters.maxDistanceKm ? `Within ${filters.maxDistanceKm} km` : 'Any Distance'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 5, 10].map((km) => {
              const isSelected = filters.maxDistanceKm === km;
              return (
                <button
                  key={km}
                  type="button"
                  onClick={() => handleDistanceChange(isSelected ? 0 : km)}
                  className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  &lt; {km} km
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Budget */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
              Monthly Budget (₹)
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1 block">Min Price</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleMinPriceChange(Number(e.target.value) || 0)}
                  className="w-full pl-6 pr-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1 block">Max Price</span>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleMaxPriceChange(Number(e.target.value) || 0)}
                  className="w-full pl-6 pr-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
          {/* Quick budget chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              { label: 'Under ₹6k', max: 6000 },
              { label: '₹6k - ₹10k', min: 6000, max: 10000 },
              { label: 'Above ₹10k', min: 10000, max: 0 },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange({
                    ...filters,
                    minPrice: preset.min || 0,
                    maxPrice: preset.max || 0,
                  });
                }}
                className="text-[11px] bg-slate-100/70 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Room Type (Sharing) */}
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2.5">
            Room Type / Sharing
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SHARING_OPTIONS.map((opt) => {
              const isSelected = filters.sharing?.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSharingToggle(opt.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left border flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold dark:bg-emerald-500/20'
                      : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Amenities */}
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2.5">
            Amenities
          </label>
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES_LIST.map((amenity) => {
              const isChecked = filters.amenities?.includes(amenity);
              return (
                <label
                  key={amenity}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition select-none ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-semibold dark:bg-emerald-500/20'
                      : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked || false}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 border-slate-300 dark:border-slate-700"
                  />
                  <span>{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 7. Special Highlights */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2">
          <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-2">
            Special Highlights
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer bg-white/70 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
              <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Verified Properties Only</span>
            </div>
            <input
              type="checkbox"
              checked={filters.verifiedOnly || false}
              onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer bg-white/70 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
              <Sparkles size={16} className="text-teal-500" />
              <span>Available Now</span>
            </div>
            <input
              type="checkbox"
              checked={filters.availableNowOnly || false}
              onChange={(e) => onChange({ ...filters, availableNowOnly: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer bg-white/70 dark:bg-slate-900/70">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
              <Armchair size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Furnished Only</span>
            </div>
            <input
              type="checkbox"
              checked={filters.furnishedOnly || false}
              onChange={(e) => onChange({ ...filters, furnishedOnly: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
          </label>
        </div>

      </div>

      {isMobileDrawer && (
        <div className="sticky bottom-0 pt-4 mt-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 rounded-xl hover:bg-slate-200"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            className="flex-2 py-3 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
          >
            Apply Filters
          </button>
        </div>
      )}

    </div>
  );
}
