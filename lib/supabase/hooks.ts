// Client-side hooks for fetching public data from Supabase.
// Includes fallback to lib/data.ts if Supabase is unavailable.
"use client";
import { useEffect, useState } from "react";
import * as queries from "./queries";
import * as fallback from "@/lib/data";

function useSupabaseData<T>(fetcher: () => Promise<T>, fb: T) {
  const [data, setData] = useState<T>(fb);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetcher()
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { 
        console.error("Data fetch failed, using fallback:", e);
        setData(fb);
        setError(e instanceof Error ? e.message : "Unknown error");
        setLoading(false);
      });
  }, []);
  return { data, loading, error };
}

export function useStatistics() {
  return useSupabaseData(queries.getStatistics, fallback.stats.map((s) => ({ title: s.label, value: s.value, icon: s.icon, is_active: true })));
}

export function useProfile() {
  return useSupabaseData(queries.getProfile, { name: fallback.profile.name, designation: fallback.profile.role });
}

export function useCareer() {
  return useSupabaseData(queries.getCareer, fallback.career);
}

export function useExpertise() {
  return useSupabaseData(queries.getExpertise, fallback.expertise.map((e) => ({ title: e.title, description: e.description, icon: e.icon, is_active: true })));
}

export function useRegions() {
  return useSupabaseData(queries.getRegions, fallback.regions);
}

export function useTeamMembers() {
  return useSupabaseData(queries.getTeamMembers, fallback.teamMembers);
}

export function useTerritories() {
  return useSupabaseData(() => queries.getTerritories(), []);
}

export function useAchievements() {
  return useSupabaseData(queries.getAchievements, []); // fallback.achievements is demo-only placeholder data — never show it as real
}

export function useActivities() {
  return useSupabaseData(queries.getActivities, fallback.activities);
}

export function useGallery() {
  return useSupabaseData(queries.getGallery, []); // no placeholder gallery items — show nothing rather than fake photos
}

export function useContact() {
  return useSupabaseData(queries.getContact, fallback.contact);
}
