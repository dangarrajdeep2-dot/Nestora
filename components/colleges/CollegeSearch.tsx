'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';
import { College } from '@/types';

export default function CollegeSearch({ initialColleges }: { initialColleges: College[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  
  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const uniqueCities = Array.from(new Set(initialColleges.map(c => c.city))).sort();

  const filteredColleges = initialColleges.filter((college) => {
    const matchesCity = selectedCity === 'all' || college.city === selectedCity;
    if (!matchesCity) return false;

    if (!debouncedTerm.trim()) return true;
    
    const term = debouncedTerm.toLowerCase().trim();
    return (
      college.name.toLowerCase().includes(term) ||
      college.city.toLowerCase().includes(term)
    );
  });

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedTerm('');
    setSelectedCity('all');
  };

  return (
    <div className="glass-card bg-white/80 dark:bg-[#161024]/80 backdrop-blur-xl p-5 sm:p-7 rounded-[24px] shadow-[0_10px_30px_rgba(123,94,167,0.12)] border border-white/80 dark:border-white/10 mb-10 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#7B5EA7]" />
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-white/80 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-[#7B5EA7]/25 focus:border-[#7B5EA7] outline-none text-sm bg-white/70 dark:bg-black/30 text-[#1B1530] dark:text-white placeholder-[#6B6580]/50 transition" 
            placeholder="Search for your college by name or city..."
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B6580] hover:text-[#1B1530] dark:text-purple-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="sm:w-44">
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="block w-full py-3 px-3.5 border border-white/80 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-[#7B5EA7]/25 focus:border-[#7B5EA7] outline-none text-sm text-[#1B1530] dark:text-white bg-white/70 dark:bg-[#161024] transition"
          >
            <option value="all">All Cities</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-lg uppercase tracking-tight text-[#1B1530] dark:text-white">
          {debouncedTerm || selectedCity !== 'all' ? 'Search Results' : 'Popular Colleges'}
        </h3>
        {(debouncedTerm || selectedCity !== 'all') && (
          <button onClick={clearFilters} className="text-xs font-bold uppercase tracking-[0.08em] text-[#7B5EA7] hover:text-[#4B2E83] dark:text-purple-300">
            Clear all
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredColleges.length > 0 ? (
          filteredColleges.map((college: College) => (
            <Link 
              key={college.id} 
              href={`/colleges/${college.id}`}
              className="flex items-center p-3.5 border border-white/80 dark:border-white/10 rounded-2xl bg-white/70 dark:bg-black/20 hover:border-[#7B5EA7]/40 hover:bg-[#D9C8F0]/30 transition shadow-sm group"
            >
              <div className="w-8 h-8 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/30 flex items-center justify-center text-[#7B5EA7] dark:text-purple-200 mr-3 flex-shrink-0 group-hover:scale-105 transition-transform">
                <MapPin size={15} />
              </div>
              <div>
                <div className="font-bold text-sm text-[#1B1530] dark:text-white group-hover:text-[#4B2E83] dark:group-hover:text-purple-200 transition-colors">{college.name}</div>
                <div className="text-xs text-[#6B6580] dark:text-purple-200/70">{college.city}</div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full bg-white/50 dark:bg-black/20 border border-dashed border-[#D9C8F0] dark:border-white/10 rounded-2xl p-8 text-center">
            <p className="text-xs sm:text-sm text-[#6B6580] dark:text-purple-200/70 mb-4">No colleges found matching your search.</p>
            <button 
              onClick={clearFilters}
              className="px-5 py-2 bg-[#D9C8F0]/50 text-[#4B2E83] dark:bg-[#7B5EA7]/20 dark:text-purple-200 rounded-full font-bold text-xs uppercase tracking-[0.08em] hover:bg-[#D9C8F0] transition border border-[#7B5EA7]/20 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
