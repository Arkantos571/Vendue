"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOutClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setError(null);

    const result = await signOutClient();

    if (!result.success) {
      setError(result.error);
      setIsSigningOut(false);
      return;
    }

    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-400 transition-colors",
          "hover:bg-white/5 hover:text-stone-100 disabled:opacity-50",
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {isSigningOut ? "Signing out…" : "Sign out"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
