'use server';

import { createClient } from '@/lib/supabase/server';
import { sanitizeNextUrl } from '@/app/auth/callback/route';
import { redirect } from 'next/navigation';
import { validatePhoneNumber } from '@/lib/utils';
import { headers } from 'next/headers';

export interface AuthActionResult {
  success?: boolean;
  error?: string;
  needsConfirmation?: boolean;
  email?: string;
}

/**
 * Normal Student Sign Up Action
 */
export async function signUpStudentAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!name || !name.trim()) {
    return { error: 'Please enter your full name.' };
  }
  if (!email || !email.trim()) {
    return { error: 'Please enter your email address.' };
  }
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters long.' };
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        name: cleanName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is enabled, session will be null
  return {
    success: true,
    needsConfirmation: !data.session,
    email: cleanEmail,
  };
}

/**
 * Normal Student Sign In Action
 */
export async function signInStudentAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nextParam = formData.get('next') as string;
  const safeNext = sanitizeNextUrl(nextParam || '/profile');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        error: 'Your email has not been verified yet. Please check your inbox or click resend.',
        needsConfirmation: true,
        email: cleanEmail,
      };
    }
    return { error: error.message };
  }

  // Verify that this user is NOT an admin logging in via the student portal
  if (data?.user) {
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (adminRecord) {
      await supabase.auth.signOut();
      return { error: 'This account is registered as an administrator. Please use the Admin Portal to sign in.' };
    }
  }

  redirect(safeNext);
}

/**
 * Resend Confirmation Email Action
 */
export async function resendConfirmationAction(email: string): Promise<AuthActionResult> {
  if (!email || !email.trim()) {
    return { error: 'Email address is required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: cleanEmail,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Normal Student Sign Out Action
 */
export async function signOutStudentAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

/**
 * Fetch Current Authenticated Student Profile from public.users
 */
export async function getStudentProfileAction() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, profile: null };
  }

  // Double check admin exclusion
  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (adminRecord) {
    return { user: null, profile: null, isAdmin: true };
  }

  // Query public.users
  const { data: initialProfile, error: profileError } = await supabase
    .from('users')
    .select('id, name, email, phone, college, avatar_url, created_at')
    .eq('id', user.id)
    .maybeSingle();

  let profile = initialProfile;

  if (!profile && !profileError) {
    // Attempt recovery RPC if profile is missing
    const { data: recoveryRes } = await supabase.rpc('ensure_user_profile');
    if (recoveryRes?.success && recoveryRes.profile) {
      profile = recoveryRes.profile;
    }
  }

  if (profile) {
    // If public.users.name is empty, use authenticated user's metadata name as fallback
    if (!profile.name || !profile.name.trim()) {
      profile.name = (user.user_metadata?.name || user.user_metadata?.full_name || '').trim() || 'Student';
    }
  }

  return { user, profile: profile || null, isAdmin: false };
}

/**
 * Update Current Student Profile Action (name, phone, college, avatar_url)
 */
export async function updateStudentProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized: Please sign in.' };
  }

  // Double check admin exclusion
  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (adminRecord) {
    return { error: 'Administrator accounts cannot be updated as student profiles.' };
  }

  const name = formData.get('name') as string | null;
  const phone = formData.get('phone') as string | null;
  const college = formData.get('college') as string | null;

  // Validate phone number: phone is optional, but if provided must be exactly 10 numeric digits
  if (phone !== null && phone !== undefined) {
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      return { error: phoneValidation.error || 'Invalid phone number.' };
    }
  }

  // Fetch existing user record to prevent overwriting existing database values with empty values
  let { data: existingUser } = await supabase
    .from('users')
    .select('id, name, phone, college')
    .eq('id', user.id)
    .maybeSingle();

  // If profile row is missing, ensure profile exists first
  if (!existingUser) {
    const { data: recoveryRes } = await supabase.rpc('ensure_user_profile');
    if (recoveryRes?.success && recoveryRes.profile) {
      existingUser = recoveryRes.profile;
    }
  }

  const updates: Record<string, string | null> = {};

  const cleanName = (name ?? '').trim();
  if (cleanName) {
    updates.name = cleanName;
  } else if (existingUser?.name && existingUser.name.trim()) {
    // Preserve existing database name, do not overwrite with empty
    updates.name = existingUser.name.trim();
  } else {
    // Fallback to auth metadata name if both submitted and existing names are empty
    const metaName = (user.user_metadata?.name || user.user_metadata?.full_name || '').trim();
    if (metaName) {
      updates.name = metaName;
    }
  }

  const cleanPhone = (phone ?? '').trim();
  if (cleanPhone) {
    updates.phone = cleanPhone;
  } else if (existingUser?.phone && existingUser.phone.trim()) {
    // Preserve existing phone, do not overwrite with empty
    updates.phone = existingUser.phone.trim();
  }

  const cleanCollege = (college ?? '').trim();
  if (cleanCollege) {
    updates.college = cleanCollege;
  } else if (existingUser?.college && existingUser.college.trim()) {
    // Preserve existing college, do not overwrite with empty
    updates.college = existingUser.college.trim();
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (updateError) {
      return { error: updateError.message };
    }
  }

  return { success: true };
}

/**
 * Dynamically resolves base origin for auth redirects without hardcoding localhost
 */
async function getAuthRedirectOrigin(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (envUrl) {
    return envUrl;
  }
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') || headerList.get('host');
  const proto = headerList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  if (host) {
    return `${proto}://${host}`;
  }
  return 'http://localhost:3000';
}

/**
 * Request Password Reset Action (Sends reset email via Supabase)
 */
export async function requestPasswordResetAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get('email') as string;

  if (!email || !email.trim()) {
    return { error: 'Please enter your email address.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const supabase = await createClient();
  const origin = await getAuthRedirectOrigin();
  const redirectTo = `${origin}/auth/callback?next=/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo,
  });

  if (error) {
    if (error.message.toLowerCase().includes('rate limit') || (error as { status?: number }).status === 429) {
      return {
        error: 'Too many reset attempts. Please wait a few minutes before trying again.',
        email: cleanEmail,
      };
    }
    // Neutral success for general security/user enumeration protection
  }

  return {
    success: true,
    email: cleanEmail,
  };
}

/**
 * Resend Password Reset Action
 */
export async function resendPasswordResetAction(email: string): Promise<AuthActionResult> {
  if (!email || !email.trim()) {
    return { error: 'Email address is required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const supabase = await createClient();
  const origin = await getAuthRedirectOrigin();
  const redirectTo = `${origin}/auth/callback?next=/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo,
  });

  if (error) {
    if (error.message.toLowerCase().includes('rate limit') || (error as { status?: number }).status === 429) {
      return { error: 'Too many reset attempts. Please wait a few minutes before trying again.' };
    }
    return { error: error.message };
  }

  return { success: true, email: cleanEmail };
}

/**
 * Reset Password Action (Updates password for authenticated recovery session)
 */
export async function resetPasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters long.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'No active password recovery session found. The link may have expired or already been used.' };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password,
  });

  if (updateError) {
    return { error: updateError.message };
  }

  // Clear recovery session upon success
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  return { success: true };
}
