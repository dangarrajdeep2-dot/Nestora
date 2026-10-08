'use client';

import React from 'react';
import { Property } from '@/types';
import { PropertyCard } from './PropertyCard';

interface HostelCardProps {
  listing: any;
  distance?: number;
}

export function HostelCard({ listing, distance }: HostelCardProps) {
  // Normalize if coming from legacy schema
  const normalized: Property = {
    ...listing,
    startingRent: listing.startingRent || listing.rent || 6000,
    deposit: listing.deposit || 0,
    images: listing.images || (listing.listing_images?.map((img: any) => img.image_url) || [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    ]),
    area: listing.area || listing.address?.split(',')[0] || 'Campus Area',
    city: listing.city || 'Rajkot',
    rating: listing.rating || 4.7,
    reviewCount: listing.reviewCount || 24,
    distanceKm: distance ?? listing.distanceKm,
    rooms: listing.rooms || [],
    foodDetails: listing.foodDetails || {
      included: true,
      type: 'Pure Veg',
      meals: ['Breakfast', 'Dinner'],
    },
    houseRules: listing.houseRules || ['Gate closes at 10:30 PM'],
    owner: listing.owner || {
      id: 'owner-default',
      name: 'Property Manager',
      role: 'Owner',
      phone: listing.phone || '9876543210',
      whatsapp: listing.whatsapp || '9876543210',
      isVerified: true,
    },
    isFurnished: listing.isFurnished ?? true,
    isAvailableNow: listing.isAvailableNow ?? true,
    createdAt: listing.created_at || '2026-08-01',
  };

  return <PropertyCard property={normalized} />;
}
