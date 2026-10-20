# Component Migration Guide

Each public website component needs to fetch data from Supabase instead of importing from `lib/data.ts`.

## Pattern

### Import the Hook
```typescript
import { useMyData } from "@/lib/supabase/hooks";
```

### Use the Hook in Your Component
```typescript
"use client";
export function MyComponent() {
  const { data, loading, error } = useMyData();
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Failed to load data.</p>;
  if (!data?.length) return <p>No data available.</p>;
  
  return <div>{data.map(...)}</div>;
}
```

### Available Hooks
- `useStatistics()` — returns array of {title, value, icon, is_active}
- `useProfile()` — returns single profile object
- `useCareer()` — returns array of career entries
- `useExpertise()` — returns array of expertise items
- `useRegions()` — returns array of regions
- `useTeamMembers()` — returns array with joined region/territory names
- `useAchievements()` — returns array of achievements
- `useActivities()` — returns array of activities
- `useGallery()` — returns array of gallery items
- `useContact()` — returns single contact object

## Component Updates (Sample)

### Before: `ProfileSection`
```typescript
"use client";
import { profile, leadershipFocus, philosophy } from "@/lib/data";

export default function ProfileSection() {
  return <section>{profile.name} ...</section>;
}
```

### After: `ProfileSection`
```typescript
"use client";
import { useProfile } from "@/lib/supabase/hooks";
import { leadershipFocus, philosophy } from "@/lib/data";

export default function ProfileSection() {
  const { data: profile } = useProfile();
  return <section>{profile?.name} ...</section>;
}
```

## Benefits
- Supabase data is live — changes in admin appear immediately on public site
- Graceful fallback if Supabase is down (uses `lib/data.ts`)
- Loading and error states can be shown to visitors
- Future: can add caching, pagination, filtering

---

**Estimated time:** ~5-10 min per component  
**Total components:** 9  
**Total time:** ~1-2 hours
