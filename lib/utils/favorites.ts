'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

const STORAGE_KEY = 'nestora_saved_properties';

export function getLocalSavedPropertyIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setLocalSavedPropertyIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event('nestora_saved_updated'));
  } catch {
    // ignore
  }
}

/**
 * Toggle favorite on client (works seamlessly offline or authenticated)
 */
export async function toggleSavedProperty(id: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const currentLocal = getLocalSavedPropertyIds();
  const willSave = !currentLocal.includes(id);

  let updatedLocal: string[];
  if (willSave) {
    updatedLocal = [...new Set([...currentLocal, id])];
  } else {
    updatedLocal = currentLocal.filter((item) => item !== id);
  }

  setLocalSavedPropertyIds(updatedLocal);

  // If user is authenticated, sync mutation with public.favorites
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (willSave) {
        await supabase
          .from('favorites')
          .upsert({ user_id: user.id, property_id: id }, { onConflict: 'user_id,property_id' });
      } else {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', id);
      }
    }
  } catch (err) {
    console.error('Failed to sync favorite with Supabase:', err);
  }

  return willSave;
}

// Shared in-flight promise to prevent concurrent calls spamming Supabase
let inFlightFavoritesSync: Promise<string[]> | null = null;

async function syncFavoritesWithServer(localIds: string[]): Promise<string[]> {
  if (inFlightFavoritesSync) {
    return inFlightFavoritesSync;
  }

  inFlightFavoritesSync = (async () => {
    try {
      // Timeout guard in case mobile connection or auth check stalls
      const authPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: { user: null }, error: new Error('Auth timeout') }), 4000)
      );

      const { data: { user } } = await Promise.race([authPromise, timeoutPromise]);
      if (!user) {
        return localIds;
      }

      // Fetch server favorites with timeout guard
      const fetchPromise = supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);
      const fetchTimeout = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('Fetch timeout') }), 4000)
      );

      const { data: serverRows, error: fetchErr } = await Promise.race([fetchPromise, fetchTimeout]);
      if (fetchErr || !serverRows) {
        return localIds;
      }

      const serverIds = serverRows.map((r: { property_id: string }) => r.property_id);

      // Merge local favorites to server if there are unsynced local ones
      const missingOnServer = localIds.filter((id) => !serverIds.includes(id));
      if (missingOnServer.length > 0) {
        const toInsert = missingOnServer.map((pid) => ({
          user_id: user.id,
          property_id: pid,
        }));
        await supabase.from('favorites').upsert(toInsert, { onConflict: 'user_id,property_id' });
      }

      const combined = [...new Set([...serverIds, ...localIds])];
      setLocalSavedPropertyIds(combined);
      return combined;
    } catch (err) {
      console.error('Favorites server sync error:', err);
      return localIds;
    } finally {
      inFlightFavoritesSync = null;
    }
  })();

  return inFlightFavoritesSync;
}

export function useSavedProperties() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initFavorites() {
      const localIds = getLocalSavedPropertyIds();
      if (isMounted) setSavedIds(localIds);

      try {
        const synced = await syncFavoritesWithServer(localIds);
        if (isMounted) {
          setSavedIds(synced);
        }
      } catch (err) {
        console.error('Failed to init favorites:', err);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    initFavorites();

    const handleUpdate = () => {
      setSavedIds(getLocalSavedPropertyIds());
    };

    window.addEventListener('nestora_saved_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Also listen to auth changes so favorites auto-merge on login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        initFavorites();
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener('nestora_saved_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      subscription.unsubscribe();
    };
  }, []);

  const toggle = (id: string) => {
    return toggleSavedProperty(id);
  };

  const isSaved = (id: string) => savedIds.includes(id);

  return {
    savedIds,
    count: savedIds.length,
    isSaved,
    toggle,
    isLoaded,
  };
}
