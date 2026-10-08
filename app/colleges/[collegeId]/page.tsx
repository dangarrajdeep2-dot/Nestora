import { redirect } from 'next/navigation';
import { MOCK_COLLEGES } from '@/lib/api/mockData';

export default async function CollegePage({ 
  params 
}: { 
  params: Promise<{ collegeId: string }> | { collegeId: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const collegeId = resolvedParams.collegeId;

  // Look up college
  const foundCollege = MOCK_COLLEGES.find(
    (c) => c.id === collegeId || c.id.includes(collegeId) || collegeId.includes(c.id)
  );

  if (foundCollege) {
    redirect(
      `/search?q=${encodeURIComponent(foundCollege.name)}&lat=${foundCollege.latitude}&lng=${foundCollege.longitude}`
    );
  }

  // Fallback to search by ID
  redirect(`/search?q=${encodeURIComponent(collegeId)}`);
}
