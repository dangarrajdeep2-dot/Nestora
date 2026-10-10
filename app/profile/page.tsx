'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Heart, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Compass,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Enquiry } from '@/types';
import { useSavedProperties } from '@/lib/utils/favorites';
import { ListPropertyModal } from '@/components/property/ListPropertyModal';

export default function ProfilePage() {
  const { count: savedCount } = useSavedProperties();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  // Student mock profile
  const [student] = useState({
    name: 'Student Scholar',
    email: 'scholar@nestora.app',
    phone: '+91 98765 43210',
    college: 'Saurashtra University, Rajkot',
    targetGender: 'Boys PG / Stays',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nestora_enquiries');
      if (raw) {
        Promise.resolve().then(() => setEnquiries(JSON.parse(raw)));
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-16 min-h-[75vh]">
      
      {/* Header Profile Banner with Emerald Theme */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <GraduationCap size={240} />
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-3xl shadow-inner shrink-0">
            {student.name[0]}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black">{student.name}</h1>
              <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                Student
              </span>
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1.5 font-medium">
              <GraduationCap size={15} />
              <span>{student.college}</span>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-emerald-200 pt-1">
              <span>{student.phone}</span>
              <span>•</span>
              <span>{student.email}</span>
            </div>
          </div>

          <div className="shrink-0 flex gap-2">
            <Link
              href="/saved"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-sm border border-white/20 transition flex items-center gap-1.5"
            >
              <Heart size={14} className="fill-rose-300 text-rose-300" />
              <span>{savedCount} Saved</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Enquiries & Activity */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="glass-card rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">My Recent Enquiries</h3>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">{enquiries.length} submitted</span>
            </div>

            {enquiries.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/70 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <MessageSquare size={32} className="mx-auto text-slate-400 mb-2 opacity-60" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">No enquiries submitted yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  When you send an enquiry for a PG or hostel, your contact history will appear here.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-500/20"
                >
                  <Compass size={14} />
                  <span>Find Stays Near College</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.map((enq) => (
                  <div key={enq.id} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{enq.propertyName}</h4>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                        Sent to Owner
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Preference: <strong className="text-slate-900 dark:text-white">{enq.sharingPreference}</strong></span>
                      <span>Move-in: <strong className="text-slate-900 dark:text-white">{enq.moveInDate}</strong></span>
                    </div>

                    {enq.message && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        &quot;{enq.message}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Accommodation Checklist */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Student Stay Checklist</h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Always inspect water pressure, attached washroom and mattress hygiene in person.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Confirm food menu days: Ask if Sunday special meals and tea/snacks are included.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Never pay deposit before physically visiting the room. Nestora charges 0 brokerage.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column: Quick Actions & Owner CTA */}
        <div className="space-y-6">
          
          <div className="glass-card rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              Quick Shortcuts
            </h3>
            <div className="space-y-2">
              <Link
                href="/saved"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-rose-500/10 text-slate-800 dark:text-slate-200 transition text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-rose-500" />
                  <span>Saved Stays</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{savedCount}</span>
              </Link>

              <Link
                href="/search"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-emerald-500/10 text-slate-800 dark:text-slate-200 transition text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Compass size={16} className="text-emerald-500" />
                  <span>Search by College / Area</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Owner Listing Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-3xl p-6 text-white space-y-4 shadow-xl border border-emerald-500/20">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/30">
              <Building2 size={20} />
            </div>
            <div>
              <h4 className="font-bold text-base">Own a PG or Hostel?</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                List your student property on Nestora and connect directly with thousands of verified college students.
              </p>
            </div>
            <button
              onClick={() => setIsListModalOpen(true)}
              className="w-full py-3 bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              List Your Stay For Free
            </button>
          </div>

        </div>

      </div>

      <ListPropertyModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
      />

    </div>
  );
}
