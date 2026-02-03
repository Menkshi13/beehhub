import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://yzwcauqcuejubywskvug.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5n0yUVRC6BMRr7xN8l4zsA_BY826dXg";

// checkbox “Μείνε συνδεδεμένος” -> αποθηκεύεται σαν pref
const rememberPref = localStorage.getItem("beehub_remember_pref") ?? "1";
const storage = rememberPref === "1" ? localStorage : sessionStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, storage }
});