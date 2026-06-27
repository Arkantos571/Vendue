import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, requireSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/src/types/database";

export function createClient() {
  const env = requireSupabaseEnv();

  return createBrowserClient<Database>(env.url, env.anonKey);
}

/** Safe client factory for optional auth flows when env vars may be unset. */
export function tryCreateClient() {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  return createBrowserClient<Database>(env.url, env.anonKey);
}
