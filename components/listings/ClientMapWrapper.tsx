'use client';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/listings/HostelMap'), { 
  ssr: false,
  loading: () => <div className="h-64 sm:h-80 w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-600">Loading map...</div>
});

interface Props {
  hostel: {
    latitude: number;
    longitude: number;
    title: string;
  };
  college: {
    latitude: number;
    longitude: number;
    name: string;
  };
}

export default function ClientMapWrapper({ hostel, college }: Props) {
  return <MapComponent hostel={hostel} college={college} />;
}
