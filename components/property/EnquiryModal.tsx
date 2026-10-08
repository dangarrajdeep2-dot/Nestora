'use client';

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  User, 
  Phone, 
  GraduationCap, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  Loader2 
} from 'lucide-react';
import { Property } from '@/types';
import { submitEnquiry } from '@/lib/api/properties';

interface EnquiryModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  selectedRoomType?: string;
}

export function EnquiryModal({ property, isOpen, onClose, selectedRoomType }: EnquiryModalProps) {
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentCollege, setStudentCollege] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [sharingPreference, setSharingPreference] = useState(
    selectedRoomType || property.rooms[0]?.roomType || '2 Sharing'
  );
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!studentName.trim()) errs.name = 'Please enter your name';
    if (!studentPhone.trim() || studentPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!studentCollege.trim()) errs.college = 'Please enter your college or university';
    if (!moveInDate) errs.date = 'Please select your tentative move-in date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitEnquiry({
        propertyId: property.id,
        propertyName: property.title,
        studentName,
        studentPhone,
        studentCollege,
        gender: property.gender === 'girls' ? 'girls' : 'boys',
        moveInDate,
        sharingPreference,
        message,
      });
      setIsSubmitted(true);
    } catch {
      alert('Unable to send enquiry. Please try again or contact via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        >
          <X size={18} />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold">Enquiry Sent Successfully!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              We have forwarded your details to <span className="font-semibold text-slate-900 dark:text-white">{property.owner.name}</span>. The property manager will call you or connect on WhatsApp shortly.
            </p>
            <div className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 p-3.5 rounded-2xl text-xs font-semibold border border-emerald-500/20">
              ✓ Direct owner connection with zero brokerage fees
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
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
                <ShieldCheck size={14} />
                <span>Verified Direct Connect</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                Enquire for {property.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {property.area}, {property.city} • Starts at ₹{property.startingRent.toLocaleString()}/mo
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Parth Patel"
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Student Phone */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Mobile Number (WhatsApp) *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* College Name */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Your College / University *
                </label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={studentCollege}
                    onChange={(e) => setStudentCollege(e.target.value)}
                    placeholder="e.g. Saurashtra University, RK Univ, etc."
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                {errors.college && <p className="text-rose-500 text-xs mt-1">{errors.college}</p>}
              </div>

              {/* Grid: Move-in date and Sharing Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    Move-in Date *
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  {errors.date && <p className="text-rose-500 text-xs mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                    Room Sharing
                  </label>
                  <select
                    value={sharingPreference}
                    onChange={(e) => setSharingPreference(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none"
                  >
                    {property.rooms.map((r) => (
                      <option key={r.id} value={r.roomType}>
                        {r.roomType} (₹{r.rent.toLocaleString()}/mo)
                      </option>
                    ))}
                    <option value="Any available">Any Available Sharing</option>
                  </select>
                </div>
              </div>

              {/* Optional Message */}
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-slate-700 dark:text-slate-300">
                  Questions / Special Request (Optional)
                </label>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Want to schedule an in-person room visit this Saturday afternoon..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending Details...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Enquiry</span>
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
