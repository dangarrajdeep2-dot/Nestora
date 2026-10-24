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
  if (filters.verifiedOnly) activeFilterCount++;
  if (filters.availableNowOnly) activeFilterCount++;

  return (
    <div className={`glass-card p-6 rounded-[24px] ${isMobileDrawer ? 'border-none shadow-none bg-transparent' : ''}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/50 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/25 text-[#4B2E83] dark:text-[#D9C8F0] flex items-center justify-center">
            <SlidersHorizontal size={15} />
          </div>
          <h3 className="font-bold text-[#1B1530] dark:text-white text-base">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-[#7B5EA7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold uppercase tracking-[0.06em] text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-6">

        {/* 1. For (Gender) */}
        <div>
          <label className="block text-[11px] font-bold text-[#6B6580] dark:text-[#A89EC0] uppercase tracking-[0.08em] mb-2.5">
            Gender / Accommodation For
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#D9C8F0]/30 dark:bg-[#2C1D4A]/60 rounded-full border border-white/70 dark:border-white/10">
            <button
              type="button"
              onClick={() => handleGenderChange('all')}
              className={`py-2 text-xs font-bold uppercase tracking-[0.06em] rounded-full transition cursor-pointer ${
                !filters.gender || filters.gender === 'all'
                  ? 'bg-white dark:bg-[#371E68] text-[#1B1530] dark:text-white shadow-sm'
                  : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange('boys')}
              className={`py-2 text-xs font-bold uppercase tracking-[0.06em] rounded-full transition cursor-pointer ${
                filters.gender === 'boys'
                  ? 'bg-[#7B5EA7] text-white shadow-sm'
                  : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530]'
              }`}
            >
              Boys
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange('girls')}
              className={`py-2 text-xs font-bold uppercase tracking-[0.06em] rounded-full transition cursor-pointer ${
                filters.gender === 'girls'
                  ? 'bg-[#9D7FD3] text-white shadow-sm'
                  : 'text-[#6B6580] dark:text-[#A89EC0] hover:text-[#1B1530]'
              }`}
            >
              Girls
            </button>
          </div>
        </div>

        {/* 2. Property Type */}
        <div>
          <label className="block text-[11px] font-bold text-[#6B6580] dark:text-[#A89EC0] uppercase tracking-[0.08em] mb-2.5">
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
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.06em] transition border flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#7B5EA7] border-[#7B5EA7] text-white shadow-sm'
                      : 'bg-white/70 dark:bg-[#201538]/70 border-white/80 dark:border-white/10 text-[#1B1530] dark:text-[#F3EDFB] hover:border-[#7B5EA7]/40'
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
            <label className="text-[11px] font-bold text-[#6B6580] dark:text-[#A89EC0] uppercase tracking-[0.08em]">
              Distance Radius
            </label>
            <span className="text-xs font-bold text-[#7B5EA7] dark:text-[#D9C8F0]">
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
                  className={`py-2 rounded-full text-xs font-bold uppercase tracking-[0.06em] border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#7B5EA7] border-[#7B5EA7] text-white shadow-sm'
                      : 'bg-white/70 dark:bg-[#201538]/70 border-white/80 dark:border-white/10 text-[#1B1530] dark:text-[#F3EDFB] hover:bg-white'
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
            <label className="text-[11px] font-bold text-[#6B6580] dark:text-[#A89EC0] uppercase tracking-[0.08em]">
              Monthly Budget (₹)
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-[#6B6580] dark:text-[#A89EC0] font-bold uppercase tracking-[0.06em] mb-1 block">Min Price</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6580] text-xs">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleMinPriceChange(Number(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-[#201538]/70 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] focus:ring-2 focus:ring-[#7B5EA7]/25 outline-none"
                />
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#6B6580] dark:text-[#A89EC0] font-bold uppercase tracking-[0.06em] mb-1 block">Max Price</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6580] text-xs">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleMaxPriceChange(Number(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-[#201538]/70 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] focus:ring-2 focus:ring-[#7B5EA7]/25 outline-none"
                />
              </div>
            </div>
          </div>
          {/* Quick budget chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
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
                className="text-[10px] font-bold uppercase tracking-[0.06em] bg-[#D9C8F0]/40 dark:bg-[#7B5EA7]/20 hover:bg-[#D9C8F0] text-[#4B2E83] dark:text-[#D9C8F0] px-2.5 py-1 rounded-full border border-[#7B5EA7]/20 transition cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Room Type (Sharing) */}
        <div>
          <label className="block text-[11px] font-bold text-[#6B6580] dark:text-[#A89EC0] uppercase tracking-[0.08em] mb-2.5">
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
                  className={`px-3 py-2.5 rounded-2xl text-xs font-semibold text-left border flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#D9C8F0]/50 border-[#7B5EA7] text-[#4B2E83] dark:text-[#D9C8F0] font-bold dark:bg-[#7B5EA7]/25'
                      : 'bg-white/70 dark:bg-[#201538]/70 border-white/80 dark:border-white/10 text-[#1B1530] dark:text-[#F3EDFB] hover:border-[#7B5EA7]/40'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={13} className="text-[#7B5EA7] dark:text-[#D9C8F0] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Amenities */}
        <div>
          <label className="block text-[11px] font-bold text-[#6B6580] dark:text-[#A89EC0] uppercase tracking-[0.08em] mb-2.5">
            Amenities
          </label>
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES_LIST.map((amenity) => {
              const isChecked = filters.amenities?.includes(amenity);
              return (
                <label
                  key={amenity}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl text-xs cursor-pointer border transition select-none ${
                    isChecked
                      ? 'bg-[#D9C8F0]/40 border-[#7B5EA7] text-[#4B2E83] dark:text-[#D9C8F0] font-bold dark:bg-[#7B5EA7]/25'
                      : 'bg-white/60 dark:bg-[#201538]/60 border-white/80 dark:border-white/10 text-[#1B1530] dark:text-[#F3EDFB] hover:bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked || false}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded accent-[#7B5EA7] w-4 h-4 cursor-pointer"
                  />
                  <span>{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 7. Special Highlights */}
        <div className="pt-3 border-t border-slate-200/50 dark:border-white/10 space-y-2">
          <label className="block text-[11px] font-bold text-[#6B6580] dark:text-[#A89EC0] uppercase tracking-[0.08em] mb-2">
            Special Highlights
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl border border-white/80 dark:border-white/10 hover:border-[#7B5EA7]/30 cursor-pointer bg-white/70 dark:bg-[#201538]/70">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#1B1530] dark:text-[#F3EDFB]">
              <ShieldCheck size={16} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
              <span>Verified Properties Only</span>
            </div>
            <input
              type="checkbox"
              checked={filters.verifiedOnly || false}
              onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
              className="rounded accent-[#7B5EA7] w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl border border-white/80 dark:border-white/10 hover:border-[#7B5EA7]/30 cursor-pointer bg-white/70 dark:bg-[#201538]/70">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#1B1530] dark:text-[#F3EDFB]">
              <Sparkles size={16} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
              <span>Available Now</span>
            </div>
            <input
              type="checkbox"
              checked={filters.availableNowOnly || false}
              onChange={(e) => onChange({ ...filters, availableNowOnly: e.target.checked })}
              className="rounded accent-[#7B5EA7] w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl border border-white/80 dark:border-white/10 hover:border-[#7B5EA7]/30 cursor-pointer bg-white/70 dark:bg-[#201538]/70">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-[#1B1530] dark:text-[#F3EDFB]">
              <Armchair size={16} className="text-[#7B5EA7] dark:text-[#D9C8F0]" />
              <span>Furnished Only</span>
            </div>
            <input
              type="checkbox"
              checked={filters.furnishedOnly || false}
              onChange={(e) => onChange({ ...filters, furnishedOnly: e.target.checked })}
              className="rounded accent-[#7B5EA7] w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

      </div>

      {isMobileDrawer && (
        <div className="sticky bottom-0 pt-4 mt-6 bg-white dark:bg-[#161024] border-t border-slate-200 dark:border-white/10 flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-[#A89EC0] bg-[#D9C8F0]/30 rounded-full hover:bg-[#D9C8F0]/60 cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onCloseMobileDrawer}
            className="flex-2 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white bg-[#4B2E83] rounded-full hover:bg-[#7B5EA7] shadow-md shadow-[#4B2E83]/25 cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      )}

    </div>
  );
}
