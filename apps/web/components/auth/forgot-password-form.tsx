"use client";

import { useState } from "react";
import { resetPasswordForEmail } from "@/lib/auth/client";
import { alertError, alertInfo } from "@/lib/design/classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const result = await resetPasswordForEmail(email);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return <div className={cn(alertInfo)} role="status">If an account exists for that email, you will receive reset instructions shortly.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className={cn(alertError)} role="alert">{error}</div>}
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@venue.com" /></div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send reset link"}</Button>
    </form>
  );
}
