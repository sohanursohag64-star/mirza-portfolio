// Public server-side functions to fetch data for the website.
// These use the anon key and can be called from Server Components.
import * as fallback from "@/lib/data";
import * as queries from "./queries";

// Graceful fallback to lib/data.ts if Supabase is unavailable
export async function loadProfile() {
  try { return await queries.getProfile(); } catch (e) { console.error("Profile load failed, using fallback", e); return { name: fallback.profile.name, designation: fallback.profile.role }; }
}

export async function loadStatistics() {
  try { return await queries.getStatistics(); } catch (e) { console.error("Statistics load failed, using fallback", e); return fallback.stats.map((s) => ({ title: s.label, value: s.value, icon: s.icon, is_active: true })); }
}

export async function loadCareer() {
  try { return await queries.getCareer(); } catch (e) { console.error("Career load failed, using fallback", e); return fallback.career; }
}

export async function loadExpertise() {
  try { return await queries.getExpertise(); } catch (e) { console.error("Expertise load failed, using fallback", e); return fallback.expertise.map((e) => ({ title: e.title, description: e.description, icon: e.icon, is_active: true })); }
}

export async function loadRegions() {
  try { return await queries.getRegions(); } catch (e) { console.error("Regions load failed, using fallback", e); return fallback.regions; }
}

export async function loadTeamMembers() {
  try { return await queries.getTeamMembers(); } catch (e) { console.error("Team load failed, using fallback", e); return fallback.teamMembers; }
}

export async function loadTerritories() {
  try { return await queries.getTerritories(); } catch (e) { console.error("Territories load failed", e); return []; }
}

export async function loadAchievements() {
  try { return await queries.getAchievements(); } catch (e) { console.error("Achievements load failed", e); return []; }
}

export async function loadActivities() {
  try { return await queries.getActivities(); } catch (e) { console.error("Activities load failed, using fallback", e); return fallback.activities; }
}

export async function loadGallery() {
  try { return await queries.getGallery(); } catch (e) { console.error("Gallery load failed", e); return []; }
}

export async function loadContact() {
  try { return await queries.getContact(); } catch (e) { console.error("Contact load failed, using fallback", e); return fallback.contact; }
}
