'use client';

import React, { useState, useEffect } from 'react';
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
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/lib/supabase/client';
import { ReviewModal } from './ReviewModal';
import { GoogleMapLocation } from './GoogleMapLocation';

function cleanWhatsAppNumber(whatsapp?: string, phone?: string): string {
  const raw = whatsapp || phone || '';
  if (!raw || raw === 'N/A' || raw === 'null' || raw === 'undefined') return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length > 10 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function cleanCallablePhone(phone?: string, whatsapp?: string): string {
  const raw = phone || whatsapp || '';
  if (!raw || raw === 'N/A' || raw === 'null' || raw === 'undefined') return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length > 10 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  return `+91${digits.slice(-10)}`;
}

function formatDisplayPhone(phone?: string, whatsapp?: string): string {
  const cleaned = cleanCallablePhone(phone, whatsapp);
  if (!cleaned) return '';
  const digits = cleaned.replace(/\D/g, '').slice(-10);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return cleaned;
}

export function PropertyDetailsView({ property }: { property: Property }) {
  const { isSaved, toggle } = useSavedProperties();
  const saved = isSaved(property.id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [studentProfile, setStudentProfile] = useState<{ name: string; college: string } | null>(null);
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

  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;

        let authed = Boolean(user);
        if (user) {
          const { data: adminRecord } = await supabase
            .from('admin_users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          if (!isMounted) return;
          if (adminRecord) {
            authed = false;
          } else {
            const { data: profile } = await supabase
              .from('users')
              .select('name, college')
              .eq('id', user.id)
              .maybeSingle();

            if (profile && isMounted) {
              setStudentProfile({
                name: profile.name || '',
                college: profile.college || '',
              });
            }
          }
        }

        setIsAuthenticated(authed);

        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (params.get('enquire') === 'true') {
            if (authed) {
              setIsEnquiryModalOpen(true);
            } else {
              setIsAuthModalOpen(true);
            }
          }
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      }
    };

    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        if (isMounted) {
          setIsAuthenticated(false);
          setStudentProfile(null);
        }
      } else {
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (isMounted) {
          setIsAuthenticated(!adminRecord);
          if (!adminRecord) {
            const { data: profile } = await supabase
              .from('users')
              .select('name, college')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profile && isMounted) {
              setStudentProfile({
                name: profile.name || '',
                college: profile.college || '',
              });
            }
          }
        }
      }
    });

    const handleAuthChange = () => {
      if (isMounted) {
        checkAuthStatus();
      }
    };

    window.addEventListener('nestora_auth_changed', handleAuthChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('nestora_auth_changed', handleAuthChange);
    };
  }, []);

  const handleOpenEnquiry = (roomType?: string) => {
    if (roomType) {
      setSelectedRoomForEnquiry(roomType);
    }
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setIsEnquiryModalOpen(true);
    }
  };

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'];

  const ownerWhatsApp = cleanWhatsAppNumber(property.owner.whatsapp, property.owner.phone);
  const callPhoneNumber = cleanCallablePhone(property.owner.phone, property.owner.whatsapp);
  const displayPhone = formatDisplayPhone(property.owner.phone, property.owner.whatsapp);

  const handleCallOwner = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!callPhoneNumber) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(callPhoneNumber).catch(() => {});
    }
    window.location.href = `tel:${callPhoneNumber}`;
  };

  const studentGreeting = studentProfile?.name
    ? `Hello ${property.owner.name}, my name is ${studentProfile.name}${studentProfile.college ? ` (Student at ${studentProfile.college})` : ''}. I am interested in your stay "${property.title}" in ${property.area}, ${property.city} (Listed on Nestora). Is a bed currently available?`
    : `Hello ${property.owner.name}, I am a student interested in your stay "${property.title}" in ${property.area}, ${property.city} (Listed on Nestora). Is a bed currently available?`;

  const encodedWhatsAppMsg = encodeURIComponent(studentGreeting);

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
    <div className="min-h-screen pb-28 sm:pb-20 transition-colors">
      
      {/* Top Glassy Breadcrumb & Share Header */}
      <div className="bg-white/70 dark:bg-[#161024]/75 border-b border-white/80 dark:border-white/10 py-3.5 px-4 sm:px-6 sticky top-0 z-20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/70 hover:text-[#7B5EA7] dark:hover:text-purple-300 transition"
          >
            <ChevronLeft size={16} />
            <span>Back to Stays</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-full text-[#1B1530] dark:text-purple-200 bg-white/70 dark:bg-white/5 hover:bg-[#D9C8F0]/40 border border-white/80 dark:border-white/10 shadow-sm transition flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] cursor-pointer"
              title="Share listing"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">{isCopied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={() => toggle(property.id)}
              className={`px-3.5 py-1.5 rounded-full border transition flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] cursor-pointer shadow-sm ${
                saved 
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400' 
                  : 'bg-white/70 dark:bg-white/5 border-white/80 dark:border-white/10 text-[#1B1530] dark:text-purple-200 hover:bg-[#D9C8F0]/40'
              }`}
            >
              <Heart size={14} className={saved ? 'fill-rose-500 text-rose-500' : ''} />
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
              <div className="relative h-72 sm:h-96 w-full rounded-[24px] overflow-hidden bg-[#E6DAF5]/50 shadow-[0_10px_30px_rgba(123,94,167,0.15)] border border-white/80 dark:border-white/10">
                <SafeImage
                  src={images[activeImageIndex]}
                  alt={property.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 750px"
                  priority
                  className="object-cover transition-all duration-300"
                />

                {/* Overlays */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`text-xs font-bold uppercase tracking-[0.08em] px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md ${
                    property.gender === 'girls' ? 'bg-rose-500 text-white' : property.gender === 'boys' ? 'bg-[#4B2E83] text-white' : 'bg-[#7B5EA7] text-white'
                  }`}>
                    {property.gender === 'girls' ? 'Girls Only' : property.gender === 'boys' ? 'Boys Only' : 'Boys & Girls'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.08em] px-3.5 py-1.5 rounded-full bg-[#1B1530]/80 text-white backdrop-blur-md shadow-md">
                    {property.type}
                  </span>
                </div>

                {property.verified && (
                  <div className="absolute top-4 right-4 bg-[#7B5EA7] text-white text-xs font-bold uppercase tracking-[0.08em] px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-sm">
                    <ShieldCheck size={14} />
                    <span>✓ Verified Nestora Stay</span>
                  </div>
                )}

                {/* Left/Right Gallery Nav Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-[#161024]/90 hover:bg-[#4B2E83] hover:text-white text-[#1B1530] flex items-center justify-center shadow-lg transition cursor-pointer border border-white/80 dark:border-white/10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-[#161024]/90 hover:bg-[#4B2E83] hover:text-white text-[#1B1530] flex items-center justify-center shadow-lg transition cursor-pointer border border-white/80 dark:border-white/10"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 right-3 bg-[#1B1530]/80 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-[0.08em] backdrop-blur-sm">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-2xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        activeImageIndex === idx ? 'border-[#7B5EA7] ring-2 ring-[#7B5EA7]/30 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <SafeImage src={img} alt="Thumbnail" fill sizes="80px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Property Main Info Header (Glassy Card) */}
            <div className="glass-card rounded-[24px] p-6 sm:p-7 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_rgba(123,94,167,0.12)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="font-heading text-3xl sm:text-4xl text-[#1B1530] dark:text-white uppercase tracking-tight mb-1">
                    {property.title}
                  </h1>
                  {property.tagline && (
                    <p className="text-sm text-[#6B6580] dark:text-purple-200/70 font-medium">
                      {property.tagline}
                    </p>
                  )}
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-2xl sm:text-3xl font-black text-[#7B5EA7] dark:text-purple-300">
                    {formatCurrency(property.startingRent)}
                    <span className="text-xs text-[#6B6580] dark:text-purple-200/70 font-medium"> /month</span>
                  </div>
                  {property.deposit > 0 && (
                    <div className="text-xs text-[#4B2E83] dark:text-purple-200 bg-[#D9C8F0]/40 dark:bg-[#7B5EA7]/20 px-2.5 py-0.5 rounded-full inline-block font-bold uppercase tracking-[0.06em] mt-1 border border-[#7B5EA7]/20">
                      Security Deposit: {formatCurrency(property.deposit)}
                    </div>
                  )}
                </div>
              </div>

              {/* Address and Distance */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#D9C8F0]/40 dark:border-white/10">
                <div className="flex items-start text-xs sm:text-sm text-[#1B1530] dark:text-purple-100">
                  <MapPin size={16} className="text-[#7B5EA7] mr-2 shrink-0 mt-0.5" />
                  <span>{property.address}</span>
                </div>

                {property.distanceKm !== undefined && (
                  <div className="flex items-center text-xs font-bold text-[#4B2E83] dark:text-purple-200 bg-[#D9C8F0]/40 dark:bg-[#7B5EA7]/20 border border-[#7B5EA7]/20 w-fit px-3 py-1 rounded-full">
                    <Navigation size={13} className="mr-1.5 shrink-0 text-[#7B5EA7]" />
                    <span>{property.distanceKm.toFixed(1)} km from searched location</span>
                    {property.nearbyCollegeName && (
                      <span className="text-[#7B5EA7] dark:text-purple-300 font-semibold ml-1">
                        • Near {property.nearbyCollegeName}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Rating and Availability Highlights */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#D9C8F0]/40 dark:border-white/10 flex-wrap">
                <button
                  type="button"
                  onClick={() => document.getElementById('student-reviews')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-1 bg-[#D9C8F0]/50 dark:bg-[#7B5EA7]/20 text-[#4B2E83] dark:text-purple-200 font-bold px-2.5 py-1 rounded-full text-xs border border-[#7B5EA7]/20">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span>{avgRating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-[#6B6580] dark:text-purple-200/70 font-medium">
                    ({reviewCount} Student {reviewCount === 1 ? 'Review' : 'Reviews'})
                  </span>
                </button>

                {property.isAvailableNow && (
                  <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#4B2E83] dark:text-purple-200 bg-[#D9C8F0]/40 dark:bg-[#7B5EA7]/20 px-3 py-1 rounded-full border border-[#7B5EA7]/20">
                    <Sparkles size={12} className="text-[#7B5EA7]" />
                    <span>Available for Immediate Move-in</span>
                  </div>
                )}

                {property.isFurnished && (
                  <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#4B2E83] dark:text-purple-200 bg-[#D9C8F0]/40 dark:bg-[#7B5EA7]/20 px-3 py-1 rounded-full border border-[#7B5EA7]/20">
                    Fully Furnished
                  </div>
                )}
              </div>
            </div>

            {/* 3. Available Room Types Matrix */}
            <div className="glass-card rounded-[24px] p-6 sm:p-7 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_rgba(123,94,167,0.12)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7B5EA7] dark:text-[#D9C8F0] mb-0.5">
                    Accommodations
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl text-[#1B1530] dark:text-white uppercase tracking-tight">
                    Available Room Types & Pricing
                  </h2>
                  <p className="text-xs text-[#6B6580] dark:text-purple-200/70">
                    Pick your preferred occupancy configuration
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#D9C8F0]/50 dark:bg-[#7B5EA7]/20 flex items-center justify-center text-[#7B5EA7] dark:text-purple-200">
                  <Bed size={20} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {property.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-5 rounded-[20px] border border-white/80 dark:border-white/10 hover:border-[#7B5EA7]/40 bg-white/70 dark:bg-[#161024]/60 backdrop-blur-md transition duration-300 hover:-translate-y-1 shadow-sm hover:shadow-[0_10px_25px_rgba(123,94,167,0.15)] flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-heading text-lg text-[#1B1530] dark:text-white uppercase tracking-tight">
                          {room.roomType}
                        </h4>
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#4B2E83] dark:text-purple-200 bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/20 border border-[#7B5EA7]/20 px-2.5 py-0.5 rounded-full">
                          {room.availableBeds} beds left
                        </span>
                      </div>

                      <div className="text-xl font-black text-[#7B5EA7] dark:text-purple-300 mb-2">
                        {formatCurrency(room.rent)}
                        <span className="text-xs font-normal text-[#6B6580] dark:text-purple-200/70"> /month</span>
                      </div>

                      <ul className="space-y-1.5 mb-3">
                        {room.features.map((feat, i) => (
                          <li key={i} className="text-xs text-[#1B1530] dark:text-purple-100 flex items-center gap-1.5">
                            <Check size={12} className="text-[#7B5EA7] shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {ownerWhatsApp ? (
                      <a
                        href={`https://wa.me/${ownerWhatsApp}?text=${encodeURIComponent(
                          studentProfile?.name
                            ? `Hello ${property.owner.name}, my name is ${studentProfile.name}${studentProfile.college ? ` (Student at ${studentProfile.college})` : ''}. I am interested in ${room.roomType} room (₹${room.rent.toLocaleString()}/mo) at "${property.title}" in ${property.area}, ${property.city}. Is a bed currently available?`
                            : `Hello ${property.owner.name}, I am interested in ${room.roomType} room (₹${room.rent.toLocaleString()}/mo) at "${property.title}" in ${property.area}, ${property.city}. Is a bed currently available?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-[#4B2E83] hover:bg-[#7B5EA7] text-white rounded-full text-xs font-bold uppercase tracking-[0.08em] transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_6px_20px_rgba(75,46,131,0.25)] hover:-translate-y-0.5"
                      >
                        <MessageCircle size={14} />
                        <span>Chat on WhatsApp</span>
                      </a>
                    ) : callPhoneNumber ? (
                      <a
                        href={`tel:${callPhoneNumber}`}
                        onClick={handleCallOwner}
                        className="w-full py-2.5 bg-[#1B1530] hover:bg-[#4B2E83] text-white rounded-full text-xs font-bold uppercase tracking-[0.08em] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Phone size={14} />
                        <span>Call Owner ({displayPhone})</span>
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Amenities */}
            <div className="glass-card rounded-[24px] p-6 sm:p-7 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_rgba(123,94,167,0.12)] space-y-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7B5EA7] dark:text-[#D9C8F0] mb-0.5">
                  Comfort & Conveniences
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl text-[#1B1530] dark:text-white uppercase tracking-tight">
                  Amenities & Facilities
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 dark:bg-[#161024]/60 border border-white/80 dark:border-white/10 text-xs sm:text-sm font-medium text-[#1B1530] dark:text-purple-100 shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/30 flex items-center justify-center shrink-0 text-[#7B5EA7] dark:text-purple-200">
                      <CheckCircle2 size={14} />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Food & Mess Details */}
            <div className="glass-card rounded-[24px] p-6 sm:p-7 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_rgba(123,94,167,0.12)] space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/30 flex items-center justify-center text-[#7B5EA7] dark:text-purple-200">
                  <Utensils size={16} />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7B5EA7] dark:text-[#D9C8F0] mb-0.5">
                    Campus Dining
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl text-[#1B1530] dark:text-white uppercase tracking-tight">
                    Food & Mess Details
                  </h2>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-[#161024]/60 border border-white/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.08em] px-3 py-1 bg-[#D9C8F0]/50 text-[#4B2E83] dark:bg-[#7B5EA7]/20 dark:text-purple-200 rounded-full border border-[#7B5EA7]/20">
                    Dietary: {property.foodDetails.type}
                  </span>
                  <span className="text-xs font-semibold text-[#7B5EA7] dark:text-purple-300">
                    {property.foodDetails.included ? '✓ Meals included in rent' : 'Meals optional / self-cooking'}
                  </span>
                </div>

                {property.foodDetails.meals.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {property.foodDetails.meals.map((meal) => (
                      <span key={meal} className="text-xs bg-white dark:bg-[#1B1530] text-[#1B1530] dark:text-purple-200 font-semibold px-3 py-1 rounded-full border border-[#D9C8F0] dark:border-white/10">
                        {meal}
                      </span>
                    ))}
                  </div>
                )}

                {property.foodDetails.description && (
                  <p className="text-xs sm:text-sm text-[#1B1530] dark:text-purple-100 leading-relaxed pt-1">
                    {property.foodDetails.description}
                  </p>
                )}

                {property.foodDetails.timing && (
                  <div className="flex items-center text-xs text-[#6B6580] dark:text-purple-200/70 gap-1.5 pt-1">
                    <Clock size={13} className="text-[#7B5EA7] shrink-0" />
                    <span>{property.foodDetails.timing}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 6. House Rules & Safety */}
            <div className="glass-card rounded-[24px] p-6 sm:p-7 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_rgba(123,94,167,0.12)] space-y-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7B5EA7] dark:text-[#D9C8F0] mb-0.5">
                  Stay Guidelines
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl text-[#1B1530] dark:text-white uppercase tracking-tight">
                  House Rules & Policies
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {property.gateClosingTime && (
                  <div className="p-4 bg-white/60 dark:bg-[#161024]/60 border border-white/80 dark:border-white/10 rounded-2xl flex items-start gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/30 flex items-center justify-center shrink-0 text-[#7B5EA7] dark:text-purple-200">
                      <Clock size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.08em] text-[#4B2E83] dark:text-purple-200">Gate Curfew Time</div>
                      <div className="text-xs text-[#7B5EA7] dark:text-purple-300 font-semibold">{property.gateClosingTime}</div>
                    </div>
                  </div>
                )}

                {property.noticePeriodDays && (
                  <div className="p-4 bg-white/60 dark:bg-[#161024]/60 border border-white/80 dark:border-white/10 rounded-2xl flex items-start gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[#D9C8F0]/60 dark:bg-[#7B5EA7]/30 flex items-center justify-center shrink-0 text-[#7B5EA7] dark:text-purple-200">
                      <Calendar size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.08em] text-[#4B2E83] dark:text-purple-200">Notice Period</div>
                      <div className="text-xs text-[#7B5EA7] dark:text-purple-300 font-semibold">{property.noticePeriodDays} Days</div>
                    </div>
                  </div>
                )}
              </div>

              <ul className="space-y-2 pt-2">
                {property.houseRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start text-xs sm:text-sm text-[#1B1530] dark:text-purple-100 gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7B5EA7] mt-2 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 7. Location & Google Map */}
            <GoogleMapLocation property={property} />

            {/* 8. Student Reviews & Ratings */}
            <div id="student-reviews" className="glass-card rounded-[24px] p-6 sm:p-7 border border-white/80 dark:border-white/10 shadow-[0_10px_30px_rgba(123,94,167,0.12)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7B5EA7] dark:text-[#D9C8F0] mb-0.5">
                    Community Feedback
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl text-[#1B1530] dark:text-white uppercase tracking-tight">
                    Student Ratings & Reviews
                  </h2>
                  <p className="text-xs text-[#6B6580] dark:text-purple-200/70 mt-0.5">
                    Authentic feedback from verified student residents
                  </p>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D9C8F0]/50 dark:bg-[#7B5EA7]/20 text-[#4B2E83] dark:text-purple-200 font-bold text-xs uppercase tracking-[0.06em] border border-[#7B5EA7]/20">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>{avgRating.toFixed(1)} / 5</span>
                    <span className="text-xs text-[#6B6580] dark:text-purple-300/60 font-normal">
                      ({reviews.length})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#7B5EA7] hover:bg-[#4B2E83] text-white text-xs font-bold uppercase tracking-[0.08em] px-4 py-2 rounded-full shadow-[0_8px_20px_rgba(123,94,167,0.25)] transition duration-300 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Star size={13} className="fill-white" />
                    <span>Rate this Stay</span>
                  </button>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-2xl bg-white/50 dark:bg-[#161024]/40 border border-dashed border-[#D9C8F0] dark:border-white/10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#D9C8F0]/50 text-[#7B5EA7] flex items-center justify-center mx-auto border border-[#7B5EA7]/20">
                    <Star size={24} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-[#1B1530] dark:text-white uppercase tracking-tight">No Student Reviews Yet</h3>
                    <p className="text-xs text-[#6B6580] dark:text-purple-200/70 mt-1 max-w-sm mx-auto">
                      Have you lived here or visited this property? Be the first student to rate the food, safety, and amenities!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7B5EA7] hover:bg-[#4B2E83] text-white text-xs font-bold uppercase tracking-[0.08em] rounded-full shadow-md transition cursor-pointer"
                  >
                    <Star size={13} className="fill-white" />
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
                        className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-[#161024]/60 border border-white/80 dark:border-white/10 space-y-3 transition hover:shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B5EA7] to-[#4B2E83] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                              {rev.authorName ? rev.authorName[0].toUpperCase() : 'S'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-[#1B1530] dark:text-white">
                                  {rev.authorName}
                                </span>
                                {rev.verifiedStay && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D9C8F0]/50 text-[#4B2E83] dark:bg-[#7B5EA7]/20 dark:text-purple-200 border border-[#7B5EA7]/20 text-[10px] font-bold uppercase tracking-[0.06em]">
                                    <CheckCircle2 size={11} /> Verified Stay
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#6B6580] dark:text-purple-200/70">
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
                            <span className="text-[11px] text-[#6B6580] dark:text-purple-300/60 ml-1">{rev.date}</span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-[#1B1530] dark:text-purple-100 leading-relaxed italic bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/60 dark:border-white/5">
                          &quot;{rev.comment}&quot;
                        </p>

                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleToggleHelpful(rev.id, rev.helpfulCount || 0)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                              isVoted
                                ? 'bg-[#D9C8F0]/60 text-[#4B2E83] dark:bg-[#7B5EA7]/30 dark:text-purple-200 border border-[#7B5EA7]/30 font-bold'
                                : 'text-[#6B6580] hover:text-[#1B1530] dark:text-purple-200/70 dark:hover:text-white bg-white/60 dark:bg-white/5 hover:bg-[#D9C8F0]/30 border border-white/80 dark:border-white/10'
                            }`}
                          >
                            <ThumbsUp size={12} className={isVoted ? 'fill-[#7B5EA7] text-[#7B5EA7]' : ''} />
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
            <div className="sticky top-24 glass-card rounded-[24px] p-6 border border-white/80 dark:border-white/10 shadow-[0_15px_35px_rgba(123,94,167,0.18)] space-y-6">
              
              {/* Owner Info Box */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-[#D9C8F0]/40 dark:border-white/10">
                <div className="w-12 h-12 rounded-full bg-[#D9C8F0]/60 text-[#4B2E83] dark:bg-[#7B5EA7]/30 dark:text-purple-200 font-bold flex items-center justify-center text-lg shrink-0 border border-[#7B5EA7]/20 shadow-sm">
                  {property.owner.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[#1B1530] dark:text-white text-sm">{property.owner.name}</h4>
                    {property.owner.isVerified && (
                      <ShieldCheck size={14} className="text-[#7B5EA7]" />
                    )}
                  </div>
                  <p className="text-xs text-[#6B6580] dark:text-purple-200/70">{property.owner.role}</p>
                  {property.owner.responseRate && (
                    <p className="text-[11px] text-[#7B5EA7] dark:text-purple-300 font-semibold">{property.owner.responseRate}</p>
                  )}
                </div>
              </div>

              {/* Rent summary */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B6580] dark:text-purple-200/70">Starting from</span>
                <div className="text-3xl font-black text-[#7B5EA7] dark:text-purple-300">
                  {formatCurrency(property.startingRent)}
                  <span className="text-xs text-[#6B6580] dark:text-purple-200/70 font-normal"> /month</span>
                </div>
                <div className="text-xs text-[#7B5EA7] dark:text-purple-300 mt-1 font-semibold uppercase tracking-[0.06em]">Zero brokerage fee • Direct owner connect</div>
              </div>

              {/* Action Buttons in Purple Glass Theme */}
              <div className="space-y-3">
                {/* WhatsApp Button as Primary Action */}
                {ownerWhatsApp && (
                  <a
                    href={`https://wa.me/${ownerWhatsApp}?text=${encodedWhatsAppMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-[#4B2E83] hover:bg-[#7B5EA7] text-white rounded-full font-bold text-xs uppercase tracking-[0.08em] shadow-[0_10px_25px_rgba(75,46,131,0.25)] flex items-center justify-center gap-2 transition duration-300 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <MessageCircle size={17} />
                    <span>Chat on WhatsApp</span>
                    <span className="text-sm">→</span>
                  </a>
                )}

                {/* Call Owner Button */}
                {callPhoneNumber && (
                  <a
                    href={`tel:${callPhoneNumber}`}
                    onClick={handleCallOwner}
                    className="w-full py-3.5 px-4 bg-white/70 dark:bg-white/10 hover:bg-[#D9C8F0]/40 text-[#1B1530] dark:text-white rounded-full font-bold text-xs uppercase tracking-[0.08em] flex items-center justify-center gap-2 transition duration-300 border border-white/80 dark:border-white/10 shadow-sm cursor-pointer hover:-translate-y-0.5"
                  >
                    <Phone size={15} />
                    <span>Call Owner ({displayPhone})</span>
                  </a>
                )}
              </div>

              {/* Safety guarantee */}
              <div className="bg-[#D9C8F0]/30 dark:bg-[#7B5EA7]/15 p-3.5 rounded-2xl border border-[#7B5EA7]/20 text-xs text-[#6B6580] dark:text-purple-200/80 space-y-1">
                <div className="font-bold text-[#4B2E83] dark:text-purple-200 flex items-center gap-1.5 uppercase tracking-[0.06em]">
                  <Lock size={12} className="text-[#7B5EA7]" />
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
      <div className="lg:hidden fixed bottom-14 left-0 right-0 bg-white/85 dark:bg-[#161024]/85 backdrop-blur-xl border-t border-white/80 dark:border-white/10 p-3 shadow-[0_-5px_25px_rgba(123,94,167,0.18)] z-30 transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-extrabold text-[#7B5EA7] dark:text-purple-300 leading-tight">
              {formatCurrency(property.startingRent)}
              <span className="text-[10px] text-[#6B6580] dark:text-purple-200/70 font-normal"> /mo</span>
            </div>
            <div className="text-[10px] text-[#6B6580] dark:text-purple-200/70 font-semibold uppercase tracking-[0.06em]">Zero Brokerage</div>
          </div>

          <div className="flex items-center gap-2">
            {callPhoneNumber && (
              <a
                href={`tel:${callPhoneNumber}`}
                onClick={handleCallOwner}
                className="p-2.5 bg-white/80 dark:bg-white/10 hover:bg-[#D9C8F0]/40 border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
                aria-label="Call Owner"
                title={`Call Owner: ${displayPhone}`}
              >
                <Phone size={16} />
              </a>
            )}

            {ownerWhatsApp && (
              <a
                href={`https://wa.me/${ownerWhatsApp}?text=${encodedWhatsAppMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-[#4B2E83] hover:bg-[#7B5EA7] text-white rounded-full text-xs font-bold uppercase tracking-[0.08em] shadow-md shadow-[#4B2E83]/25 flex items-center gap-1.5"
              >
                <MessageCircle size={15} />
                <span>Chat on WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Enquiry Modal Dialog */}
      <EnquiryModal
        property={property}
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        selectedRoomType={selectedRoomForEnquiry}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Authentication Prompt Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign in to Send Enquiry"
        subtitle={`Sign in to connect directly with property owners and send enquiries for ${property.title}.`}
        nextParam={`/property/${property.id}?enquire=true`}
        onSuccess={() => {
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
          setIsEnquiryModalOpen(true);
        }}
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
