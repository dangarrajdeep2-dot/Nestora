'use client';

import React, { useState } from 'react';
import { 
  X, 
  Star, 
  CheckCircle2, 
  User, 
  GraduationCap, 
  BookOpen, 
  MessageSquare, 
  ShieldCheck, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { Property, Review } from '@/types';
import { submitReview } from '@/lib/api/properties';

interface ReviewModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: (newReview: Review) => void;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  5: 'Outstanding Stay (5.0) — Highly Recommended',
  4: 'Very Good (4.0) — Comfortable & Clean',
  3: 'Average Stay (3.0) — Decent Amenities',
  2: 'Below Average (2.0) — Needs Improvement',
  1: 'Poor Experience (1.0) — Not Recommended',
};

export function ReviewModal({ property, isOpen, onClose, onReviewSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [comment, setComment] = useState('');
  const [verifiedStay, setVerifiedStay] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!authorName.trim()) errs.name = 'Please enter your name';
    if (!college.trim()) errs.college = 'Please enter your college or institute';
    if (!comment.trim()) {
      errs.comment = 'Please share your experience (food, Wi-Fi, safety, cleanliness, etc.)';
    } else if (comment.trim().length < 10) {
      errs.comment = 'Please write at least 10 characters for a helpful review';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const createdReview = await submitReview({
        propertyId: property.id,
        authorName,
        college,
        course: course || undefined,
        rating,
        comment,
        verifiedStay,
      });

      onReviewSubmitted(createdReview);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Submit review error:', err);
      alert('Unable to submit your review right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStarCount = hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
              <Star size={36} className="fill-amber-400 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold">Review Published!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-slate-900 dark:text-white">{authorName}</span>! Your honest rating helps fellow students discover the best and safest stay.
            </p>
            <div className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 p-3.5 rounded-2xl text-xs font-semibold border border-emerald-500/20 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Visible instantly on this property listing</span>
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-md mb-2 border border-amber-500/20">
                <Sparkles size={14} className="text-amber-500" />
                <span>Student Voice & Ratings</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                Rate {property.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {property.area}, {property.city} • Share genuine feedback with future residents
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Rating Picker */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-2 text-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Select Rating Score *
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled = starValue <= activeStarCount;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-slate-300 dark:text-slate-700 hover:scale-125 transition-transform duration-150 cursor-pointer"
                        aria-label={`Rate ${starValue} stars`}
                      >
                        <Star 
                          size={32} 
                          className={isFilled ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]' : 'currentColor'} 
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 min-h-[1.25rem]">
                  {RATING_DESCRIPTIONS[activeStarCount] || 'Click stars to select rating'}
                </p>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Your Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* College & Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    College / University *
                  </label>
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Saurashtra Univ"
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  {errors.college && <p className="text-rose-500 text-xs mt-1">{errors.college}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    Course / Branch (Optional)
                  </label>
                  <div className="relative">
                    <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech CSE (3rd Yr)"
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Your Experience & Feedback *
                </label>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe room condition, food hygiene, Wi-Fi speed, electricity backup, warden behavior, or gate timings..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 outline-none"
                  />
                </div>
                {errors.comment && <p className="text-rose-500 text-xs mt-1">{errors.comment}</p>}
              </div>

              {/* Verified Stay Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedStay}
                  onChange={(e) => setVerifiedStay(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    I stayed or currently live at this property
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                    Helps tag your review with the &quot;Verified Resident&quot; trust badge.
                  </span>
                </div>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Posting Your Review...</span>
                    </>
                  ) : (
                    <>
                      <Star size={18} className="fill-white" />
                      <span>Submit Student Rating</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
