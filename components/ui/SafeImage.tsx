'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

export const FALLBACK_PROPERTY_IMAGE =
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80';

// Known domains configured in next.config.ts
const CONFIGURED_NEXT_DOMAINS = [
  'images.unsplash.com',
  'plus.unsplash.com',
  'unpkg.com',
  'lh3.googleusercontent.com',
  'drive.google.com',
];

/**
 * Checks if a string is an unsupported cloud-drive or web-viewer sharing URL
 */
export function isUnsupportedShareUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.includes('share.google') ||
    trimmed.includes('photos.app.goo.gl') ||
    trimmed.includes('photos.google.com') ||
    trimmed.includes('drive.google.com/drive/folders') ||
    trimmed.includes('drive.google.com/file/d/') ||
    trimmed.includes('drive.google.com/open?') ||
    trimmed.includes('dropbox.com') ||
    trimmed.includes('onedrive.live.com') ||
    trimmed.includes('1drv.ms')
  );
}

/**
 * Checks if a URL appears to be a valid direct image source
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  if (isUnsupportedShareUrl(trimmed)) return false;
  return true;
}

/**
 * Normalizes an image URL, attempting to convert known convertible links
 * or returning fallback if completely unsupported.
 */
export function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_PROPERTY_IMAGE;
  }

  const trimmed = url.trim();

  // If not a valid web URL or root relative path, return fallback
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
    return FALLBACK_PROPERTY_IMAGE;
  }

  // Unsupported shortlinks that cannot be resolved as direct image binaries
  if (trimmed.includes('share.google') || trimmed.includes('photos.app.goo.gl') || trimmed.includes('photos.google.com')) {
    return FALLBACK_PROPERTY_IMAGE;
  }

  // Convert Google Drive share link to direct thumbnail if possible
  if (trimmed.includes('drive.google.com')) {
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }
    return FALLBACK_PROPERTY_IMAGE;
  }

  return trimmed;
}

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
  fallbackSrc?: string;
}

/**
 * SafeImage component that gracefully falls back if an image fails to load,
 * is an invalid URL, or originates from an unconfigured host, ensuring the page NEVER crashes.
 */
export function SafeImage({
  src,
  alt = 'Property photo',
  fallbackSrc = FALLBACK_PROPERTY_IMAGE,
  fill,
  className,
  priority,
  sizes,
  unoptimized,
  ...rest
}: SafeImageProps) {
  const [errorSrc, setErrorSrc] = useState<string | null>(null);
  const sanitized = sanitizeImageUrl(src);
  const currentSrc = errorSrc === sanitized ? fallbackSrc : sanitized;

  const handleError = () => {
    if (errorSrc !== sanitized) {
      console.warn('[SafeImage] Image failed to load, falling back to placeholder:', sanitized);
      setErrorSrc(sanitized);
    }
  };

  // Determine if hostname is configured in Next.js remotePatterns
  let isConfiguredInNext = false;
  let isSupabaseStorage = false;
  try {
    const parsed = new URL(currentSrc);
    const host = parsed.hostname.toLowerCase();
    isSupabaseStorage = host.endsWith('.supabase.co');
    isConfiguredInNext =
      CONFIGURED_NEXT_DOMAINS.some((d) => host === d || host.endsWith('.' + d)) ||
      isSupabaseStorage;
  } catch {
    isConfiguredInNext = false;
    isSupabaseStorage = false;
  }

  // If host is configured in Next.js, use <Image>
  if (isConfiguredInNext) {
    return (
      <Image
        {...rest}
        src={currentSrc}
        alt={alt}
        fill={fill}
        className={className}
        priority={priority}
        sizes={sizes}
        unoptimized={unoptimized ?? isSupabaseStorage}
        onError={handleError}
      />
    );
  }

  // If host is external/unconfigured, use standard <img> with identical layout props to prevent Next.js hostname throw
  const style: React.CSSProperties = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: 'cover',
      }
    : {};

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      style={style}
      onError={handleError}
    />
  );
}
