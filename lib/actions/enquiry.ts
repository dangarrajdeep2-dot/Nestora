'use server';

import { createClient } from '@/lib/supabase/server';

export interface SubmitEnquiryPayload {
  propertyId: string;
  propertyName: string;
  studentName: string;
  studentPhone: string;
  studentCollege?: string;
  gender?: 'boys' | 'girls' | 'co-ed';
  moveInDate?: string;
  sharingPreference?: string;
  message?: string;
}

export interface SubmitEnquiryResult {
  success: boolean;
  requireAuth?: boolean;
  error?: string;
}

export async function submitEnquiryAction(payload: SubmitEnquiryPayload): Promise<SubmitEnquiryResult> {
  const supabase = await createClient();

  // 1. Enforce Server-Side Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      success: false,
      requireAuth: true,
      error: 'Authentication required: You must be signed in to submit an enquiry.',
    };
  }

  // 2. Validate essential fields
  if (!payload.propertyId) {
    return { success: false, error: 'Property ID is required.' };
  }
  if (!payload.studentName || !payload.studentName.trim()) {
    return { success: false, error: 'Please enter your name.' };
  }
  if (!payload.studentPhone || !payload.studentPhone.trim()) {
    return { success: false, error: 'Please enter your phone number.' };
  }

  const cleanPhone = payload.studentPhone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length < 10) {
    return { success: false, error: 'Please provide a valid 10-digit phone number.' };
  }

  // 3. Ensure a profile row exists in public.users to satisfy foreign key (enquiries.user_id -> users.id)
  let userProfileExists = false;
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (existingUser) {
    userProfileExists = true;
  } else {
    // Attempt RPC ensure_user_profile to safely sync student profile
    await supabase.rpc('ensure_user_profile');

    const { data: verifiedUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (verifiedUser) {
      userProfileExists = true;
    }
  }

  if (!userProfileExists) {
    return {
      success: false,
      requireAuth: true,
      error: 'Authentication verification required. Please sign in again.',
    };
  }

  // 4. Insert into Supabase using verified server user ID (never client-supplied)
  const { error } = await supabase.from('enquiries').insert({
    property_id: payload.propertyId,
    property_name: payload.propertyName || 'Student Stay',
    student_name: payload.studentName.trim(),
    student_phone: cleanPhone,
    student_college: payload.studentCollege?.trim() || null,
    gender: payload.gender || 'boys',
    move_in_date: payload.moveInDate || null,
    sharing_preference: payload.sharingPreference || null,
    message: payload.message?.trim() || null,
    status: 'pending',
    user_id: user.id, // Strictly derived from the authenticated server session
  });

  if (error) {
    console.error('Server error submitting enquiry:', error);
    // If a foreign key constraint on user_id fails, open auth modal rather than exposing database internals
    if (error.code === '23503' && (error.message?.includes('user') || error.details?.includes('users'))) {
      return {
        success: false,
        requireAuth: true,
        error: 'Authentication verification required. Please sign in again.',
      };
    }
    return { success: false, error: error.message || 'Failed to submit enquiry.' };
  }

  return { success: true };
}

