import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to manage your venue operations."
      footer={
        <>
          Don&apos;t have an account? <AuthLink href="/sign-up">Create one</AuthLink>
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <SignInForm />
      </Suspense>
    </AuthCard>
  );
}
