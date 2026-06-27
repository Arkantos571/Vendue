import type { User } from "@supabase/supabase-js";
import type { DbClient } from "@/lib/supabase/db";

export async function ensureProfile(supabase: DbClient, user: User) {
  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
    null;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}
