-- Migration 05: Public Insert & Admin Management Policies for Reviews
-- Allows students to submit ratings/reviews and admins to moderate them

-- 1. Ensure Table Grants
GRANT SELECT, INSERT ON reviews TO anon, authenticated;
GRANT ALL ON reviews TO service_role;

-- 2. Ensure Row Level Security is active
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 3. Drop conflicting policies if previously created
DROP POLICY IF EXISTS "Reviews viewable by everyone." ON reviews;
DROP POLICY IF EXISTS "Public reviews are viewable by everyone." ON reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Admins have full access to reviews" ON reviews;

-- 4. Public can read all reviews
CREATE POLICY "Reviews viewable by everyone." ON reviews 
  FOR SELECT USING (true);

-- 5. Any student visitor can insert a review
CREATE POLICY "Anyone can insert reviews" ON reviews 
  FOR INSERT WITH CHECK (true);

-- 6. Admins can update verification status and delete reviews
CREATE POLICY "Admins have full access to reviews" ON reviews 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));
