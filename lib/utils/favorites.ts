'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'nestora_saved_properties';

export function getSavedPropertyIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePropertyId(id: string): string[] {
  if (typeof window === 'undefined') return [];
  const current = getSavedPropertyIds();
  if (!current.includes(id)) {
    const updated = [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('nestora_saved_updated'));
    return updated;
  }
  return current;
}

export function removePropertyId(id: string): string[] {
  if (typeof window === 'undefined') return [];
  const current = getSavedPropertyIds();
  const updated = current.filter((item) => item !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('nestora_saved_updated'));
  return updated;
}

export function toggleSavedProperty(id: string): boolean {
  if (typeof window === 'undefined') return false;
  const current = getSavedPropertyIds();
  if (current.includes(id)) {
    removePropertyId(id);
    return false;
  } else {
    savePropertyId(id);
    return true;
  }
}

export function useSavedProperties() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSavedIds(getSavedPropertyIds());
    setIsLoaded(true);

    const handleUpdate = () => {
      setSavedIds(getSavedPropertyIds());
    };

    window.addEventListener('nestora_saved_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('nestora_saved_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
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
