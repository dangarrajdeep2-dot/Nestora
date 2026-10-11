import { getAdminColleges } from '@/lib/actions/admin';
import PropertyForm from '../PropertyForm';

export const dynamic = 'force-dynamic';

export default async function NewPropertyPage() {
  const colleges = await getAdminColleges();

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
      <PropertyForm colleges={colleges} mode="create" />
    </div>
  );
}
