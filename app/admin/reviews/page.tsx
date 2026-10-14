import { getAdminReviews } from '@/lib/actions/admin';
import { ReviewsClient } from './ReviewsClient';
import { Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Ratings & Reviews
            </h1>
            <div className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>Student Moderation</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor student ratings, verify genuine stays, and moderate property feedback.
          </p>
        </div>
      </div>

      <ReviewsClient initialReviews={reviews} />
    </div>
  );
}
