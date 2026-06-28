"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const views = [
  { id: "list", label: "List", href: "/dashboard/events", exact: true },
  { id: "calendar", label: "Calendar", href: "/dashboard/events/calendar" },
  { id: "upcoming", label: "Upcoming", href: "/dashboard/events/upcoming" },
];

export function EventsViewNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-border"
      aria-label="Events views"
    >
      {views.map(({ id, label, href, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={id}
            href={href}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-700 text-brand-700"
                : "border-transparent text-muted-foreground hover:border-slate-300 hover:text-foreground/90",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
