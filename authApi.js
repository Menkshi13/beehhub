import { supabase } from "./supabaseClient.js";

export const AuthAPI = {
  signUp: (email, password, data = {}) =>
    supabase.auth.signUp({ email, password, options: { data } }),

  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  reset: (email) => supabase.auth.resetPasswordForEmail(email),

  session: () => supabase.auth.getSession(),
};
