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
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border mb-10 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base text-gray-900 placeholder:text-gray-500" 
            placeholder="Search for your college by name or city..."
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="sm:w-48">
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base text-gray-900 bg-white"
          >
            <option value="all">All Cities</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">
          {debouncedTerm || selectedCity !== 'all' ? 'Search Results' : 'Popular Colleges'}
        </h3>
        {(debouncedTerm || selectedCity !== 'all') && (
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
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
              className="flex items-center p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <MapPin className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
              <div>
                <div className="font-medium text-sm text-gray-900">{college.name}</div>
                <div className="text-xs text-gray-600">{college.city}</div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full bg-gray-50 border border-dashed rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No colleges found matching your search.</p>
            <button 
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md font-medium text-sm hover:bg-blue-200 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
