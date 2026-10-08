import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  const collegeId = '11111111-1111-1111-1111-111111111111';
  let query = supabase
    .from('listings')
    .select('title')
    .eq('college_id', collegeId);
  
  const qFilter = 'sunrise';
  query = query.ilike('title', `%${qFilter.trim()}%`);

  const { data, error } = await query;
  return NextResponse.json({ data, error });
}
