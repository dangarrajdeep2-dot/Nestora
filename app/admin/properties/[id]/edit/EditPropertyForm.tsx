'use client';

import PropertyForm from '../../PropertyForm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EditPropertyForm({ property }: { property: Record<string, any> }) {
  return <PropertyForm initialProperty={property} mode="edit" />;
}
