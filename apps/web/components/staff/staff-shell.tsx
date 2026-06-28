"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicThemeToggle } from "@/components/layout/public-theme-toggle";
import { StaffNav } from "@/components/staff/staff-nav";

interface StaffShellProps {
  title?: string;
  backHref?: string;
  children: React.ReactNode;
}

export function StaffShell({ title, backHref, children }: StaffShellProps) {
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/95">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2">
            {backHref ? (
              <Link
                href={backHref}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            ) : null}
            <div className="min-w-0">
              <Link href="/staff" className="text-sm font-semibold text-brand-700 dark:text-brand-400">
                Venudue
              </Link>
              {title ? (
                <p className="truncate text-xs text-stone-500 dark:text-stone-400">{title}</p>
              ) : null}
            </div>
          </div>
          <PublicThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-5 pb-24">{children}</main>
      <StaffNav />
    </div>
  );
}
