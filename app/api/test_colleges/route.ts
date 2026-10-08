import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  const { data, error } = await supabase.from('colleges').select('name, city');
  return NextResponse.json({ data, error });
}
