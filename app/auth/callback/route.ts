import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export function sanitizeNextUrl(next: string | null): string {
  if (!next) return '/profile';
  // Must start with a single slash and NOT a double slash (protocol-relative URL) or backslash
  if (next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) {
    try {
      const parsed = new URL(next, 'http://localhost');
      return parsed.pathname + parsed.search + parsed.hash;
    } catch {
      return '/profile';
    }
  }
  return '/profile';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Support LAN and proxy origins dynamically
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host;
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') || host.startsWith('10.') || host.startsWith('192.') ? 'http' : 'https');
  const origin = `${proto}://${host}`;
  const code = searchParams.get('code');
  const next = sanitizeNextUrl(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // Check if this account is an administrator
      const { data: adminRecord } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (adminRecord) {
        // Authenticated administrator -> route to admin console
        const adminDest = next.startsWith('/admin') && next !== '/admin/login' ? next : '/admin/properties';
        return NextResponse.redirect(`${origin}${adminDest}`);
      }

      // Normal student -> if they attempted to access an admin route, reject with clear error
      if (next.startsWith('/admin')) {
        return NextResponse.redirect(
          `${origin}/admin/login?error=${encodeURIComponent(
            'Access denied: This account does not have administrator privileges.'
          )}`
        );
      }

      // Forward verified student to their destination page (default /profile)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Handle explicit OAuth errors (e.g. user cancelled prompt)
  const oauthError = searchParams.get('error_description') || searchParams.get('error');
  if (oauthError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(oauthError)}`);
  }

  // Code exchange failed or code was expired/invalid
  if (next.startsWith('/reset-password')) {
    return NextResponse.redirect(`${origin}/reset-password?error=invalid_or_expired_link`);
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_or_expired_link`);
}
