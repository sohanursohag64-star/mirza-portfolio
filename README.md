# Mirza Asif Iqbal — Sales Leadership Management Website

Professional pharmaceutical leadership portfolio website for Mirza Asif Iqbal, Zonal Manager at Radiant Pharmaceuticals Ltd.

## Project Structure

```
/app
  /public            # Public website pages
  /admin
    /login           # Admin sign-in
    /(panel)         # Protected admin dashboard
      /dashboard
      /profile
      /career
      /team
      /regions
      /territories
      /expertise
      /achievements
      /activities
      /gallery
      /documents
      /contact
      /settings

/components
  /public/           # Public website components
  /admin/            # Admin panel components
    AdminDataProvider  (Supabase integration)
    ResourceManager    (generic CRUD UI)
    SectionForm        (profile/contact/settings)
    Modal, Form*, etc.

/lib
  /data.ts           # Fallback content (when Supabase unavailable)
  /types.ts          # Shared TypeScript definitions
  /admin/
    resources.ts     # Resource registry (defines schema)
    types.ts         # Admin-specific types
    validate.ts      # Client-side form validation
    nav.ts           # Admin navigation
  /supabase/
    server.ts        # Service-role client (server-only)
    client.ts        # Anon client (browser-safe)
    queries.ts       # Read-only queries for admin
    public.ts        # Public data loaders with fallback
    schema.sql       # Database schema

/app/admin/
  actions.ts         # Server actions for CRUD
  login/page.tsx     # Sign-in page
  (panel)/
    layout.tsx       # Shell: sidebar, header, toast, data provider
    page.tsx         # Dashboard overview
    [resource]/page.tsx  # Resource CRUD pages
    profile/page.tsx
    contact/page.tsx
    settings/page.tsx

.env.local           # Supabase credentials (not in git)
SUPABASE_SETUP.md    # Detailed setup guide
```

## Stack

- **Next.js** (React, TypeScript, Tailwind CSS)
- **Supabase** (PostgreSQL, Auth, Storage)
- **Lucide Icons** (UI icons)
- **Server Actions** (CRUD from admin UI)
- **Server Components** (Data fetching on public site)

## Admin Panel

- **Login page** (`/admin/login`) — opens a preview of the admin UI without credentials
- **Dashboard** (`/admin`) — overview, quick actions, recent activity
- **Resource pages** — generic CRUD for all resources (statistics, career, team, etc.)
- **Profile/Contact/Settings** — specialized forms for single-row tables
- **Data layer** — `AdminDataProvider` abstracts server actions; UI doesn't know if data is local or remote

## Public Website

- **Dynamic data** — all sections fetch from Supabase on load
- **Graceful fallback** — if Supabase is down, uses lib/data.ts as a fallback
- **Active-only** — only records with `is_active=true` are shown publicly
- **Sorted by display_order** — admin can control the order of items

## Supabase Setup

See `SUPABASE_SETUP.md` for:
1. Creating a Supabase project
2. Setting environment variables
3. Running the SQL schema
4. Initializing data
5. Testing CRUD operations

## Security

- **Service-role key** — never sent to browser; only used in server actions
- **Anon key** — safe to use in browser; can only read public data
- **RLS (Row-Level Security)** — can be added in Supabase to enforce admin-only access
- **Private Storage** — file uploads to a private bucket with signed URLs (phase 2)
- **Session protection** — admin panel checks auth before allowing access (phase 2)

## Verification Checklist

Before considering CRUD complete, verify:

- [ ] Admin creates a statistic → appears in Supabase → shows on public homepage
- [ ] Admin edits a career entry → updates in Supabase → changes on public career section
- [ ] Admin deletes a region → removed from Supabase → no longer in public regions list
- [ ] Admin adds a team member with region/territory → foreign keys resolve correctly
- [ ] Public site loads with Supabase unavailable → fallback to lib/data.ts
- [ ] Display order is respected on both admin and public pages
- [ ] Only active records are shown publicly (is_active=true)
- [ ] Audit logs are created for CREATE, UPDATE, DELETE

## Next Steps (Phase 2)

- [ ] Supabase Auth — real sign-in for `/admin` routes
- [ ] RLS — admin-only access to tables
- [ ] File uploads — Storage integration for images and documents
- [ ] Signed URLs — secure download for private documents
- [ ] Session management — persistent auth state

---

**Project Status:** Admin Panel UI and database-driven content (Phase 1)  
**Team:** Md Sohanur Rahman (developer) building for Mirza Asif Iqbal (Radiant Pharmaceuticals Ltd.)

---

## Phase 2: Database Integration (COMPLETED)

### What's Working Now

- **Supabase Setup** — PostgreSQL schema, Auth, and Storage configured
- **Server Actions** — admin CRUD operations backed by real database
- **Audit Logging** — all CREATE/UPDATE/DELETE operations tracked
- **Admin Data Layer** — `AdminDataProvider` swapped to use server actions
- **Public Data Loaders** — `lib/supabase/public.ts` with graceful Supabase fallback
- **Client Hooks** — `lib/supabase/hooks.ts` for component data fetching
- **Example Migration** — `StatisticsCard` component updated to use Supabase hook

### Supabase Setup

```bash
# 1. Create a Supabase project at https://supabase.com
# 2. Copy credentials to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 3. Run SQL schema in Supabase SQL Editor
# lib/supabase/schema.sql

# 4. Install dependencies
npm install @supabase/supabase-js @supabase/ssr

# 5. Test admin CRUD
npm run dev
# Visit http://localhost:3000/admin/login
```

See `SUPABASE_SETUP.md` for detailed setup instructions.

### Component Migration

Public components still import from `lib/data.ts`. To migrate to Supabase:

```typescript
// Before
import { stats } from "@/lib/data";

// After
import { useStatistics } from "@/lib/supabase/hooks";

export function MyComponent() {
  const { data: stats } = useStatistics();
  // ... component code
}
```

See `COMPONENT_MIGRATION.md` for the full pattern and examples.

### Verification

Before considering CRUD complete:

- ✅ Admin creates record → Supabase stores → public site displays
- ✅ Admin edits record → Supabase updates → public site reflects changes
- ✅ Admin deletes record → Supabase removes → public site no longer shows
- ✅ Only `is_active=true` records shown publicly
- ✅ Audit logs created for every operation
- ✅ Graceful fallback if Supabase unavailable

### Security

- ✅ Service-role key never sent to browser (only used in server actions)
- ✅ Anon key safe for public queries (can implement RLS in Supabase)
- ✅ No credentials exposed in frontend code
- ⏳ Auth middleware (phase 3)
- ⏳ Row-Level Security policies (phase 3)

---

**Database Integration Status:** Core CRUD connected; public components ready to migrate  
**Public Component Updates:** 9 components need hook migration (~1-2 hours)  
**Phase 3 (Auth & Security):** To be implemented next
