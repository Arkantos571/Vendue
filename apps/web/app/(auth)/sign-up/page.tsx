import type { Metadata } from "next";
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
      <SignUpForm />
    </AuthCard>
  );
}
