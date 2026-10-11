# Phase 1: Audit and Secure Implementation Plan

Based on a thorough inspection of the current project structure, package dependencies, frontend application, backend/API routes, and database schema, here is the read-only audit report and the proposed implementation plan for the Nestora Admin Panel.

## 1. Audit Report

### Database & Authentication Providers
- **Database Provider:** Supabase (PostgreSQL).
- **Authentication Provider:** Supabase Auth is present via `@supabase/supabase-js`, though server-side rendering (SSR) session management (like `@supabase/ssr`) is not yet installed for Next.js.
- **Project Framework:** Next.js 16 (App Router), React 19, Tailwind CSS v4, and Leaflet for maps.

### Actual Tables, Columns, and Relationships
The highly relational schema currently consists of:
- **`properties`:** The core table containing location, `type` (`PG`, `Hostel`, `Room`), `gender` (`boys`, `girls`, `co-ed`), pricing, and relations to `owners` and `colleges`.
- **`rooms`:** Linked to `properties`, defining `sharing`, `rent`, and availability.
- **`owners`:** Contains contact details (`phone`, `whatsapp`). Currently mapped via `owner_id` on properties.
- **Associated Details:** `property_amenities`, `food_details`, `house_rules`, `property_images`, `reviews`.
- **User Activity:** `enquiries` (students contacting properties), `users` (students), `favorites`.

### Listing-Status Fields
- Publishing/Unpublishing is naturally handled by the **`verification`** field (an ENUM of `'verified'`, `'unverified'`, `'demo'`). 
- Availability is tracked via the **`is_available_now`** (boolean) field.

### Existing vs. Missing Admin Functionality
- **Existing:** 
  - The database is heavily locked down (RLS policies are strict). Public reads are restricted to `verification IN ('verified', 'demo')`.
  - The frontend has a robust read-only display, search, and filtering mechanism for properties.
  - The `enquiries` table securely accepts unauthenticated inserts with strong payload validation.
- **Missing:**
  - **Admin Authentication:** No secure login portal or role-based access control for team members.
  - **Listing Management (CRUD):** No interface to list, create, edit, or delete properties, rooms, or owners.
  - **Server-Side Security:** No middleware or server-side session checks protecting any `/admin` routes.

---

## 2. Implementation Plan

To adhere to your strict constraints (protecting existing RLS, preserving UI/API contracts, and preventing unauthorized access), I propose the following implementation phases.

### Phase 2: Admin Authentication & Authorization
1. **Provider Update:** We will continue using Supabase Auth. I recommend installing `@supabase/ssr` to handle secure, HttpOnly cookie-based sessions within Next.js Server Components and Server Actions.
2. **Admin Role Enforcement:** We will create an `admin_users` table in the database that links to `auth.users(id)`. Access to the admin panel will be strictly gated on the server by checking if the authenticated user exists in this table.
3. **Route Protection:** A Next.js `middleware.ts` will intercept all requests to `/admin/*`, redirecting unauthorized users to `/admin/login`.

### Phase 3: Listing Management (Backend & UI)
1. **Server Actions (service_role):** Instead of weakening the current RLS policies to allow authenticated users to UPDATE/DELETE, we will create Next.js Server Actions. These actions will verify the user's admin status and then use the Supabase `service_role` key to securely bypass RLS for data mutations.
2. **Dashboard UI:** 
   - A new `/admin/dashboard` showing a table of all properties (including 'unverified' ones).
   - A `/admin/properties/new` and `/admin/properties/[id]/edit` comprehensive form to manage the property, its rooms, amenities, food details, and owner relationships.
3. **State Management:** Using the existing `verification` ENUM, admins can set a listing to `'verified'` (Published) or `'unverified'` (Archived/Unpublished).
4. **Owner Privacy:** Owners can be assigned from the backend without leaking the entire owners table or private contact details to the public API.

### Phase 4: Preserving Existing Functionality
- **No changes** will be made to existing UI routes (`/`, `/search`, `/property/[id]`, etc.) or the public API contracts (`lib/api/properties.ts`).
- **No modifications** will be made to the existing RLS script (`02_phase1_security_final.sql`). It will remain strictly read-only for public/student users.

### Phase 5: Files to be Modified/Created
- `package.json` (add `@supabase/ssr`).
- `supabase/migrations/00002_admin_roles.sql` (new migration for `admin_users`).
- `middleware.ts` (new file for route protection).
- `lib/supabase/server.ts` (new file for SSR Supabase client).
- `app/admin/*` (new layout, dashboard, login, and CRUD forms).
- `lib/actions/admin.ts` (new file for secure Server Actions).

---

## 3. Security Implications of Proposed Migration

The proposed migration (`00002_admin_roles.sql`) will only create a new `admin_users` table. 
- **Security Posture:** It does **not** alter existing RLS policies on the core tables.
- **Risk Mitigation:** By keeping RLS locked down for the `authenticated` role and performing mutations via the Next.js server using the `service_role` key (only after verifying the user against `admin_users`), we ensure zero risk of standard users manipulating data through the client-side API.

---

**Please review this plan.** I am pausing execution here. If you approve, I will begin implementing Phase 2 (Authentication) and the database migration.
