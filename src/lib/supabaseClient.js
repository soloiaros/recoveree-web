import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!rawSupabaseUrl || !supabaseAnonKey) {
  // Loud failure during the hackathon so we notice missing env vars immediately
  // instead of debugging silent auth/network errors later.
  throw new Error(
    'Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// supabase-js expects the bare project URL (e.g. https://abc.supabase.co) and
// appends `/auth/v1`, `/rest/v1`, etc. itself. Strip any trailing path/slash so
// users who paste the REST endpoint by mistake don't get "Invalid path
// specified in request URL".
const supabaseUrl = (() => {
  try {
    const u = new URL(rawSupabaseUrl);
    return `${u.protocol}//${u.host}`;
  } catch {
    return rawSupabaseUrl.replace(/\/+$/, '');
  }
})();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
