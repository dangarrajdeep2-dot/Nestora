import { getAdminProperties } from '@/lib/actions/admin';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PropertyListClient } from './PropertyListClient';

export const dynamic = 'force-dynamic';

export default async function AdminPropertiesPage() {
  const properties = await getAdminProperties();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Properties</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage all student accommodations, edit details, or toggle publish status.
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Add Property</span>
        </Link>
      </div>

      <div className="glass-card rounded-2xl border border-slate-200/60 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <PropertyListClient initialProperties={properties} />
      </div>
    </div>
  );
}
