# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Create a new project
4. Copy the project URL and API keys

## 2. Environment Variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get these from Supabase dashboard → Project Settings → API.

## 3. Create Database Tables

1. In Supabase, go to SQL Editor
2. Paste the contents of `lib/supabase/schema.sql`
3. Run the SQL

## 4. Initialize Data

For single-row tables (profiles, contact), insert an initial row:

```sql
INSERT INTO profiles (id, name, designation, company) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Mirza Asif Iqbal', 'Zonal Manager', 'Radiant Pharmaceuticals Ltd.');

INSERT INTO contact (id, email, phone, linkedin, location) VALUES
  ('00000000-0000-0000-0000-000000000002', 'email@radiant.com', '+88-123-456-789', 'https://linkedin.com/in/mirza', 'Bogura, Bangladesh');
```

## 5. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 6. Test CRUD

1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000/admin/login`
3. Click "Open admin UI preview" (no sign-in required yet)
4. Try adding, editing, and deleting records
5. Check Supabase dashboard to verify data is persisted

## 7. Public Website

The public website now fetches data dynamically:
- Statistics, career, expertise, team, etc. are pulled from the database
- Only active records are shown (is_active = true)
- If Supabase is unreachable, fallback to placeholder data from lib/data.ts

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` is NEVER sent to the browser (only used in server actions)
- Public queries use the ANON_KEY and can only read public data
- Row-Level Security (RLS) can be added to enforce admin-only access
- File uploads to Storage require auth + signed URLs (implemented in phase 2)

## Troubleshooting

- "Supabase env vars required" → Check .env.local exists and has correct keys
- Foreign key errors → Ensure regions exist before adding territories/team members
- Display order issues → Use 0-based or 1-based consistently
