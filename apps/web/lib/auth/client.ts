import { tryCreateClient } from "@/src/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { getAppUrl } from "@/lib/app-url";

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
}

export type AuthResult = { success: true } | { success: false; error: string };

export async function signInWithPassword(input: SignInInput): Promise<AuthResult> {
  const supabase = tryCreateClient();

  if (!supabase) {
    return {
      success: false,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }

  return { success: true };
}

export async function signUpWithPassword(input: SignUpInput): Promise<AuthResult> {
  const supabase = tryCreateClient();

  if (!supabase) {
    return {
      success: false,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${getAppUrl()}/dashboard`,
      data: {
        full_name: input.fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }

  return { success: true };
}

export async function signOutClient(): Promise<AuthResult> {
  const supabase = tryCreateClient();

  if (!supabase) {
    return {
      success: false,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }

  return { success: true };
}
