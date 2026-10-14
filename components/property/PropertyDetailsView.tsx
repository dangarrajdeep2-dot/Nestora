'use client';

import React, { useState } from 'react';
import { SafeImage } from '@/components/ui/SafeImage';
import Link from 'next/link';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Navigation, 
  Heart, 
  Phone, 
  MessageCircle, 
  Send, 
  Check, 
  Utensils, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bed, 
  Sparkles,
  Share2,
  Calendar,
  CheckCircle2,
  Lock,
  ThumbsUp
} from 'lucide-react';
import { Property, Review } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useSavedProperties } from '@/lib/utils/favorites';
import { EnquiryModal } from './EnquiryModal';
import { ReviewModal } from './ReviewModal';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/listings/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Loading map...</div>,
});

export function PropertyDetailsView({ property }: { property: Property }) {
  const { isSaved, toggle } = useSavedProperties();
  const saved = isSaved(property.id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRoomForEnquiry, setSelectedRoomForEnquiry] = useState<string | undefined>();
  const [isCopied, setIsCopied] = useState(false);

  const [reviews, setReviews] = useState<Review[]>(property.reviews || []);
  const [avgRating, setAvgRating] = useState<number>(property.rating);
  const [reviewCount, setReviewCount] = useState<number>(property.reviewCount);
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

  const handleReviewSubmitted = (newReview: Review) => {
    const updated = [newReview, ...reviews];
    setReviews(updated);
    const newAvg = updated.reduce((sum, r) => sum + r.rating, 0) / updated.length;
    setAvgRating(Number(newAvg.toFixed(1)));
    setReviewCount(updated.length);
  };

  const handleToggleHelpful = (reviewId: string, initialCount = 0) => {
    if (votedHelpful[reviewId]) return;
    setVotedHelpful((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] ?? initialCount) + 1,
    }));
  };

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'];

  const encodedWhatsAppMsg = encodeURIComponent(
    `Hello ${property.owner.name}, I am a student interested in your stay "${property.title}" in ${property.area}, ${property.city} (Listed on Nestora). Is a bed currently available?`
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out ${property.title} in ${property.area}, ${property.city} on Nestora`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-28 sm:pb-20 transition-colors">
      
      {/* Top Glassy Breadcrumb & Share Header */}
      <div className="bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/80 py-3 px-4 sm:px-6 sticky top-0 z-20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <ChevronLeft size={18} />
            <span>Back to Stays</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Share listing"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">{isCopied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => toggle(property.id)}
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                saved 
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400' 
                  : 'glass-card border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Heart size={16} className={saved ? 'fill-rose-500 text-rose-500' : ''} />
              <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Main Grid: Gallery & Details on Left, Sticky Contact on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Image Gallery */}
            <div className="space-y-3">
              <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-md">
                <SafeImage
                  src={images[activeImageIndex]}
                  alt={property.title}
                  fill
                  priority
                  className="object-cover transition-all duration-300"
                />

                {/* Overlays */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md ${
                    property.gender === 'girls' ? 'bg-rose-500 text-white' : property.gender === 'boys' ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
                  }`}>
                    {property.gender === 'girls' ? 'Girls Only' : property.gender === 'boys' ? 'Boys Only' : 'Co-ed'}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/75 text-white backdrop-blur-md shadow-md">
                    {property.type}
                  </span>
                </div>

                {property.verified && (
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-sm">
                    <ShieldCheck size={15} />
                    <span>✓ Verified Nestora Stay</span>
                  </div>
                )}

                {/* Left/Right Gallery Nav Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-white flex items-center justify-center shadow-lg transition cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-white flex items-center justify-center shadow-lg transition cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        activeImageIndex === idx ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <SafeImage src={img} alt="Thumbnail" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Property Main Info Header (Glassy Card) */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
                    {property.title}
                  </h1>
                  {property.tagline && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {property.tagline}
                    </p>
                  )}
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(property.startingRent)}
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium"> /month</span>
                  </div>
                  {property.deposit > 0 && (
                    <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block font-medium mt-1 border border-amber-500/20">
                      Security Deposit: {formatCurrency(property.deposit)}
                    </div>
                  )}
                </div>
              </div>

              {/* Address and Distance */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-start text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <MapPin size={16} className="text-emerald-500 mr-2 shrink-0 mt-0.5" />
                  <span>{property.address}</span>
                </div>

                {property.distanceKm !== undefined && (
                  <div className="flex items-center text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 w-fit px-3 py-1 rounded-full">
                    <Navigation size={13} className="mr-1.5 shrink-0" />
                    <span>{property.distanceKm.toFixed(1)} km from searched location</span>
                    {property.nearbyCollegeName && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-normal ml-1">
                        • Near {property.nearbyCollegeName}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Rating and Availability Highlights */}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex-wrap">
                <button
                  type="button"
                  onClick={() => document.getElementById('student-reviews')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold px-2 py-1 rounded-lg text-sm border border-amber-500/20">
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                    <span>{avgRating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ({reviewCount} Student {reviewCount === 1 ? 'Review' : 'Reviews'})
                  </span>
                </button>

                {property.isAvailableNow && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <Sparkles size={13} />
                    <span>Available for Immediate Move-in</span>
                  </div>
                )}

                {property.isFurnished && (
                  <div className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                    Fully Furnished
                  </div>
                )}
              </div>
            </div>

            {/* 3. Available Room Types Matrix */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Available Room Types & Pricing
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pick your preferred occupancy configuration
                  </p>
                </div>
                <Bed size={22} className="text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {property.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-white/60 dark:bg-slate-900/60 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {room.roomType}
                        </h4>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          {room.availableBeds} beds left
                        </span>
                      </div>

                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mb-2">
                        {formatCurrency(room.rent)}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> /month</span>
                      </div>

                      <ul className="space-y-1 mb-3">
                        {room.features.map((feat, i) => (
                          <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <Check size={12} className="text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoomForEnquiry(room.roomType);
                        setIsEnquiryModalOpen(true);
                      }}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition text-center cursor-pointer border border-emerald-500/20 hover:border-transparent"
                    >
                      Enquire for this room
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Amenities */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Amenities & Facilities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Food & Mess Details */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2">
                <Utensils size={20} className="text-emerald-500" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Food & Mess Details
                </h2>
              </div>

              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-500/20">
                    Dietary: {property.foodDetails.type}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {property.foodDetails.included ? '✓ Meals included in rent' : 'Meals optional / self-cooking'}
                  </span>
                </div>

                {property.foodDetails.meals.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {property.foodDetails.meals.map((meal) => (
                      <span key={meal} className="text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                        {meal}
                      </span>
                    ))}
                  </div>
                )}

                {property.foodDetails.description && (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                    {property.foodDetails.description}
                  </p>
                )}

                {property.foodDetails.timing && (
                  <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 gap-1.5 pt-1">
                    <Clock size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{property.foodDetails.timing}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 6. House Rules & Safety */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                House Rules & Policies
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {property.gateClosingTime && (
                  <div className="p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5">
                    <Clock size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Gate Curfew Time</div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400">{property.gateClosingTime}</div>
                    </div>
                  </div>
                )}

                {property.noticePeriodDays && (
                  <div className="p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5">
                    <Calendar size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Notice Period</div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400">{property.noticePeriodDays} Days</div>
                    </div>
                  </div>
                )}
              </div>

              <ul className="space-y-2 pt-2">
                {property.houseRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start text-xs sm:text-sm text-slate-700 dark:text-slate-300 gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 7. Location & Map */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Location on Map
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {property.address}
              </p>
              <div className="h-72 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800">
                <PropertyMap
                  properties={[property]}
                  searchedLocation={{
                    name: property.title,
                    latitude: property.latitude,
                    longitude: property.longitude,
                  }}
                />
              </div>
            </div>

            {/* 8. Student Reviews & Ratings */}
            <div id="student-reviews" className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/60 dark:border-slate-800/80 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Student Ratings & Reviews
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Authentic feedback from verified student residents
                  </p>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-sm border border-amber-500/20">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span>{avgRating.toFixed(1)} / 5</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                      ({reviews.length})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition cursor-pointer active:scale-95"
                  >
                    <Star size={14} className="fill-white" />
                    <span>Rate this Stay</span>
                  </button>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                    <Star size={24} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Student Reviews Yet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      Have you lived here or visited this property? Be the first student to rate the food, safety, and amenities!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Star size={14} className="fill-white" />
                    <span>Write First Review</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {reviews.map((rev) => {
                    const helpfulCount = (helpfulCounts[rev.id] ?? rev.helpfulCount ?? 0);
                    const isVoted = votedHelpful[rev.id];

                    return (
                      <div 
                        key={rev.id} 
                        className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3 transition hover:border-slate-300 dark:hover:border-slate-700"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                              {rev.authorName ? rev.authorName[0].toUpperCase() : 'S'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                  {rev.authorName}
                                </span>
                                {rev.verifiedStay && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                    <CheckCircle2 size={11} /> Verified Stay
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {rev.course ? `${rev.course} • ` : ''}{rev.college}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                  key={s} 
                                  size={13} 
                                  className={s <= Math.round(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'} 
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-slate-400 ml-1">{rev.date}</span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                          &quot;{rev.comment}&quot;
                        </p>

                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleToggleHelpful(rev.id, rev.helpfulCount || 0)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                              isVoted
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <ThumbsUp size={12} className={isVoted ? 'fill-emerald-500' : ''} />
                            <span>Helpful {helpfulCount > 0 ? `(${helpfulCount})` : ''}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Sticky Contact Card (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 glass-card rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/80 shadow-2xl space-y-6">
              
              {/* Owner Info Box */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-lg shrink-0 border border-emerald-500/20">
                  {property.owner.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{property.owner.name}</h4>
                    {property.owner.isVerified && (
                      <ShieldCheck size={14} className="text-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{property.owner.role}</p>
                  {property.owner.responseRate && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{property.owner.responseRate}</p>
                  )}
                </div>
              </div>

              {/* Rent summary */}
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Starting from</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(property.startingRent)}
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal"> /month</span>
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">Zero brokerage fee • Direct owner connect</div>
              </div>

              {/* Action Buttons in Emerald Theme */}
              <div className="space-y-3">
                {/* Send Enquiry Button */}
                <button
                  onClick={() => setIsEnquiryModalOpen(true)}
                  className="btn-3d w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Send size={16} />
                  <span>Send Free Enquiry</span>
                </button>

                {/* WhatsApp Button */}
                {property.owner.whatsapp && (
                  <a
                    href={`https://wa.me/91${property.owner.whatsapp}?text=${encodedWhatsAppMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-3d w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle size={17} />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}

                {/* Call Owner Button */}
                {property.owner.phone && (
                  <a
                    href={`tel:+91${property.owner.phone}`}
                    className="btn-3d w-full py-3 px-4 glass-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition border border-slate-200 dark:border-slate-800"
                  >
                    <Phone size={16} />
                    <span>Call Owner (+91 {property.owner.phone})</span>
                  </a>
                )}
              </div>

              {/* Safety guarantee */}
              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Lock size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Nestora Student Safety Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Never pay rent or advance deposit before visiting the property in person.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Floating Bottom Bar for Mobile Devices */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 p-3 shadow-2xl z-30 transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight">
              {formatCurrency(property.startingRent)}
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal"> /mo</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Zero Brokerage</div>
          </div>

          <div className="flex items-center gap-2">
            {property.owner.whatsapp && (
              <a
                href={`https://wa.me/91${property.owner.whatsapp}?text=${encodedWhatsAppMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow"
                aria-label="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            )}

            {property.owner.phone && (
              <a
                href={`tel:+91${property.owner.phone}`}
                className="p-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow"
                aria-label="Call"
              >
                <Phone size={18} />
              </a>
            )}

            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>Enquire</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enquiry Modal Dialog */}
      <EnquiryModal
        property={property}
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        selectedRoomType={selectedRoomForEnquiry}
      />

      {/* Student Review & Rating Modal */}
      <ReviewModal
        property={property}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />

    </div>
  );
}
