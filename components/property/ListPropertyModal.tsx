'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

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
  const [propertyType, setPropertyType] = useState<'PG' | 'Hostel' | 'Room'>('PG');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="glass-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold">Listing Request Received!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-slate-900 dark:text-white">{ownerName}</span>. Our student accommodation onboarding team will contact you at <span className="font-semibold text-slate-900 dark:text-white">{phone}</span> to verify details and activate your property on Nestora.
            </p>
            <button
              onClick={() => {
                setIsSuccess(false);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-md mb-2 border border-emerald-500/20">
                <Building2 size={14} />
                <span>Zero Listing Charges For Owners</span>
              </div>
              <h3 className="text-2xl font-black">List Your PG / Hostel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Reach thousands of verified college students searching stays near their campus.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Property Name *
                </label>
                <input
                  type="text"
                  required
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. Sunrise Student PG"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Owner / Warden"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Rajkot"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    Area / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Kotecha Chowk"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as "PG" | "Hostel" | "Room")}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <option value="PG">PG</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Room">Room</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">For</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "boys" | "girls" | "co-ed")}
                    className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="co-ed">Co-ed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">Rent/mo</label>
                  <input
                    type="number"
                    required
                    value={startingRent}
                    onChange={(e) => setStartingRent(e.target.value)}
                    placeholder="₹6000"
                    className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Property for Verification</span>
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
