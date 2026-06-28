"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { isSocialAuthEnabled, signInWithApple, signInWithGoogle } from "@/lib/auth/client";
import { alertError } from "@/lib/design/classes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.79 15.25 3.8 8.62 7.61 5.5c.87-.76 2.27-.67 3.4.07.8.52 1.52.48 2.53.07 1.18-.46 2.28-.37 3.12.2 2.48 1.68 2.1 6.53-.9 8.61-.73.45-1.34.67-1.85.83zm-1.4-15.5c.15 1.78-1.29 3.28-2.86 3.22-1.03-2.1.84-4.08 2.86-3.22z" />
    </svg>
  );
}

const comingSoonButtonClass =
  "w-full border-slate-200 bg-slate-50 text-slate-500 dark:text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 ";

export function OAuthDivider() {
  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-slate-200 dark:border-slate-700" />
      </div>
      <p className="relative mx-auto w-fit bg-surface-elevated px-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        or continue with email
      </p>
    </div>
  );
}

function ComingSoonSocialButtons() {
  return (
    <div className="space-y-3">
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Google and Apple login will be enabled soon.
      </p>
      <Button type="button" variant="outline" className={comingSoonButtonClass} disabled>
        <GoogleIcon className="h-4 w-4 opacity-70" />
        Continue with Google
        <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 dark:bg-slate-700">
          Soon
        </span>
      </Button>
      <Button type="button" variant="outline" className={comingSoonButtonClass} disabled>
        <AppleIcon className="h-4 w-4 opacity-70" />
        Continue with Apple
        <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 dark:bg-slate-700">
          Soon
        </span>
      </Button>
    </div>
  );
}

function ActiveSocialButtons() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectPath = searchParams.get("redirect") ?? "/dashboard";

  async function handleOAuth(provider: "google" | "apple") {
    setIsLoading(provider);
    setError(null);

    const result =
      provider === "google"
        ? await signInWithGoogle(redirectPath)
        : await signInWithApple(redirectPath);

    if (!result.success) {
      setError(result.error);
      setIsLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className={cn(alertError)} role="alert">
          {error}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isLoading !== null}
        onClick={() => handleOAuth("google")}
      >
        <GoogleIcon className="h-4 w-4" />
        {isLoading === "google" ? "Redirecting…" : "Continue with Google"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isLoading !== null}
        onClick={() => handleOAuth("apple")}
      >
        <AppleIcon className="h-4 w-4" />
        {isLoading === "apple" ? "Redirecting…" : "Continue with Apple"}
      </Button>
    </div>
  );
}

export function SocialAuthButtons() {
  if (isSocialAuthEnabled()) {
    return <ActiveSocialButtons />;
  }

  return <ComingSoonSocialButtons />;
}
