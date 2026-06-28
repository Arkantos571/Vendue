"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { PublicThemeToggle } from "@/components/layout/public-theme-toggle";
import { StaffNav } from "@/components/staff/staff-nav";

interface StaffShellProps {
  title?: string;
  backHref?: string;
  children: React.ReactNode;
}

export function StaffShell({ title, backHref, children }: StaffShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2">
            {backHref ? (
              <Link
                href={backHref}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            ) : null}
            <div className="min-w-0">
              <Logo href="/staff" size="sm" />
              {title ? (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{title}</p>
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
