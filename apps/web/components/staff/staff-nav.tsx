"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Clock, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/staff", label: "Home", icon: Home, exact: true },
  { href: "/staff/shifts", label: "Shifts", icon: CalendarDays, exact: false },
  { href: "/staff/availability", label: "Availability", icon: Clock, exact: false },
];

export function StaffNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/95">
      <div className="mx-auto grid max-w-lg grid-cols-3">
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
                  : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200",
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
