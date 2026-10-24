'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { PropertyType } from '@/types';

interface ListPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ListPropertyModal({ isOpen, onClose }: ListPropertyModalProps) {
  const [propertyName, setPropertyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Rajkot');
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('PG');
  const [gender, setGender] = useState<'boys' | 'girls' | 'co-ed'>('boys');
  const [startingRent, setStartingRent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B1530]/60 backdrop-blur-md animate-in fade-in">
      <div 
        className="glass-card bg-white/95 dark:bg-[#161024]/95 backdrop-blur-2xl rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-[0_20px_50px_rgba(123,94,167,0.25)] relative max-h-[90vh] overflow-y-auto border border-white/80 dark:border-white/10 text-[#1B1530] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6B6580] hover:text-[#1B1530] dark:text-purple-200/70 dark:hover:text-white bg-white/70 dark:bg-white/10 p-2 rounded-full transition cursor-pointer border border-white/80 dark:border-white/10"
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#D9C8F0]/60 text-[#7B5EA7] dark:bg-[#7B5EA7]/20 dark:text-purple-300 rounded-full flex items-center justify-center mx-auto border border-[#7B5EA7]/20 shadow-sm">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight">Listing Request Received!</h3>
            <p className="text-sm text-[#6B6580] dark:text-purple-200/70 max-w-sm mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-[#1B1530] dark:text-white">{ownerName}</span>. Our student accommodation onboarding team will contact you at <span className="font-semibold text-[#1B1530] dark:text-white">{phone}</span> to verify details and activate your property on Nestora.
            </p>
            <button
              onClick={() => {
                setIsSuccess(false);
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
                <Building2 size={14} className="text-[#7B5EA7]" />
                <span>Zero Listing Charges For Owners</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl uppercase tracking-tight">List Your PG / Hostel</h3>
              <p className="text-xs text-[#6B6580] dark:text-purple-200/70 mt-1">
                Reach thousands of verified college students searching stays near their campus.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">
                  Property Name *
                </label>
                <input
                  type="text"
                  required
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. Sunrise Student PG"
                  className="w-full px-4 py-2.5 text-sm rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/30 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] focus:ring-2 focus:ring-[#7B5EA7]/25 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Owner / Warden"
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/30 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] focus:ring-2 focus:ring-[#7B5EA7]/25 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/30 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] focus:ring-2 focus:ring-[#7B5EA7]/25 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Rajkot"
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/30 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">
                    Area / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Kotecha Chowk"
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/30 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-white/80 dark:border-white/10 bg-white dark:bg-[#161024] text-[#1B1530] dark:text-white focus:border-[#7B5EA7] outline-none"
                  >
                    <option value="PG">PG</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Room">Room</option>
                    <option value="PG AND Hostel">PG AND Hostel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">For</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "boys" | "girls" | "co-ed")}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-white/80 dark:border-white/10 bg-white dark:bg-[#161024] text-[#1B1530] dark:text-white focus:border-[#7B5EA7] outline-none"
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="co-ed">Co-ed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.08em] mb-1.5 text-[#6B6580] dark:text-purple-200/80">Rent/mo</label>
                  <input
                    type="number"
                    required
                    value={startingRent}
                    onChange={(e) => setStartingRent(e.target.value)}
                    placeholder="₹6000"
                    className="w-full px-2 py-2 text-xs rounded-xl border border-white/80 dark:border-white/10 bg-white/70 dark:bg-black/30 text-[#1B1530] dark:text-white focus:border-[#7B5EA7] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#7B5EA7] hover:bg-[#4B2E83] text-white font-bold text-xs uppercase tracking-[0.08em] rounded-full flex items-center justify-center gap-2 transition duration-300 hover:-translate-y-0.5 cursor-pointer shadow-[0_10px_25px_rgba(123,94,167,0.3)] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Property for Verification</span>
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
