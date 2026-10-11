'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function loginAction(state: { error: string } | null, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    return { error: error?.message || 'Authentication failed' };
  }

  // Check if they are an admin
  const { data: admin, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', data.user.id)
    .single();

  if (adminError || !admin) {
    await supabase.auth.signOut();
    return { error: 'Unauthorized: Not an admin.' };
  }

  redirect('/admin/properties');
}
