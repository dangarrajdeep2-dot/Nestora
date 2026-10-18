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
  Loader2,
  MessageCircle
} from 'lucide-react';
import { Property } from '@/types';
import { submitEnquiry } from '@/lib/api/properties';

function cleanWhatsAppNumber(whatsapp?: string, phone?: string): string {
  const raw = whatsapp || phone || '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length > 10 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

function buildWhatsAppMessage({
  ownerName,
  propertyTitle,
  propertyArea,
  propertyCity,
  studentName,
  studentPhone,
  studentCollege,
  sharingPreference,
  moveInDate,
  message,
}: {
  ownerName: string;
  propertyTitle: string;
  propertyArea: string;
  propertyCity: string;
  studentName: string;
  studentPhone: string;
  studentCollege: string;
  sharingPreference: string;
  moveInDate: string;
  message?: string;
}) {
  const parts = [
    `👋 Hello *${ownerName}*,`,
    `I am interested in your stay *"${propertyTitle}"* (${propertyArea}, ${propertyCity}) listed on Nestora!`,
    ``,
    `📋 *Student Enquiry Details:*`,
    `👤 *Student Name:* ${studentName.trim()}`,
    `📞 *Mobile:* +91 ${studentPhone.trim()}`,
    `🎓 *College:* ${studentCollege.trim()}`,
    `🛏️ *Sharing Preference:* ${sharingPreference}`,
    `📅 *Expected Move-in:* ${moveInDate}`,
  ];

  if (message && message.trim()) {
    parts.push(`💬 *Message:* ${message.trim()}`);
  } else {
    parts.push(`💬 *Message:* Hi, please let me know if a bed is available and when I can schedule a visit.`);
  }

  parts.push(``);
  parts.push(`_(Sent via Nestora Student Housing)_`);

  return parts.join('\n');
}

interface EnquiryModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  selectedRoomType?: string;
  onRequireAuth?: () => void;
}

export function EnquiryModal({ property, isOpen, onClose, selectedRoomType, onRequireAuth }: EnquiryModalProps) {
  const [initialData] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem('nestora_pending_enquiry');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.propertyId === property.id) {
          sessionStorage.removeItem('nestora_pending_enquiry');
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const [studentName, setStudentName] = useState(() => initialData?.studentName || '');
  const [studentPhone, setStudentPhone] = useState(() => (initialData?.studentPhone ? initialData.studentPhone.replace(/\D/g, '') : ''));
  const [studentCollege, setStudentCollege] = useState(() => initialData?.studentCollege || '');
  const [moveInDate, setMoveInDate] = useState(() => initialData?.moveInDate || '');
  const [sharingPreference, setSharingPreference] = useState(
    () => initialData?.sharingPreference || selectedRoomType || property.rooms[0]?.roomType || '2 Sharing'
  );
  const [message, setMessage] = useState(() => initialData?.message || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      // Fetch authenticated user details to auto-fill empty fields
      import('@/lib/supabase/client').then(({ supabase }) => {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase
              .from('users')
              .select('name, phone, college')
              .eq('id', user.id)
              .maybeSingle()
              .then(({ data }) => {
                if (data) {
                  setStudentName((prev: string) => prev || data.name || '');
                  setStudentPhone((prev: string) => prev || (data.phone ? data.phone.replace(/\D/g, '') : ''));
                  setStudentCollege((prev: string) => prev || data.college || '');
                }
              });
          }
        });
      });
    }
  }, [isOpen, property.id]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setStudentPhone(digitsOnly);

    if (digitsOnly.length > 10) {
      setErrors((prev) => ({
        ...prev,
        phone: 'Phone number must be exactly 10 digits.',
      }));
    } else {
      setErrors((prev) => {
        if (!prev.phone) return prev;
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!studentName.trim()) errs.name = 'Please enter your name';
    if (!studentPhone.trim() || studentPhone.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits.';
    }
    if (!studentCollege.trim()) errs.college = 'Please enter your college or university';
    if (!moveInDate) errs.date = 'Please select your tentative move-in date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrorMessage(null);
    if (!validate()) return;

    // Check client authentication before sending
    const { supabase } = await import('@/lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Store pending form details so user does not re-type upon returning
      try {
        sessionStorage.setItem(
          'nestora_pending_enquiry',
          JSON.stringify({
            propertyId: property.id,
            studentName,
            studentPhone,
            studentCollege,
            moveInDate,
            sharingPreference,
            message,
          })
        );
      } catch {}

      onClose();
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitEnquiry({
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

      if (!result.success) {
        if (result.requireAuth) {
          try {
            sessionStorage.setItem(
              'nestora_pending_enquiry',
              JSON.stringify({
                propertyId: property.id,
                studentName,
                studentPhone,
                studentCollege,
                moveInDate,
                sharingPreference,
                message,
              })
            );
          } catch {}
          onClose();
          if (onRequireAuth) {
            onRequireAuth();
          }
          return;
        }

        setServerErrorMessage(result.error || 'Failed to submit enquiry. Please try again.');
        return;
      }

      // Generate formatted WhatsApp URL
      const targetPhone = cleanWhatsAppNumber(property.owner.whatsapp, property.owner.phone);
      let waUrl = '';
      if (targetPhone) {
        const waText = buildWhatsAppMessage({
          ownerName: property.owner.name,
          propertyTitle: property.title,
          propertyArea: property.area,
          propertyCity: property.city,
          studentName,
          studentPhone,
          studentCollege,
          sharingPreference,
          moveInDate,
          message,
        });
        waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(waText)}`;
        setGeneratedWhatsAppUrl(waUrl);

        if (typeof window !== 'undefined') {
          // Open WhatsApp in a new tab/window directly
          window.open(waUrl, '_blank');
        }
      }

      setIsSubmitted(true);
    } catch {
      setServerErrorMessage('Unable to send enquiry. Please try again or contact via WhatsApp.');
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
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold">Enquiry Registered!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your inquiry has been logged in Nestora. A pre-filled WhatsApp message with your details has been prepared for <span className="font-semibold text-slate-900 dark:text-white">{property.owner.name}</span>.
            </p>

            {/* Inquiry Details Summary */}
            <div className="text-left bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div><span className="font-bold text-slate-900 dark:text-white">Student:</span> {studentName} (+91 {studentPhone})</div>
              <div><span className="font-bold text-slate-900 dark:text-white">College:</span> {studentCollege}</div>
              <div><span className="font-bold text-slate-900 dark:text-white">Stay:</span> {property.title} ({sharingPreference})</div>
              <div><span className="font-bold text-slate-900 dark:text-white">Move-in Date:</span> {moveInDate}</div>
            </div>

            {generatedWhatsAppUrl ? (
              <div className="space-y-2 pt-1">
                <a
                  href={generatedWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  <MessageCircle size={18} />
                  <span>Open WhatsApp & Message {property.owner.name}</span>
                </a>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Click above if WhatsApp didn't open automatically
                </p>
              </div>
            ) : null}

            <div className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 p-3 rounded-2xl text-xs font-semibold border border-emerald-500/20">
              ✓ Direct owner connection with zero brokerage fees
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
                onClose();
              }}
              className="mt-2 px-6 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-sm transition cursor-pointer"
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

            {serverErrorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {serverErrorMessage}
              </div>
            )}

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
                    inputMode="numeric"
                    required
                    value={studentPhone}
                    onChange={handlePhoneChange}
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

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending Details to Owner...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle size={18} />
                      <span>Send Enquiry & Chat on WhatsApp</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                  Pre-fills your student details & directly connects you with the owner on WhatsApp
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
