'use client';

import React from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Navigation, 
  Heart, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Property } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useSavedProperties } from '@/lib/utils/favorites';

interface PropertyCardProps {
  property: Property;
  viewMode?: 'grid' | 'list';
}

export function PropertyCard({ property, viewMode = 'grid' }: PropertyCardProps) {
  const { isSaved, toggle } = useSavedProperties();
  const saved = isSaved(property.id);

  const mainImage = property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';
  
  // Format top amenities
  const keyAmenities = property.amenities.slice(0, 3).join(' • ');

  // Identify lowest sharing type available
  const availableSharing = property.rooms?.[0]?.sharing 
    ? property.rooms[0].sharing.replace('-', ' ').replace('plus', '+')
    : 'Multiple Sharing';

  const cardContent = (
    <div 
      className={`group glass-card hover:border-emerald-500/50 dark:hover:border-emerald-500/60 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col overflow-hidden relative h-full ${
        viewMode === 'list' ? 'sm:flex-row' : ''
      }`}
    >
      {/* Property Image & Overlays */}
      <div 
        className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${
          viewMode === 'list' ? 'sm:w-72 h-56 sm:h-auto shrink-0' : 'h-52 w-full'
        }`}
      >
        <SafeImage
          src={mainImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient backdrop for top controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
            {/* Gender Badge */}
            <span 
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm capitalize backdrop-blur-md ${
                property.gender === 'girls'
                  ? 'bg-rose-500/95 text-white'
                  : property.gender === 'boys'
                  ? 'bg-emerald-600/95 text-white'
                  : 'bg-purple-600/95 text-white'
              }`}
            >
              {property.gender === 'girls' ? 'Girls Only' : property.gender === 'boys' ? 'Boys Only' : 'Co-ed'}
            </span>

            {/* Property Type Badge */}
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-sm">
              {property.type}
            </span>
          </div>

          {/* Interactive Favorite / Save Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(property.id);
            }}
            aria-label={saved ? 'Remove from saved' : 'Save property'}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 flex items-center justify-center transition-all shadow-md pointer-events-auto active:scale-90"
          >
            <Heart
              size={17}
              className={saved ? 'fill-rose-500 text-rose-500 stroke-rose-500' : ''}
            />
          </button>
        </div>

        {/* Verified Badge Overlay at bottom of image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
          {property.verified && (
            <span className="inline-flex items-center gap-1 bg-emerald-600/95 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-sm backdrop-blur-sm">
              <ShieldCheck size={13} className="shrink-0" />
              Verified
            </span>
          )}

          {property.isAvailableNow && (
            <span className="inline-flex items-center gap-1 bg-teal-500/95 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md shadow-sm backdrop-blur-sm">
              <Sparkles size={11} />
              Available Now
            </span>
          )}
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Distance Line */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded text-xs border border-amber-500/20">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span>{property.rating.toFixed(1)}</span>
              </div>
              <span className="text-slate-400 dark:text-slate-500">({property.reviewCount})</span>
            </div>

            {property.distanceKm !== undefined && (
              <span className="flex items-center font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-500/20">
                <Navigation size={11} className="mr-1 text-emerald-600 dark:text-emerald-400" />
                {property.distanceKm.toFixed(1)} km away
              </span>
            )}
          </div>

          {/* Property Name */}
          <Link href={`/property/${property.id}`} className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg line-clamp-1 mb-1">
              {property.title}
            </h3>
          </Link>

          {/* Area / Locality */}
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm flex items-center mb-3 line-clamp-1">
            <MapPin size={13} className="mr-1 text-emerald-500 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{property.area}</span>
            <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>
            <span>{property.city}</span>
          </p>

          {/* Amenities & Sharing Pills */}
          <div className="space-y-1.5 mb-4">
            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
              {keyAmenities}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
              Sharing: <span className="text-slate-700 dark:text-slate-200 font-semibold capitalize">{availableSharing}</span>
            </div>
          </div>
        </div>

        {/* Price & Action CTA */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(property.startingRent)}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-normal">/month</span>
            </div>
            {property.deposit > 0 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block -mt-0.5">
                Dep: {formatCurrency(property.deposit)}
              </span>
            )}
          </div>

          <Link
            href={`/property/${property.id}`}
            className="btn-3d inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all duration-200 shadow-sm hover:shadow"
          >
            <span>View details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );

  return cardContent;
}
