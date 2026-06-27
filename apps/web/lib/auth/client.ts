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

function getOAuthRedirectUrl(redirectPath = "/dashboard"): string {
  const origin = typeof window !== "undefined" ? window.location.origin : getAppUrl();
  const safePath = redirectPath.startsWith("/") ? redirectPath : "/dashboard";
  return `${origin}/auth/callback?redirect=${encodeURIComponent(safePath)}`;
}

async function signInWithOAuthProvider(
  provider: "google" | "apple",
  redirectPath?: string,
): Promise<AuthResult> {
  const supabase = tryCreateClient();

  if (!supabase) {
    return {
      success: false,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getOAuthRedirectUrl(redirectPath),
    },
  });

  if (error) {
    const message = getAuthErrorMessage(error);
    if (message.toLowerCase().includes("provider") || message.toLowerCase().includes("enabled")) {
      return {
        success: false,
        error: `${provider === "google" ? "Google" : "Apple"} sign-in is not enabled yet. Enable it in your Supabase project under Authentication → Providers.`,
      };
    }
    return { success: false, error: message };
  }

  if (data.url) {
    window.location.assign(data.url);
  }

  return { success: true };
}

export function signInWithGoogle(redirectPath?: string): Promise<AuthResult> {
  return signInWithOAuthProvider("google", redirectPath);
}

export function signInWithApple(redirectPath?: string): Promise<AuthResult> {
  return signInWithOAuthProvider("apple", redirectPath);
}

export async function resetPasswordForEmail(email: string): Promise<AuthResult> {
  const supabase = tryCreateClient();

  if (!supabase) {
    return {
      success: false,
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const origin = typeof window !== "undefined" ? window.location.origin : getAppUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/sign-in`,
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
