import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/auth/profile";
import type { DbClient } from "@/lib/supabase/db";
import { createClient } from "@/lib/supabase/server";

export async function requireAuthenticatedClient(redirectPath = "/sign-in") {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(redirectPath);
  }

  const db = supabase as unknown as DbClient;

  const profileResult = await ensureProfile(db, user);
  if (profileResult.error) {
    throw new Error(`Profile setup failed: ${profileResult.error}`);
  }

  return { supabase: db, user };
}

export async function getPrimaryVenueId(
  supabase: DbClient,
  userId: string,
): Promise<string | null> {
  const { data: membership, error } = await supabase
    .from("venue_members")
    .select("venue_id")
    .eq("profile_id", userId)
    .not("joined_at", "is", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return membership?.venue_id ?? null;
}
