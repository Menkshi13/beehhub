import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "ΒΑΛΕ_ΕΔΩ_TO_PROJECT_URL";
const SUPABASE_ANON_KEY = "ΒΑΛΕ_ΕΔΩ_TO_ANON_KEY";

// checkbox “Μείνε συνδεδεμένος” -> αποθηκεύεται σαν pref
const rememberPref = localStorage.getItem("beehub_remember_pref") ?? "1";
const storage = rememberPref === "1" ? localStorage : sessionStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, storage }
});