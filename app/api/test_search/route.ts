import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const qFilter = searchParams.get('q');
  const genderFilter = searchParams.get('gender');
  const rentFilter = searchParams.get('rent');
  
  let query = supabase.from('listings').select('title, gender, rent, address').eq('college_id', '11111111-1111-1111-1111-111111111111');

  if (qFilter && qFilter.trim()) {
    const searchTerm = qFilter.trim();
    query = query.or(`title.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
  }

  if (genderFilter && genderFilter !== 'all') {
    const dbGenderMap: Record<string, string> = { 'boys': 'male', 'girls': 'female', 'co-ed': 'any' };
    if (dbGenderMap[genderFilter]) query = query.eq('gender', dbGenderMap[genderFilter]);
  }

  if (rentFilter && rentFilter !== 'any') {
    if (rentFilter === 'under_8k') query = query.lt('rent', 8000);
    else if (rentFilter === '8k_15k') query = query.gte('rent', 8000).lte('rent', 15000);
    else if (rentFilter === '15k_25k') query = query.gte('rent', 15000).lte('rent', 25000);
    else if (rentFilter === 'above_25k') query = query.gt('rent', 25000);
  }

  const { data, error } = await query;
  return NextResponse.json({ data, error });
}
