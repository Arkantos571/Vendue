"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Clock, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/staff", label: "Home", icon: Home, exact: true },
  { href: "/staff/shifts", label: "Shifts", icon: CalendarDays, exact: false },
  { href: "/staff/availability", label: "Availability", icon: Clock, exact: false },
  { href: "/staff/notifications", label: "Notifications", icon: Bell, exact: false },
];

export function StaffNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-colors",
                active
                  ? "text-brand-700 dark:text-brand-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200  dark:hover:text-slate-200",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
