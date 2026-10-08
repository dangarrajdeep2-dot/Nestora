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
      <div className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 border px-3 py-2 rounded-md transition flex-shrink-0"
          >
            <SlidersHorizontal size={16} className="mr-2" />
            Filters {hasFilters && <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>}
          </button>

          <form key={searchParams.get('q') || 'empty'} onSubmit={handleSearchSubmit} className="flex-1 flex max-w-sm min-w-0">
            <input 
              type="text" 
              name="q" 
              defaultValue={searchParams.get('q') || ''}
              placeholder="Search hostels..." 
              className="w-full min-w-0 text-sm border rounded-l-md px-3 py-2 focus:ring-blue-500 outline-none text-gray-900"
            />
            <button type="submit" className="bg-gray-100 hover:bg-gray-200 border-y border-r px-3 rounded-r-md text-sm text-gray-700 transition flex-shrink-0">
              Search
            </button>
          </form>
        </div>

        {hasFilters && (
          <button 
            type="button"
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
          >
            <X size={16} className="mr-1" />
            Clear
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg p-4 z-20 flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-2 text-gray-900">Gender</h4>
            <select 
              value={currentGender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full border rounded-md p-2 text-sm focus:ring-blue-500 outline-none text-gray-900"
            >
              <option value="all">All</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="co-ed">Co-ed</option>
            </select>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-2 text-gray-900">Monthly Rent</h4>
            <select 
              value={currentRent}
              onChange={(e) => handleFilterChange('rent', e.target.value)}
              className="w-full border rounded-md p-2 text-sm focus:ring-blue-500 outline-none text-gray-900"
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
