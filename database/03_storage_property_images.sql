-- ============================================================================
-- Migration / Setup: 03_storage_property_images.sql
-- Purpose: Setup Supabase Storage Bucket for Property Photos
-- Access Rules:
--   - Public SELECT: Anyone (students, visitors, anon) can view/download images.
--   - Authenticated Admin INSERT/DELETE: Only verified admins can upload/delete.
-- ============================================================================

-- 1. Create the public 'property-images' storage bucket if it does not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-images',
    'property-images',
    true,
    5242880, -- 5 MB limit per image
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 2. Storage Policies

-- A. Public read access: anyone can view photos in the property-images bucket
DROP POLICY IF EXISTS "Public property images viewable" ON storage.objects;
CREATE POLICY "Public property images viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- B. Authenticated Admin upload: only users with is_admin() = true can upload
DROP POLICY IF EXISTS "Admins can upload property images" ON storage.objects;
CREATE POLICY "Admins can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'property-images' AND
    public.is_admin()
);

-- C. Authenticated Admin delete: only users with is_admin() = true can delete
DROP POLICY IF EXISTS "Admins can delete property images" ON storage.objects;
CREATE POLICY "Admins can delete property images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'property-images' AND
    public.is_admin()
);
