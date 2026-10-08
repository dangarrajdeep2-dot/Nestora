import React from 'react';
import { notFound } from 'next/navigation';
import { getPropertyById } from '@/lib/api/properties';
import { PropertyDetailsView } from '@/components/property/PropertyDetailsView';
import { PropertyUnavailableState } from '@/components/ui/States';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const property = await getPropertyById(resolvedParams.id);

  if (!property) {
    return {
      title: 'Stay Not Found — Nestora',
    };
  }

  return {
    title: `${property.title} in ${property.area}, ${property.city} — Nestora`,
    description: `${property.type} for ${property.gender}. Rent starts at ₹${property.startingRent.toLocaleString()}/mo with food, Wi-Fi and verified student amenities.`,
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const property = await getPropertyById(resolvedParams.id);

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <PropertyUnavailableState />
      </div>
    );
  }

  return <PropertyDetailsView property={property} />;
}
