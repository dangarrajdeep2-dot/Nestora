import { MetadataRoute } from 'next';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nestora.in';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    if (isSupabaseConfigured) {
      const { data: properties } = await supabase.from('properties').select('id, updated_at');
      if (properties && properties.length > 0) {
        const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
          url: `${baseUrl}/property/${p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
        return [...staticRoutes, ...propertyRoutes];
      }
    }
  } catch (err) {
    console.warn('Error generating sitemap:', err);
  }

  return staticRoutes;
}
