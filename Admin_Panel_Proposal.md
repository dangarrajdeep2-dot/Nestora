# Nestora Admin Panel: Detailed Implementation Proposal (Revised)

## 1. Authorization Flow & Admin Creation (Self-Promotion Prevention)

**Security Requirement:** Users must NEVER be able to grant themselves admin privileges via the client or API.

- **Admin Table Lock:** The `admin_users` table will NOT have any `INSERT`, `UPDATE`, or `DELETE` RLS policies. It will strictly have a `SELECT` policy allowing a user to read ONLY their own row.
- **First Admin Creation:** The first authorized admin (and all subsequent admins) MUST be created securely via the database owner. This is done by manually executing an insert via the Supabase SQL Editor or a direct PostgreSQL connection:
  ```sql
  -- Manual execution by database owner only
  INSERT INTO admin_users (id, email) 
  VALUES ('<uuid-of-existing-auth-user>', 'team@nestora.com');
  ```
- By lacking client-side write access to `admin_users`, the system is mathematically immune to privilege escalation from ordinary authenticated users.

## 2. Preventing Recursive RLS Checks

In PostgreSQL, RLS policies that query the same table they protect (or circularly query tables that query back) cause infinite recursion errors.

To avoid this, we design the `admin_users` policy simply:
```sql
CREATE POLICY "Users can read own admin status" ON admin_users FOR SELECT USING (auth.uid() = id);
```
When we secure other tables (like `properties`), we use:
```sql
CREATE POLICY "Admins can manage properties" ON properties FOR ALL 
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
```
**Why this is safe and non-recursive:** 
When an admin queries `properties`, Postgres checks the `EXISTS` subquery. This subquery runs a `SELECT` on `admin_users` for the user's `auth.uid()`. Since the policy on `admin_users` strictly permits `auth.uid() = id` (which is true), it evaluates successfully without querying `properties` or requiring any `SECURITY DEFINER` bypass functions.

## 3. Complete Migration SQL (00002_admin_roles.sql)

This SQL appends to the Phase 1 setup. It does not alter existing public policies.

```sql
-- 1. Create Admin Users Table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS and prevent unauthorized writes
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Strict SELECT: User can only read if they exist in the table, preventing recursion
CREATE POLICY "Users can read own admin status" 
ON admin_users FOR SELECT 
USING (auth.uid() = id);

-- (No INSERT, UPDATE, or DELETE policies are created for admin_users. Writes require postgres role)

-- 3. Append Admin CRUD Policies to Core Tables
-- Using FOR ALL covers SELECT, INSERT, UPDATE, DELETE. 
-- Explicitly defining USING (for read/update/delete) and WITH CHECK (for insert/update) prevents moving records into unauthorized states.

CREATE POLICY "Admins can manage properties" ON properties FOR ALL 
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage rooms" ON rooms FOR ALL 
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage owners" ON owners FOR ALL 
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage colleges" ON colleges FOR ALL 
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage property_amenities" ON property_amenities FOR ALL 
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage food_details" ON food_details FOR ALL 
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage house_rules" ON house_rules FOR ALL 
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage property_images" ON property_images FOR ALL 
USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
```

## 4. Preservation of Public Security

- **Public Policies Unchanged:** The `SELECT` policies from `02_phase1_security_final.sql` are left untouched.
- **Owner Privacy:** The policy `CREATE POLICY "Active owners viewable." ON owners FOR SELECT USING (id IN (SELECT owner_id FROM properties WHERE verification IN ('verified', 'demo')));` remains the only way the public can see owners. Therefore, phone/WhatsApp details of unverified owners, or owners without active properties, remain hidden from the API and frontend.

## 5. Visibility Behavior Explained

The existing `verification` ENUM dictates public visibility via Phase 1 RLS:
- **`'verified'`**: The property satisfies `verification IN ('verified', 'demo')`. It is fully accessible via public API (`/api/test_listings`, `getProperties()`). Owner details become visible.
- **`'demo'`**: Acts exactly like `'verified'` for RLS visibility. Primarily used to flag mock/test data for UI distinctions.
- **`'unverified'` (Archived)**: The property fails the public RLS check. It vanishes instantly from student searches, map markers, and direct property link access (`/property/[id]`). It can only be seen by `admin_users` via the new Admin CRUD policy. **This is the preferred method for "deleting" a property to preserve historical enquiries and favorites.**

## 6. Foreign-Key Deletion Effects

- **Property Cascades:** Deleting a record from `properties` triggers `ON DELETE CASCADE` for: `rooms`, `property_amenities`, `food_details`, `house_rules`, `property_images`, `reviews`, `enquiries`, and `favorites`. The wipe is clean.
- **Non-Cascading Entities:** Deleting an `owner` or a `college` that is referenced by a property will fail at the PostgreSQL constraint level, preventing orphaned properties. 
- **Recommendation:** Admin UI will strongly encourage archiving (`verification = 'unverified'`) over permanent deletion to prevent accidental loss of historical data (like enquiries and reviews).

## 7. Exact File-Change Plan

1. **`package.json`**:
   - `npm install @supabase/ssr`
2. **`middleware.ts`**: 
   - Intercept `/admin/:path*`. Fetch session via `@supabase/ssr`. 
   - Query `admin_users` table.
   - Redirect to `/admin/login` on failure.
3. **`lib/supabase/server.ts`**:
   - Create SSR client `createClient` implementation mapping Next.js `cookies()`.
4. **`lib/actions/admin.ts`**:
   - Export Next.js Server Actions: `createListing`, `updateListing`, `archiveListing`, `deleteListing`.
   - Uses the authenticated `createServerClient` (No service-role needed).
5. **`app/admin/layout.tsx`**: Shell/Sidebar.
6. **`app/admin/login/page.tsx`**: Email/Password Auth.
7. **`app/admin/properties/page.tsx`**: Admin Listing Dashboard.
8. **`app/admin/properties/[id]/edit/page.tsx`**: Editing Interface with status toggles.

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` (Required, Existing)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Required, Existing)

### Test Plan
1. **Unauthorized Access:** Open `/admin/properties` in an incognito window. Verify redirect to `/admin/login`.
2. **Self-Promotion:** Authenticate as a standard student. Attempt to access `/admin/properties`. Verify redirect/403. Attempt to run `supabase.from('admin_users').insert(...)` from browser console. Verify RLS rejection.
3. **Listing CRUD & Visibility:** 
   - Login as Admin. Create a new property set to `'unverified'`.
   - Open student frontend. Verify property is hidden.
   - Edit property to `'verified'`. Verify property appears on frontend.
   - Delete property. Verify database cascading cleanup.
