-- Migration: Secure Grants & RLS Policies (Final Hardened Audit)

-- 1. BASE TABLE PRIVILEGES (With strict column-level limits for Users)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON properties TO anon, authenticated;
GRANT SELECT ON colleges TO anon, authenticated;
GRANT SELECT ON rooms TO anon, authenticated;
GRANT SELECT ON owners TO anon, authenticated;
GRANT SELECT ON property_amenities TO anon, authenticated;
GRANT SELECT ON food_details TO anon, authenticated;
GRANT SELECT ON house_rules TO anon, authenticated;
GRANT SELECT ON property_images TO anon, authenticated;
GRANT SELECT ON reviews TO anon, authenticated;

GRANT INSERT ON enquiries TO anon, authenticated;
GRANT SELECT ON enquiries TO authenticated;

GRANT SELECT ON users TO authenticated;
GRANT UPDATE (name, phone, college, avatar_url) ON users TO authenticated;
GRANT SELECT, INSERT, DELETE ON favorites TO authenticated;


-- 2. TIGHTEN ROW LEVEL SECURITY (RLS) POLICIES
-- Drop ALL overly permissive policies defined in initial schema
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON colleges;
DROP POLICY IF EXISTS "Public properties are viewable by everyone." ON properties;
DROP POLICY IF EXISTS "Owners viewable by everyone." ON owners;
DROP POLICY IF EXISTS "Rooms viewable by everyone." ON rooms;
DROP POLICY IF EXISTS "Amenities viewable by everyone." ON property_amenities;
DROP POLICY IF EXISTS "Food details viewable by everyone." ON food_details;
DROP POLICY IF EXISTS "House rules viewable by everyone." ON house_rules;
DROP POLICY IF EXISTS "Property images viewable by everyone." ON property_images;
DROP POLICY IF EXISTS "Reviews viewable by everyone." ON reviews;
DROP POLICY IF EXISTS "Anyone can insert enquiries" ON enquiries;

-- Base properties and colleges visibility
CREATE POLICY "Approved properties viewable." ON properties FOR SELECT USING (verification IN ('verified', 'demo'));
CREATE POLICY "Approved colleges viewable." ON colleges FOR SELECT USING (verification IN ('verified', 'demo'));

-- Cascade visibility to ALL related tables securely
CREATE POLICY "Active owners viewable." ON owners FOR SELECT USING (id IN (SELECT owner_id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved rooms viewable." ON rooms FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved amenities viewable." ON property_amenities FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved food viewable." ON food_details FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved rules viewable." ON house_rules FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved images viewable." ON property_images FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved reviews viewable." ON reviews FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));

-- Secure Enquiries Payload Validation
CREATE POLICY "Validated insert for enquiries" 
ON enquiries FOR INSERT 
WITH CHECK (
    length(trim(student_name)) > 0 AND length(student_name) <= 100 AND
    length(trim(student_phone)) >= 10 AND length(student_phone) <= 20 AND
    length(coalesce(student_college, '')) <= 255 AND
    length(coalesce(message, '')) <= 1000 AND
    status = 'pending'
);


-- without first querying an approved property.
