'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

export default function FilterBar({ collegeId }: { collegeId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const currentGender = searchParams.get('gender') || 'all';
  const currentRent = searchParams.get('rent') || 'any';
  
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all' || value === 'any') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/colleges/${collegeId}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q') as string;
    handleFilterChange('q', query);
  };

  const clearFilters = () => {
    router.push(`/colleges/${collegeId}`);
  };

  const hasFilters = searchParams.has('gender') || searchParams.has('rent') || searchParams.has('q');

  return (
    <div className="mb-6 relative z-50">
      <div className="flex justify-between items-center glass-card bg-white/80 dark:bg-[#161024]/80 backdrop-blur-xl p-3 sm:p-4 rounded-[20px] border border-white/80 dark:border-white/10 shadow-[0_10px_30px_rgba(123,94,167,0.12)] flex-wrap gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center text-xs font-bold uppercase tracking-[0.08em] text-[#1B1530] dark:text-white bg-white/70 dark:bg-white/10 hover:bg-[#D9C8F0]/40 border border-white/80 dark:border-white/10 px-3.5 py-2.5 rounded-full transition flex-shrink-0 cursor-pointer shadow-sm"
          >
            <SlidersHorizontal size={14} className="mr-2 text-[#7B5EA7]" />
            Filters {hasFilters && <span className="ml-2 w-2 h-2 rounded-full bg-[#7B5EA7]"></span>}
          </button>

          <form key={searchParams.get('q') || 'empty'} onSubmit={handleSearchSubmit} className="flex-1 flex max-w-sm min-w-0">
            <input 
              type="text" 
              name="q" 
              defaultValue={searchParams.get('q') || ''}
              placeholder="Search hostels..." 
              className="w-full min-w-0 text-xs sm:text-sm border border-white/80 dark:border-white/10 rounded-l-full px-4 py-2.5 focus:ring-2 focus:ring-[#7B5EA7]/25 outline-none text-[#1B1530] dark:text-white bg-white/70 dark:bg-black/30 placeholder-[#6B6580]/50"
            />
            <button type="submit" className="bg-[#7B5EA7] hover:bg-[#4B2E83] text-white px-4 rounded-r-full text-xs font-bold uppercase tracking-[0.08em] transition flex-shrink-0 cursor-pointer shadow-sm">
              Search
            </button>
          </form>
        </div>

        {hasFilters && (
          <button 
            type="button"
            onClick={clearFilters}
            className="text-xs font-bold uppercase tracking-[0.08em] text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 cursor-pointer"
          >
            <X size={14} className="mr-1" />
            Clear
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card bg-white/95 dark:bg-[#161024]/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[20px] shadow-[0_15px_35px_rgba(123,94,167,0.2)] p-5 z-20 flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <h4 className="font-heading text-base uppercase tracking-tight mb-2 text-[#1B1530] dark:text-white">Gender</h4>
            <select 
              value={currentGender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full border border-white/80 dark:border-white/10 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#7B5EA7]/25 outline-none text-[#1B1530] dark:text-white bg-white/80 dark:bg-black/40"
            >
              <option value="all">All</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="co-ed">Co-ed</option>
            </select>
          </div>
          <div className="flex-1">
            <h4 className="font-heading text-base uppercase tracking-tight mb-2 text-[#1B1530] dark:text-white">Monthly Rent</h4>
            <select 
              value={currentRent}
              onChange={(e) => handleFilterChange('rent', e.target.value)}
              className="w-full border border-white/80 dark:border-white/10 rounded-xl p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#7B5EA7]/25 outline-none text-[#1B1530] dark:text-white bg-white/80 dark:bg-black/40"
            >
              <option value="any">Any</option>
              <option value="under_8k">Under ₹8,000</option>
              <option value="8k_15k">₹8,000 - ₹15,000</option>
              <option value="15k_25k">₹15,000 - ₹25,000</option>
              <option value="above_25k">Above ₹25,000</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
