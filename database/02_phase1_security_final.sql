-- Nestora Phase 1 Security Migration: Final Lockdown
-- Strictly Read-Only Directory & Write-Only Enquiries

-- 1. CLEANUP EXPLICIT COLUMN-LEVEL PRIVILEGES
-- Safely iterates and revokes any explicit column-level grants from standard API roles
-- without affecting table-level grants or overriding postgres/service_role privileges.
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN 
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name IN ('properties', 'colleges', 'rooms', 'owners', 'property_amenities', 'food_details', 'house_rules', 'property_images', 'reviews', 'enquiries')
    LOOP 
        EXECUTE format('REVOKE ALL (%I) ON %I FROM anon, authenticated, PUBLIC;', r.column_name, r.table_name);
    END LOOP; 
END $$;

-- 2. REVOKE ALL UNNECESSARY TABLE-LEVEL PRIVILEGES
-- Prevents inherited UPDATE/DELETE/REFERENCES from PUBLIC. 
-- Does NOT affect postgres, service_role, or table ownership.
REVOKE ALL ON properties, colleges, rooms, owners, property_amenities, food_details, house_rules, property_images, reviews, enquiries FROM anon, authenticated, PUBLIC;

-- 3. RE-GRANT STRICT LEAST-PRIVILEGE ACCESS
-- Directory tables strictly limited to reads
GRANT SELECT ON properties TO anon, authenticated;
GRANT SELECT ON colleges TO anon, authenticated;
GRANT SELECT ON rooms TO anon, authenticated;
GRANT SELECT ON owners TO anon, authenticated;
GRANT SELECT ON property_amenities TO anon, authenticated;
GRANT SELECT ON food_details TO anon, authenticated;
GRANT SELECT ON house_rules TO anon, authenticated;
GRANT SELECT ON property_images TO anon, authenticated;
GRANT SELECT ON reviews TO anon, authenticated;

-- Enquiries strictly limited to writes (Prevents reading other student's enquiries)
GRANT INSERT ON enquiries TO anon, authenticated;

-- 4. ENSURE ROW LEVEL SECURITY IS ACTIVE
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- 5. DROP LEGACY PERMISSIVE POLICIES
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
DROP POLICY IF EXISTS "Users can view their own enquiries" ON enquiries;

-- Drop newly created policies to ensure idempotency (safe rerunnability)
DROP POLICY IF EXISTS "Approved properties viewable." ON properties;
DROP POLICY IF EXISTS "Approved colleges viewable." ON colleges;
DROP POLICY IF EXISTS "Active owners viewable." ON owners;
DROP POLICY IF EXISTS "Approved rooms viewable." ON rooms;
DROP POLICY IF EXISTS "Approved amenities viewable." ON property_amenities;
DROP POLICY IF EXISTS "Approved food viewable." ON food_details;
DROP POLICY IF EXISTS "Approved rules viewable." ON house_rules;
DROP POLICY IF EXISTS "Approved images viewable." ON property_images;
DROP POLICY IF EXISTS "Approved reviews viewable." ON reviews;
DROP POLICY IF EXISTS "Validated insert for enquiries" ON enquiries;

-- 6. CREATE SECURE ROW LEVEL SECURITY POLICIES
-- NOTE ON PRIVACY: 'Active owners viewable' exposes owner phone and whatsapp to the public anon role
-- for any property with 'verified' or 'demo' status. This is currently required by the frontend API contract
-- (`owners(*)`). A safe alternative in a future Phase would be to mask these fields in a PostgreSQL View,
-- or implement a secure backend proxy to initiate contact without leaking numbers to the client.

CREATE POLICY "Approved properties viewable." ON properties FOR SELECT USING (verification IN ('verified', 'demo'));
CREATE POLICY "Approved colleges viewable." ON colleges FOR SELECT USING (verification IN ('verified', 'demo'));
CREATE POLICY "Active owners viewable." ON owners FOR SELECT USING (id IN (SELECT owner_id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved rooms viewable." ON rooms FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved amenities viewable." ON property_amenities FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved food viewable." ON food_details FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved rules viewable." ON house_rules FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved images viewable." ON property_images FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));
CREATE POLICY "Approved reviews viewable." ON reviews FOR SELECT USING (property_id IN (SELECT id FROM properties WHERE verification IN ('verified', 'demo')));

-- Strict payload validation locking down the enquiries insertion endpoint
CREATE POLICY "Validated insert for enquiries" 
ON enquiries FOR INSERT 
WITH CHECK (
    property_id IS NOT NULL AND
    length(trim(student_name)) > 0 AND length(student_name) <= 255 AND
    length(trim(student_phone)) >= 10 AND length(student_phone) <= 20 AND
    gender IN ('boys', 'girls', 'co-ed') AND
    length(coalesce(student_college, '')) <= 255 AND
    length(coalesce(message, '')) <= 1000 AND
    status = 'pending' AND
    (user_id IS NULL OR user_id = auth.uid())
);
