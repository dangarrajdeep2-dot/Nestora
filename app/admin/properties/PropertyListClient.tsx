'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updatePropertyStatus, deleteProperty } from '@/lib/actions/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PropertyListClient({ initialProperties }: { initialProperties: Record<string, any>[] }) {
  const [properties, setProperties] = useState(initialProperties);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    try {
      setLoadingId(id);
      const newStatus = currentStatus === 'verified' ? 'unverified' : 'verified';
      await updatePropertyStatus(id, newStatus);
      setProperties(properties.map(p => p.id === id ? { ...p, verification: newStatus } : p));
    } catch {
      alert('Failed to update status');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this property? Archiving (unpublishing) is recommended instead to preserve historical data.')) {
      return;
    }
    
    try {
      setLoadingId(id);
      await deleteProperty(id);
      setProperties(properties.filter(p => p.id !== id));
    } catch {
      alert('Failed to delete property. Check if there are constraints.');
    } finally {
      setLoadingId(null);
    }
  };

  if (properties.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No properties found.
      </div>
    );
  }

  const formatGender = (g: string) => {
    if (g === 'girls') return 'Girls';
    if (g === 'boys') return 'Boys';
    return 'Boys & Girls';
  };

  return (
    <div>
      {/* Mobile Card Layout (< md) */}
      <div className="md:hidden divide-y divide-slate-200/60 dark:divide-slate-800/60">
        {properties.map((p) => (
          <div key={p.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm break-words leading-snug">
                  {p.title}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="font-medium">{p.type}</span> • <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatGender(p.gender)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  ₹{p.starting_rent}
                </span>
                <span className="text-[10px] text-slate-400 block">/month</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 break-words flex items-center gap-1.5">
              <span>📍 {p.area}, {p.city}</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
              <button
                type="button"
                onClick={() => handleStatusChange(p.id, p.verification)}
                disabled={loadingId === p.id}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  p.verification === 'verified'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    : p.verification === 'demo'
                    ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30 hover:bg-teal-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                {loadingId === p.id ? 'Updating...' : p.verification === 'verified' ? 'Published' : p.verification === 'demo' ? 'Demo' : 'Archived'}
              </button>

              <div className="flex items-center gap-3 text-xs">
                {p.verification === 'verified' && (
                  <Link
                    href={`/property/${p.id}`}
                    target="_blank"
                    className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition px-1 py-0.5"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/admin/properties/${p.id}/edit`}
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold transition px-1 py-0.5"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  disabled={loadingId === p.id}
                  className="text-rose-500 hover:text-rose-700 font-semibold disabled:opacity-50 transition cursor-pointer px-1 py-0.5"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/75 dark:bg-slate-900/75 border-b border-slate-200/80 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3.5 font-bold">Property</th>
              <th className="px-6 py-3.5 font-bold">Location</th>
              <th className="px-6 py-3.5 font-bold">Rent</th>
              <th className="px-6 py-3.5 font-bold">Status</th>
              <th className="px-6 py-3.5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {properties.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 dark:text-white">{p.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.type} • {formatGender(p.gender)}</div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs">
                  {p.area}, {p.city}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                  ₹{p.starting_rent}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleStatusChange(p.id, p.verification)}
                    disabled={loadingId === p.id}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      p.verification === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                        : p.verification === 'demo'
                        ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30 hover:bg-teal-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                    }`}
                  >
                    {loadingId === p.id ? 'Updating...' : p.verification === 'verified' ? 'Published' : p.verification === 'demo' ? 'Demo' : 'Archived'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right space-x-3 text-xs">
                  {p.verification === 'verified' && (
                    <Link
                      href={`/property/${p.id}`}
                      target="_blank"
                      className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition"
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/admin/properties/${p.id}/edit`}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={loadingId === p.id}
                    className="text-rose-500 hover:text-rose-700 font-semibold disabled:opacity-50 transition cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
