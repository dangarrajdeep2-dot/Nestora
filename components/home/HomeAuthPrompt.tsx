'use client';

import React, { useEffect, useState } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/lib/supabase/client';

export function HomeAuthPrompt() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    const checkAuthAndPrompt = async () => {
      // Check if dismissed during current browser session
      try {
        const isDismissed = sessionStorage.getItem('nestora_home_auth_dismissed');
        if (isDismissed) {
          return;
        }
      } catch {
        // In case sessionStorage is blocked
      }

      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (!user || error) {
          // If no authenticated user, show prompt after brief delay for smooth entrance
          timer = setTimeout(() => {
            if (isMounted) {
              setIsOpen(true);
            }
          }, 800);
          return;
        }

        // Check if this user is an administrator; admins must not appear as students in the student portal
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!isMounted) return;

        if (adminRecord) {
          // Admin viewing student homepage: treat as signed-out student visitor
          timer = setTimeout(() => {
            if (isMounted) {
              setIsOpen(true);
            }
          }, 800);
        } else {
          // Authenticated student: ensure prompt stays closed
          setIsOpen(false);
        }
      } catch {
        // Fallback: if error querying session, show prompt safely
        if (isMounted) {
          timer = setTimeout(() => {
            if (isMounted) {
              setIsOpen(true);
            }
          }, 800);
        }
      }
    };

    checkAuthAndPrompt();

    // Listen for auth state changes (e.g. if user signs in/out elsewhere)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        try {
          sessionStorage.removeItem('nestora_home_auth_dismissed');
        } catch {}
        if (isMounted) {
          checkAuthAndPrompt();
        }
      } else if (session?.user && isMounted) {
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!adminRecord && isMounted) {
          setIsOpen(false);
        }
      }
    });

    const handleAuthChange = () => {
      if (isMounted) {
        checkAuthAndPrompt();
      }
    };

    window.addEventListener('nestora_auth_changed', handleAuthChange);

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
      window.removeEventListener('nestora_auth_changed', handleAuthChange);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('nestora_home_auth_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Welcome to Nestora"
      subtitle="Discover verified student stays near your college. Sign in to access your saved stays, contact owners directly, and get zero brokerage."
      nextParam="/"
      onSuccess={handleClose}
    />
  );
}
