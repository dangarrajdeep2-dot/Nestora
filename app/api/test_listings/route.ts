import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  const { data, error } = await supabase.from('listings').select('*');
  return NextResponse.json({ data, error });
}
