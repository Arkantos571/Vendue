import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Set up Venudue for your venue in minutes."
      footer={
        <>
          Already have an account? <AuthLink href="/sign-in">Sign in</AuthLink>
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>}>
        <SignUpForm />
      </Suspense>
    </AuthCard>
  );
}
