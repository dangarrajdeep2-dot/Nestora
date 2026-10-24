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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B1530]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-card bg-white/95 dark:bg-[#161024]/95 backdrop-blur-2xl rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-[0_20px_50px_rgba(123,94,167,0.25)] relative max-h-[90vh] overflow-y-auto border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6B6580] hover:text-[#1B1530] dark:text-purple-200/70 dark:hover:text-white bg-white/70 dark:bg-white/10 p-2 rounded-full transition cursor-pointer border border-white/80 dark:border-white/10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#D9C8F0]/60 text-[#7B5EA7] dark:bg-[#7B5EA7]/20 dark:text-purple-300 rounded-full flex items-center justify-center mx-auto border border-[#7B5EA7]/20 shadow-sm">
              <Star size={36} className="fill-amber-400 text-amber-400" />
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight">Review Published!</h3>
            <p className="text-sm text-[#6B6580] dark:text-purple-200/70 max-w-sm mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-[#1B1530] dark:text-white">{authorName}</span>! Your honest rating helps fellow students discover the best and safest stay.
            </p>
            <div className="bg-[#D9C8F0]/40 text-[#4B2E83] dark:bg-[#7B5EA7]/20 dark:text-purple-200 p-3.5 rounded-full text-xs font-bold uppercase tracking-[0.06em] border border-[#7B5EA7]/20 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-[#7B5EA7]" />
              <span>Visible instantly on this property listing</span>
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 bg-[#7B5EA7] hover:bg-[#4B2E83] text-white rounded-full font-bold text-xs uppercase tracking-[0.08em] shadow-md transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 bg-[#D9C8F0]/50 text-[#4B2E83] dark:bg-[#7B5EA7]/20 dark:text-purple-200 text-xs font-bold uppercase tracking-[0.08em] px-3 py-1 rounded-full mb-2 border border-[#7B5EA7]/20">
                <Sparkles size={14} className="text-[#7B5EA7]" />
                <span>Student Voice & Ratings</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight">
                Rate {property.title}
              </h3>
              <p className="text-xs text-[#6B6580] dark:text-purple-200/70 mt-1">
                {property.area}, {property.city} • Share genuine feedback with future residents
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Rating Picker */}
              <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#1B1530]/40 border border-white/80 dark:border-white/10 space-y-2 text-center">
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/80">
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
                <p className="text-xs font-semibold text-[#7B5EA7] dark:text-purple-300 min-h-[1.25rem]">
                  {RATING_DESCRIPTIONS[activeStarCount] || 'Click stars to select rating'}
                </p>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">
                  Your Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B5EA7]" />
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/30 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] focus:ring-2 focus:ring-[#7B5EA7]/25 outline-none transition"
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* College & Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">
                    College / University *
                  </label>
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B5EA7]" />
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Saurashtra Univ"
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/30 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] outline-none transition"
                    />
                  </div>
                  {errors.college && <p className="text-rose-500 text-xs mt-1">{errors.college}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">
                    Course / Branch (Optional)
                  </label>
                  <div className="relative">
                    <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B5EA7]" />
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech CSE (3rd Yr)"
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/30 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">
                  Your Experience & Feedback *
                </label>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3.5 top-3 text-[#7B5EA7]" />
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe room condition, food hygiene, Wi-Fi speed, electricity backup, warden behavior, or gate timings..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/30 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] outline-none transition"
                  />
                </div>
                {errors.comment && <p className="text-rose-500 text-xs mt-1">{errors.comment}</p>}
              </div>

              {/* Verified Stay Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/60 dark:bg-[#1B1530]/40 border border-white/80 dark:border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedStay}
                  onChange={(e) => setVerifiedStay(e.target.checked)}
                  className="mt-0.5 rounded text-[#7B5EA7] focus:ring-[#7B5EA7] accent-[#7B5EA7] cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#1B1530] dark:text-white flex items-center gap-1">
                    <ShieldCheck size={13} className="text-[#7B5EA7]" />
                    I stayed or currently live at this property
                  </span>
                  <span className="text-[#6B6580] dark:text-purple-200/70 block mt-0.5">
                    Helps tag your review with the &quot;Verified Resident&quot; trust badge.
                  </span>
                </div>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-[#7B5EA7] hover:bg-[#4B2E83] text-white font-bold text-xs uppercase tracking-[0.08em] rounded-full flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(123,94,167,0.3)] transition duration-300 hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Posting Your Review...</span>
                    </>
                  ) : (
                    <>
                      <Star size={16} className="fill-white" />
                      <span>Submit Student Rating</span>
                      <span>→</span>
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
