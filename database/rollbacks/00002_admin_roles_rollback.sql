-- ============================================================================
-- Safe Rollback Script: 00002_admin_roles_rollback.sql
-- Purpose: Safely reverses Phase 2 Admin changes outside migration chain.
-- Uses RESTRICT to protect against cascading drops of unexpected objects.
-- GUARANTEE: Does NOT revoke SELECT on directory tables or INSERT on enquiries.
-- ============================================================================

-- 1. Drop Phase 2 Admin Policies
DROP POLICY IF EXISTS "Admins can select all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;

DROP POLICY IF EXISTS "Admins can select all owners" ON public.owners;
DROP POLICY IF EXISTS "Admins can insert owners" ON public.owners;
DROP POLICY IF EXISTS "Admins can update owners" ON public.owners;
DROP POLICY IF EXISTS "Admins can delete owners" ON public.owners;

DROP POLICY IF EXISTS "Admins can select all colleges" ON public.colleges;
DROP POLICY IF EXISTS "Admins can insert colleges" ON public.colleges;
DROP POLICY IF EXISTS "Admins can update colleges" ON public.colleges;
DROP POLICY IF EXISTS "Admins can delete colleges" ON public.colleges;

DROP POLICY IF EXISTS "Admins can select all rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can delete rooms" ON public.rooms;

DROP POLICY IF EXISTS "Admins can select all property_amenities" ON public.property_amenities;
DROP POLICY IF EXISTS "Admins can insert property_amenities" ON public.property_amenities;
DROP POLICY IF EXISTS "Admins can update property_amenities" ON public.property_amenities;
DROP POLICY IF EXISTS "Admins can delete property_amenities" ON public.property_amenities;

DROP POLICY IF EXISTS "Admins can select all food_details" ON public.food_details;
DROP POLICY IF EXISTS "Admins can insert food_details" ON public.food_details;
DROP POLICY IF EXISTS "Admins can update food_details" ON public.food_details;
DROP POLICY IF EXISTS "Admins can delete food_details" ON public.food_details;

DROP POLICY IF EXISTS "Admins can select all house_rules" ON public.house_rules;
DROP POLICY IF EXISTS "Admins can insert house_rules" ON public.house_rules;
DROP POLICY IF EXISTS "Admins can update house_rules" ON public.house_rules;
DROP POLICY IF EXISTS "Admins can delete house_rules" ON public.house_rules;

DROP POLICY IF EXISTS "Admins can select all property_images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can insert property_images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can update property_images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can delete property_images" ON public.property_images;

DROP POLICY IF EXISTS "Admins can select all enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can delete enquiries" ON public.enquiries;

-- 2. Revoke only Phase 2 mutation privileges from authenticated
-- NOTE: Preserves student Phase 1 SELECT on directory tables and INSERT on enquiries
REVOKE INSERT, UPDATE, DELETE ON public.properties, public.owners, public.colleges, 
       public.rooms, public.property_amenities, public.food_details, 
       public.house_rules, public.property_images 
FROM authenticated;

REVOKE SELECT, UPDATE, DELETE ON public.enquiries FROM authenticated;

-- 3. Drop Admin Function (RESTRICT halts execution if unexpected dependents exist)
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM authenticated, service_role;
DROP FUNCTION IF EXISTS public.is_admin() RESTRICT;

-- 4. Drop Admin Users Table (RESTRICT halts execution if unexpected foreign keys exist)
DROP POLICY IF EXISTS "Admins can view their own status" ON public.admin_users;
REVOKE SELECT ON public.admin_users FROM authenticated;
DROP TABLE IF EXISTS public.admin_users RESTRICT;
