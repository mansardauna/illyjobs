import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service role key.
 * Returns null when Supabase is not configured.
 * Never import this from a client component.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      // Next.js caches fetch() by default; database reads must always be fresh.
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    });
  }
  return client;
}
