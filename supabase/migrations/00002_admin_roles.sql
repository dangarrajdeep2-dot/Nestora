-- ============================================================================
-- Migration: 00002_admin_roles.sql
-- Phase 2: Admin Roles Infrastructure & Least-Privilege Listing CRUD
-- ============================================================================

-- 1. Create Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS and Restrict Access to admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.admin_users TO authenticated;

DROP POLICY IF EXISTS "Admins can view their own status" ON public.admin_users;
CREATE POLICY "Admins can view their own status" 
ON public.admin_users FOR SELECT TO authenticated 
USING (auth.uid() = id);

-- 3. Create Hardened Admin Validation Helper Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = auth.uid()
    );
$$;

-- Restrict function execution
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- 4. Grant Listing Mutation Privileges to Authenticated Role
-- (RLS strictly enforces that only users satisfying public.is_admin() can execute these)
GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.owners TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.colleges TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_amenities TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.food_details TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.house_rules TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_images TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.enquiries TO authenticated;

-- 5. Properties Admin Policies
DROP POLICY IF EXISTS "Admins can select all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;
CREATE POLICY "Admins can select all properties" ON public.properties FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update properties" ON public.properties FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete properties" ON public.properties FOR DELETE TO authenticated USING (public.is_admin());

-- 6. Owners Admin Policies
DROP POLICY IF EXISTS "Admins can select all owners" ON public.owners;
DROP POLICY IF EXISTS "Admins can insert owners" ON public.owners;
DROP POLICY IF EXISTS "Admins can update owners" ON public.owners;
DROP POLICY IF EXISTS "Admins can delete owners" ON public.owners;
CREATE POLICY "Admins can select all owners" ON public.owners FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert owners" ON public.owners FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update owners" ON public.owners FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete owners" ON public.owners FOR DELETE TO authenticated USING (public.is_admin());

-- 7. Colleges Admin Policies
DROP POLICY IF EXISTS "Admins can select all colleges" ON public.colleges;
DROP POLICY IF EXISTS "Admins can insert colleges" ON public.colleges;
DROP POLICY IF EXISTS "Admins can update colleges" ON public.colleges;
DROP POLICY IF EXISTS "Admins can delete colleges" ON public.colleges;
CREATE POLICY "Admins can select all colleges" ON public.colleges FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert colleges" ON public.colleges FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update colleges" ON public.colleges FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete colleges" ON public.colleges FOR DELETE TO authenticated USING (public.is_admin());

-- 8. Rooms Admin Policies
DROP POLICY IF EXISTS "Admins can select all rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can delete rooms" ON public.rooms;
CREATE POLICY "Admins can select all rooms" ON public.rooms FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update rooms" ON public.rooms FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete rooms" ON public.rooms FOR DELETE TO authenticated USING (public.is_admin());

-- 9. Property Amenities Admin Policies
DROP POLICY IF EXISTS "Admins can select all property_amenities" ON public.property_amenities;
DROP POLICY IF EXISTS "Admins can insert property_amenities" ON public.property_amenities;
DROP POLICY IF EXISTS "Admins can update property_amenities" ON public.property_amenities;
DROP POLICY IF EXISTS "Admins can delete property_amenities" ON public.property_amenities;
CREATE POLICY "Admins can select all property_amenities" ON public.property_amenities FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert property_amenities" ON public.property_amenities FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update property_amenities" ON public.property_amenities FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete property_amenities" ON public.property_amenities FOR DELETE TO authenticated USING (public.is_admin());

-- 10. Food Details Admin Policies
DROP POLICY IF EXISTS "Admins can select all food_details" ON public.food_details;
DROP POLICY IF EXISTS "Admins can insert food_details" ON public.food_details;
DROP POLICY IF EXISTS "Admins can update food_details" ON public.food_details;
DROP POLICY IF EXISTS "Admins can delete food_details" ON public.food_details;
CREATE POLICY "Admins can select all food_details" ON public.food_details FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert food_details" ON public.food_details FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update food_details" ON public.food_details FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete food_details" ON public.food_details FOR DELETE TO authenticated USING (public.is_admin());

-- 11. House Rules Admin Policies
DROP POLICY IF EXISTS "Admins can select all house_rules" ON public.house_rules;
DROP POLICY IF EXISTS "Admins can insert house_rules" ON public.house_rules;
DROP POLICY IF EXISTS "Admins can update house_rules" ON public.house_rules;
DROP POLICY IF EXISTS "Admins can delete house_rules" ON public.house_rules;
CREATE POLICY "Admins can select all house_rules" ON public.house_rules FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert house_rules" ON public.house_rules FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update house_rules" ON public.house_rules FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete house_rules" ON public.house_rules FOR DELETE TO authenticated USING (public.is_admin());

-- 12. Property Images Admin Policies
DROP POLICY IF EXISTS "Admins can select all property_images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can insert property_images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can update property_images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can delete property_images" ON public.property_images;
CREATE POLICY "Admins can select all property_images" ON public.property_images FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert property_images" ON public.property_images FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update property_images" ON public.property_images FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete property_images" ON public.property_images FOR DELETE TO authenticated USING (public.is_admin());

-- 13. Enquiries Admin Policies (SELECT, UPDATE, DELETE only)
DROP POLICY IF EXISTS "Admins can select all enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can delete enquiries" ON public.enquiries;
CREATE POLICY "Admins can select all enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete enquiries" ON public.enquiries FOR DELETE TO authenticated USING (public.is_admin());
