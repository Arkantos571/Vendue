"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OAuthDivider, SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { signUpWithPassword } from "@/lib/auth/client";
import { alertError, alertSuccess } from "@/lib/design/classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function SignUpForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }
    const result = await signUpWithPassword({ fullName, email, password });
    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }
    setSuccessMessage("Account created. Check your email if confirmation is required, then sign in.");
    setIsSubmitting(false);
    setTimeout(() => router.push("/sign-in"), 1500);
  }

  return (
    <div className="space-y-6">
      <SocialAuthButtons />
      <OAuthDivider />
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className={cn(alertError)} role="alert">{error}</div>}
        {successMessage && <div className={cn(alertSuccess)} role="status">{successMessage}</div>}
        <div className="space-y-2"><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" autoComplete="name" required placeholder="Alex Morgan" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="email">Work email</Label><Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@venue.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /><p className="text-xs text-slate-500 dark:text-slate-400">At least 8 characters</p></div>
        <div className="space-y-2"><Label htmlFor="confirm_password">Confirm password</Label><Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : "Create account with email"}</Button>
      </form>
    </div>
  );
}
