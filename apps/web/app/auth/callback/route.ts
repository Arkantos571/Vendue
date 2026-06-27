import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const url = new URL("/sign-in", origin);
      url.searchParams.set("error", "auth_callback_failed");
      return NextResponse.redirect(url);
    }
  }

  const safeRedirect = redirect.startsWith("/") ? redirect : "/dashboard";
  return NextResponse.redirect(`${origin}${safeRedirect}`);
}
