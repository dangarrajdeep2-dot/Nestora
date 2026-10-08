import React, { Suspense } from 'react';
import { SearchClient } from './SearchClient';
import { SearchResultsSkeleton } from '@/components/ui/States';

export const metadata = {
  title: 'Search Stays & PGs — Nestora',
  description: 'Find verified PGs, hostels and student rooms near your college or locality.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><SearchResultsSkeleton /></div>}>
      <SearchClient />
    </Suspense>
  );
}
