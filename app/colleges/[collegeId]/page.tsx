import { redirect } from 'next/navigation';
import { getColleges } from '@/lib/api/properties';

export default async function CollegePage({ 
  params 
}: { 
  params: Promise<{ collegeId: string }> | { collegeId: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const collegeId = resolvedParams.collegeId;

  // Look up college in Supabase
  let foundCollege = null;
  try {
    const colleges = await getColleges();
    foundCollege = colleges.find(
      (c) =>
        c.id === collegeId ||
        c.id.includes(collegeId) ||
        collegeId.includes(c.id) ||
        c.name.toLowerCase() === decodeURIComponent(collegeId).toLowerCase()
    );
  } catch (err) {
    console.warn('Failed to fetch college list from Supabase:', err);
  }

  if (foundCollege) {
    redirect(
      `/search?q=${encodeURIComponent(foundCollege.name)}&lat=${foundCollege.latitude}&lng=${foundCollege.longitude}`
    );
  }

  // Fallback to search by ID or name
  redirect(`/search?q=${encodeURIComponent(collegeId)}`);
}
