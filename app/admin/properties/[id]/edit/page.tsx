import { getAdminPropertyById, getAdminColleges } from '@/lib/actions/admin';
import { redirect } from 'next/navigation';
import PropertyForm from '../../PropertyForm';

export const dynamic = 'force-dynamic';

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const property = await getAdminPropertyById(resolvedParams.id);

  if (!property) {
    redirect('/admin/properties');
  }

  const colleges = await getAdminColleges();

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
      <PropertyForm
        initialProperty={property}
        colleges={colleges}
        mode="edit"
      />
    </div>
  );
}
