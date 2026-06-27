"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { OAuthDivider, SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { signInWithPassword } from "@/lib/auth/client";
import { alertError } from "@/lib/design/classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackError = searchParams.get("error") === "auth_callback_failed"
    ? "Sign-in could not be completed. Please try again."
    : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await signInWithPassword({ email, password });

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    const redirectTo = searchParams.get("redirect") || "/dashboard";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <SocialAuthButtons />
      <OAuthDivider />
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || callbackError) && (
          <div className={cn(alertError)} role="alert">{error ?? callbackError}</div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@venue.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm v-link">Forgot password?</Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in with email"}</Button>
      </form>
    </div>
  );
}
