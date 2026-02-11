import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://yzwcauqcuejubywskvug.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5n0yUVRC6BMRr7xN8l4zsA_BY826dXg";

// “Μείνε συνδεδεμένος” (remember me) — δυναμικό storage
const PREF_KEY = "beehub_remember_pref";

function pickStore() {
  const pref = localStorage.getItem(PREF_KEY) ?? "1";
  return pref === "1" ? localStorage : sessionStorage;
}

const storage = {
  getItem: (key) => sessionStorage.getItem(key) ?? localStorage.getItem(key),
  setItem: (key, value) => {
    const store = pickStore();
    store.setItem(key, value);

    const other = store === localStorage ? sessionStorage : localStorage;
    other.removeItem(key);
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, storage }
});
