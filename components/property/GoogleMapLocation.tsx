'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check, 
  Compass, 
  Footprints,
  Maximize2
} from 'lucide-react';
import { Property } from '@/types';

interface GoogleMapLocationProps {
  property: Property;
}

export function GoogleMapLocation({ property }: GoogleMapLocationProps) {
  const customMapUrl = property.googleMapUrl?.trim() || '';
  
  // Check if admin provided a dedicated Google Maps embed URL
  const isEmbedUrl = customMapUrl.includes('/maps/embed');
  const [copied, setCopied] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Automatic Google Maps Search Query built from hostel title, area, and city
  const hostelQuery = `${property.title}, ${property.area}, ${property.city}`;

  // Construct Google Map embed URL
  const embedUrl = isEmbedUrl 
    ? customMapUrl
    : `https://maps.google.com/maps?q=${encodeURIComponent(hostelQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Direct Google Maps Navigation URL (Turn-by-turn directions)
  const directionsUrl = customMapUrl && !isEmbedUrl && (customMapUrl.includes('goo.gl') || customMapUrl.includes('google.com/maps'))
    ? customMapUrl
    : property.latitude && property.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hostelQuery)}`;

  // Direct Google Maps Place Search URL
  const googleMapsUrl = customMapUrl && !isEmbedUrl
    ? customMapUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hostelQuery)}`;

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
    <div className="glass-card rounded-[24px] p-6 sm:p-7 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_rgba(123,94,167,0.12)] space-y-4">
      
      {/* Header with Title and Google Maps Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D9C8F0]/40 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-2xl sm:text-3xl text-[#1B1530] dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7B5EA7] ring-4 ring-[#7B5EA7]/20"></span>
              Google Maps Location
            </h2>
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] px-2.5 py-0.5 rounded-full bg-[#D9C8F0]/50 text-[#4B2E83] dark:bg-[#7B5EA7]/20 dark:text-purple-200 border border-[#7B5EA7]/20">
              Live Map
            </span>
          </div>
          <p className="text-xs text-[#6B6580] dark:text-purple-200/70 mt-1">
            Exact pin location, campus distance & GPS navigation
          </p>
        </div>

        {/* Primary Open in Google Maps button */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-white/10 hover:bg-[#D9C8F0]/40 text-[#4B2E83] dark:text-purple-200 text-xs font-bold uppercase tracking-[0.08em] transition border border-[#D9C8F0] dark:border-white/10 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Compass size={14} className="text-[#7B5EA7]" />
          <span>Open Google Maps</span>
          <ExternalLink size={11} className="opacity-70" />
        </a>
      </div>

      {/* Address & Quick Info Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white/60 dark:bg-[#1B1530]/40 p-3.5 rounded-2xl border border-white/80 dark:border-white/10">
        <div className="flex items-start gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#7B5EA7] dark:text-purple-200">
            <MapPin size={14} />
          </div>
          <span className="text-xs text-[#1B1530] dark:text-purple-100 font-medium line-clamp-2 self-center">
            {property.address}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Coordinates Badge */}
          {property.latitude && property.longitude ? (
            <span className="text-[11px] font-mono text-[#6B6580] dark:text-purple-300/70 hidden md:inline">
              {property.latitude.toFixed(4)}°, {property.longitude.toFixed(4)}°
            </span>
          ) : null}

          {/* Copy Address Button */}
          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-white/10 hover:bg-[#D9C8F0]/40 text-[#4B2E83] dark:text-purple-200 text-xs font-bold uppercase tracking-[0.08em] border border-[#D9C8F0] dark:border-white/10 shadow-sm transition active:scale-95 cursor-pointer"
            title="Copy exact address"
          >
            {copied ? (
              <>
                <Check size={12} className="text-[#7B5EA7]" />
                <span className="text-[#7B5EA7] dark:text-purple-300">Copied!</span>
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

      {/* Google Map Display Container */}
      <div className="relative h-72 sm:h-84 w-full rounded-2xl overflow-hidden shadow-inner border border-white/80 dark:border-white/10 bg-[#E6DAF5]/40 dark:bg-[#1B1530]/60">
        {/* Loading Skeleton */}
        {!mapLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#F3EDFB]/80 dark:bg-[#1B1530]/80 animate-pulse text-[#7B5EA7] gap-2">
            <MapPin size={32} className="text-[#7B5EA7] animate-bounce" />
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

        {/* Quick Full View Link in corner */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-10 bg-white/90 dark:bg-[#161024]/90 hover:bg-[#4B2E83] hover:text-white text-[#1B1530] dark:text-white text-xs font-bold uppercase tracking-[0.08em] px-3.5 py-1.5 rounded-full shadow-md border border-white/80 dark:border-white/10 flex items-center gap-1.5 transition"
        >
          <Maximize2 size={12} />
          <span>Full View ↗</span>
        </a>
      </div>

      {/* Action Navigation Buttons Strip */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {/* 1. Primary Direction CTA */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#7B5EA7] hover:bg-[#4B2E83] text-white text-xs sm:text-sm font-bold uppercase tracking-[0.08em] shadow-[0_10px_25px_rgba(123,94,167,0.3)] hover:-translate-y-0.5 transition duration-300 flex-1 sm:flex-initial"
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
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/70 dark:bg-white/10 hover:bg-[#D9C8F0]/40 text-[#1B1530] dark:text-white text-xs sm:text-sm font-bold uppercase tracking-[0.08em] border border-white/80 dark:border-white/10 shadow-sm transition flex-1 sm:flex-initial cursor-pointer"
        >
          <Compass size={15} className="text-[#7B5EA7]" />
          <span>Open in Google Maps App</span>
          <ExternalLink size={12} className="opacity-60" />
        </a>

        {/* 3. Walking route to college if available */}
        {collegeRouteUrl && property.nearbyCollegeName && (
          <a
            href={collegeRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#D9C8F0]/40 dark:bg-[#7B5EA7]/20 hover:bg-[#D9C8F0]/70 text-[#4B2E83] dark:text-purple-200 text-xs sm:text-sm font-bold border border-[#7B5EA7]/20 transition w-full sm:w-auto"
          >
            <Footprints size={15} className="text-[#7B5EA7] dark:text-purple-300" />
            <span>Walking route to {property.nearbyCollegeName}</span>
            <ExternalLink size={12} className="opacity-60" />
          </a>
        )}
      </div>

    </div>
  );
}
