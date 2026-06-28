"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

interface DashboardShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function DashboardShell({ title, description, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-stone-100 dark:bg-stone-950">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-stone-200/80 bg-white/95 px-4 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/95 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-stone-900 dark:text-stone-100">
              {title}
            </h1>
            {description && (
              <p className="truncate text-sm text-stone-500 dark:text-stone-400">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/notifications"
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 dark:bg-brand-950 dark:text-brand-200 sm:inline">
              The Grand Assembly
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
