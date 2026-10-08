import { redirect } from 'next/navigation';

export default async function ListingPage({ 
  params 
}: { 
  params: Promise<{ listingId: string }> | { listingId: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  redirect(`/property/${resolvedParams.listingId}`);
}
