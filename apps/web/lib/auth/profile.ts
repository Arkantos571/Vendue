import type { User } from "@supabase/supabase-js";
import type { DbClient } from "@/lib/supabase/db";

export async function ensureProfile(
  supabase: DbClient,
  user: User,
): Promise<{ error: string | null }> {
  const fullName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
    null;

  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    return { error: readError.message };
  }

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({
        email: user.email ?? "",
        full_name: fullName,
      })
      .eq("id", user.id);

    return { error: error?.message ?? null };
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    full_name: fullName,
  });

  return { error: error?.message ?? null };
}
