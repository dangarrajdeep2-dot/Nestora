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
  MessageSquare,
  Edit2,
  Save,
  X,
  Loader2,
  LogIn,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { Enquiry } from '@/types';
import { useSavedProperties } from '@/lib/utils/favorites';
import { ListPropertyModal } from '@/components/property/ListPropertyModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/lib/supabase/client';
import { updateStudentProfileAction, signOutStudentAction } from '@/lib/actions/userAuth';
import { validatePhoneNumber } from '@/lib/utils';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

export default function ProfilePage() {
  const { count: savedCount } = useSavedProperties();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);

  const [student, setStudent] = useState<{
    id?: string;
    name: string;
    email: string;
    phone: string;
    college: string;
  }>({
    name: '',
    email: '',
    phone: '',
    college: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let isLoadingProfile = false;

    async function loadProfile() {
      if (isLoadingProfile) return;
      isLoadingProfile = true;
      setLoading(true);
      setSaveError(null);
      try {
        const authPromise = supabase.auth.getUser();
        const authTimeout = new Promise<{ data: { user: null }; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: { user: null }, error: new Error('Auth timeout') }), 5000)
        );

        const { data: { user: authUser }, error: authErr } = await Promise.race([authPromise, authTimeout]);
        if (!isMounted) return;

        if (authErr || !authUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Check if user is an administrator; admins have their own portal
        const adminPromise = supabase
          .from('admin_users')
          .select('id')
          .eq('id', authUser.id)
          .maybeSingle();
        const adminTimeout = new Promise<{ data: null }>((resolve) =>
          setTimeout(() => resolve({ data: null }), 4000)
        );
        const { data: adminRecord } = await Promise.race([adminPromise, adminTimeout]);

        if (!isMounted) return;

        if (adminRecord) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(authUser);

        // Fetch student profile row using authenticated user's ID
        const profilePromise = supabase
          .from('users')
          .select('id, name, email, phone, college, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle();
        const profileTimeout = new Promise<{ data: null }>((resolve) =>
          setTimeout(() => resolve({ data: null }), 4000)
        );
        const { data: initialProfile } = await Promise.race([profilePromise, profileTimeout]);

        const profile = initialProfile;

        if (isMounted) {
          // If public.users.name is empty, use authenticated user's metadata name as fallback for display
          const dbName = (profile?.name || '').trim();
          const metaName = (authUser.user_metadata?.name || authUser.user_metadata?.full_name || '').trim();
          const displayName = dbName || metaName || 'Student';

          // Fetch saved phone number and college from the existing profile record
          const savedPhone = (profile?.phone || '').trim();
          const savedCollege = (profile?.college || '').trim();

          const currentData = {
            id: profile?.id || authUser.id,
            name: displayName,
            email: profile?.email || authUser.email || '',
            phone: savedPhone,
            college: savedCollege,
          };

          setStudent(currentData);
          // Pre-fill the form fields with the retrieved values
          setEditName(displayName);
          setEditPhone(savedPhone);
          setEditCollege(savedCollege);
          setPhoneError(null);

          window.dispatchEvent(
            new CustomEvent('nestora_profile_updated', {
              detail: { name: displayName },
            })
          );
        }

        // Fetch student enquiries from public.enquiries
        const enqPromise = supabase
          .from('enquiries')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });
        const enqTimeout = new Promise<{ data: null }>((resolve) =>
          setTimeout(() => resolve({ data: null }), 4000)
        );
        const { data: enqData } = await Promise.race([enqPromise, enqTimeout]);

        if (enqData && isMounted) {
          const mapped: Enquiry[] = enqData.map((e: {
            id: string;
            property_id: string;
            property_name?: string | null;
            student_name: string;
            student_phone: string;
            student_college?: string | null;
            gender: 'boys' | 'girls' | 'co-ed';
            move_in_date?: string | null;
            sharing_preference?: string | null;
            message?: string | null;
            status?: string | null;
            created_at?: string | null;
          }) => ({
            id: e.id,
            propertyId: e.property_id,
            propertyName: e.property_name || 'Student Stay',
            studentName: e.student_name,
            studentPhone: e.student_phone,
            studentCollege: e.student_college || '',
            gender: e.gender === 'girls' ? 'girls' : 'boys',
            moveInDate: e.move_in_date || '',
            sharingPreference: e.sharing_preference || '2 Sharing',
            message: e.message || undefined,
            status: e.status === 'contacted' ? 'contacted' : 'pending',
            createdAt: e.created_at || new Date().toISOString(),
          }));
          setEnquiries(mapped);
        } else {
          // Fallback to local enquiries
          try {
            const raw = localStorage.getItem('nestora_enquiries');
            if (raw && isMounted) setEnquiries(JSON.parse(raw));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        if (isMounted) {
          setSaveError('Failed to load profile. Please refresh or try again.');
        }
      } finally {
        isLoadingProfile = false;
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setLoading(false);
      } else if (session?.user) {
        loadProfile();
      }
    });

    const handleAuthChange = () => {
      if (isMounted) {
        loadProfile();
      }
    };
    window.addEventListener('nestora_auth_changed', handleAuthChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('nestora_auth_changed', handleAuthChange);
    };
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditPhone(val);
    const result = validatePhoneNumber(val);
    setPhoneError(result.error);
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted === undefined || pasted === null) return;

    // Do not silently truncate invalid pasted input; validate it and explain the problem
    e.preventDefault();
    setEditPhone(pasted);
    const result = validatePhoneNumber(pasted);
    setPhoneError(result.error);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Revert edits to existing saved student state and clear errors
      setEditName(student.name);
      setEditPhone(student.phone);
      setEditCollege(student.college);
      setPhoneError(null);
      setSaveError(null);
      setIsEditing(false);
    } else {
      // Pre-fill form fields with current student values
      setEditName(student.name);
      setEditPhone(student.phone);
      setEditCollege(student.college);
      setPhoneError(null);
      setSaveError(null);
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);
    setSaveError(null);

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setSaveError('Please enter your full name.');
      return;
    }

    // Phone number validation: optional, but if provided must be exactly 10 numeric digits
    const phoneValidation = validatePhoneNumber(editPhone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('phone', editPhone);
      formData.append('college', editCollege);

      const result = await updateStudentProfileAction(formData);
      if (result.success) {
        // Do not overwrite existing values with empty values
        const updatedName = trimmedName || student.name;
        const updatedPhone = editPhone.trim() || student.phone;
        const updatedCollege = editCollege.trim() || student.college;

        setStudent((prev) => ({
          ...prev,
          name: updatedName,
          phone: updatedPhone,
          college: updatedCollege,
        }));
        setEditName(updatedName);
        setEditPhone(updatedPhone);
        setEditCollege(updatedCollege);
        setPhoneError(null);
        setIsEditing(false);
        setSaveMessage('Profile updated successfully!');
        window.dispatchEvent(
          new CustomEvent('nestora_profile_updated', {
            detail: { name: updatedName },
          })
        );
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveError(result.error || 'Failed to update profile.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out client:', err);
    }
    setUser(null);
    window.dispatchEvent(new CustomEvent('nestora_auth_changed'));
    await signOutStudentAction();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Loader2 size={36} className="animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading student profile...</p>
      </div>
    );
  }

  // Guest State: If not logged in, prompt user to sign in
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
          <GraduationCap size={44} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
          Student Portal
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 max-w-md">
          Sign in or create an account to view your confirmed student profile, manage your saved stays, and track owner enquiries.
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Create Account
          </button>
        </div>

        {/* Auth Modal for Guest Users */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          title="Student Sign In"
          subtitle="Sign in to view your profile, manage enquiries, and track saved stays."
          nextParam="/profile"
          onSuccess={() => {
            setIsAuthModalOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-16 min-h-[75vh]">
      
      {/* Header Profile Banner with Emerald Theme */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <GraduationCap size={240} />
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-3xl shadow-inner shrink-0">
            {student.name ? student.name[0] : 'S'}
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
              <span>{student.college || 'College not set'}</span>
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-emerald-200 pt-1">
              <span>{student.phone || 'Phone not set'}</span>
              <span>•</span>
              <span>{student.email}</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-wrap gap-2 justify-center sm:justify-start">
            <button
              type="button"
              onClick={handleToggleEdit}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-sm border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              {isEditing ? <X size={14} /> : <Edit2 size={14} />}
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
            <Link
              href="/saved"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-sm border border-white/20 transition flex items-center gap-1.5"
            >
              <Heart size={14} className="fill-rose-300 text-rose-300" />
              <span>{savedCount} Saved</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 rounded-xl text-xs font-bold backdrop-blur-sm border border-rose-400/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{saveMessage}</span>
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      {/* Edit Profile Form Card */}
      {isEditing && (
        <div className="mb-8 glass-card rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Edit Student Profile</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div className="space-y-1">
              <label htmlFor="edit-name" className="text-xs font-bold text-slate-700 dark:text-slate-300">Name</label>
              <input
                id="edit-name"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-phone" className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone (Optional)</label>
              <input
                id="edit-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={editPhone}
                placeholder="10-digit mobile number"
                onChange={handlePhoneChange}
                onPaste={handlePhonePaste}
                className={`w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border text-slate-900 dark:text-white transition-colors ${
                  phoneError
                    ? 'border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500'
                }`}
              />
              {phoneError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                  {phoneError}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label htmlFor="edit-college" className="text-xs font-bold text-slate-700 dark:text-slate-300">College / University</label>
              <input
                id="edit-college"
                type="text"
                value={editCollege}
                placeholder="e.g. Saurashtra University, Rajkot"
                onChange={(e) => setEditCollege(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Save Changes</span>
            </button>
          </form>
        </div>
      )}

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
                <span>Clarify curfew & gate closing times with the owner before booking.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column: Shortcuts & Quick Actions */}
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

              <Link
                href="/admin/login"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-slate-400" />
                  <span>Admin Portal</span>
                </div>
                <span className="text-[10px] text-slate-400">Login &rarr;</span>
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
