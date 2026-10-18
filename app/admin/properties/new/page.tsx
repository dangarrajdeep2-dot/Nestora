import { getAdminColleges } from '@/lib/actions/admin';
import PropertyForm from '../PropertyForm';

export const dynamic = 'force-dynamic';

export default async function NewPropertyPage() {
  const colleges = await getAdminColleges();

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-6 w-full min-w-0">
      <PropertyForm colleges={colleges} mode="create" />
    </div>
  );
}
