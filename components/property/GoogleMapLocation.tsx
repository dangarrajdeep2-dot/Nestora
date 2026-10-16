'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  Compass, 
  Footprints,
  Maximize2
} from 'lucide-react';
import { Property } from '@/types';

// Dynamically load PropertyMap to avoid SSR hydration issues
const PropertyMap = dynamic(() => import('@/components/listings/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="h-72 sm:h-80 w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200 dark:border-slate-800">
      <MapPin size={28} className="text-emerald-500 animate-bounce" />
      <span className="text-xs font-semibold">Loading interactive map...</span>
    </div>
  ),
});

interface GoogleMapLocationProps {
  property: Property;
}

export function GoogleMapLocation({ property }: GoogleMapLocationProps) {
  const customMapUrl = property.googleMapUrl?.trim() || '';
  
  // Check if admin provided a dedicated Google Maps embed URL or iframe code
  const isEmbedUrl = customMapUrl.includes('/maps/embed');
  
  // If admin provided a real embed link, default to Google tab. Otherwise default to interactive Area Map
  const [activeTab, setActiveTab] = useState<'google' | 'leaflet'>(isEmbedUrl ? 'google' : 'leaflet');
  const [copied, setCopied] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Construct embed URL:
  // 1. If admin provided embed URL, use it directly
  // 2. Otherwise use the standard search query embed URL
  const embedUrl = isEmbedUrl 
    ? customMapUrl
    : `https://maps.google.com/maps?q=${encodeURIComponent(`${property.title}, ${property.address || property.area}, ${property.city}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Direct Google Maps Navigation URL (Turn-by-turn directions)
  const directionsUrl = customMapUrl && !isEmbedUrl && (customMapUrl.includes('goo.gl') || customMapUrl.includes('google.com/maps'))
    ? customMapUrl
    : `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`;

  // Direct Google Maps Place Search URL
  const googleMapsUrl = customMapUrl && !isEmbedUrl
    ? customMapUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.title}, ${property.address || property.area}, ${property.city}`)}`;

  // Walking route to nearby college if available
  const collegeRouteUrl = property.nearbyCollegeName
    ? `https://www.google.com/maps/dir/?api=1&origin=${property.latitude},${property.longitude}&destination=${encodeURIComponent(
        `${property.nearbyCollegeName}, ${property.city}`
      )}&travelmode=walking`
    : null;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${property.title}, ${property.address}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
      
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
              Location & Neighborhood
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              Google Maps
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exact pin location, campus distance & GPS navigation
          </p>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('leaflet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leaflet'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>Interactive Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'google'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass size={13} />
            <span>Google Map {isEmbedUrl ? '✓' : ''}</span>
          </button>
        </div>
      </div>

      {/* Address & Quick Info Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
        <div className="flex items-start gap-2 min-w-0">
          <MapPin size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
            {property.address}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Coordinates Badge */}
          {property.latitude && property.longitude ? (
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden md:inline">
              {property.latitude.toFixed(4)}°, {property.longitude.toFixed(4)}°
            </span>
          ) : null}

          {/* Copy Address Button */}
          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700 shadow-sm transition active:scale-95 cursor-pointer"
            title="Copy exact address"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Map Display Container */}
      <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
        {activeTab === 'google' ? (
          <>
            {/* Loading Skeleton */}
            {!mapLoaded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 animate-pulse text-slate-400 gap-2">
                <MapPin size={32} className="text-emerald-500 animate-bounce" />
                <span className="text-xs font-semibold">Connecting to Google Maps...</span>
              </div>
            )}

            {/* Live Google Map Iframe */}
            <iframe
              src={embedUrl}
              title={`Google Map location for ${property.title}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setMapLoaded(true)}
              className="w-full h-full"
            />

            {/* Quick External Launch Overlay in corner */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 z-10 bg-white/95 dark:bg-slate-900/95 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 transition"
            >
              <Maximize2 size={12} />
              <span>Full View ↗</span>
            </a>
          </>
        ) : (
          <PropertyMap
            properties={[property]}
            searchedLocation={{
              name: property.title,
              latitude: property.latitude,
              longitude: property.longitude,
            }}
          />
        )}
      </div>

      {/* Action Navigation Buttons Strip */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {/* 1. Primary Direction CTA */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-3d inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex-1 sm:flex-initial"
        >
          <Navigation size={15} />
          <span>Get Directions</span>
          <ExternalLink size={12} className="opacity-75" />
        </a>

        {/* 2. Open in Google Maps */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold border border-slate-200/80 dark:border-slate-700 shadow-sm transition flex-1 sm:flex-initial"
        >
          <Compass size={15} className="text-emerald-500" />
          <span>Open in Google Maps</span>
          <ExternalLink size={12} className="opacity-60" />
        </a>

        {/* 3. Walking route to college if available */}
        {collegeRouteUrl && property.nearbyCollegeName && (
          <a
            href={collegeRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold border border-emerald-500/30 transition w-full sm:w-auto"
          >
            <Footprints size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>Walking route to {property.nearbyCollegeName}</span>
            <ExternalLink size={12} className="opacity-60" />
          </a>
        )}
      </div>

    </div>
  );
}
