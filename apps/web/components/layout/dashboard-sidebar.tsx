"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/rota", label: "Rota", icon: ClipboardList },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ open = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col bg-brand-950">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Logo variant="dark" href="/dashboard" />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-stone-400 hover:bg-white/5 hover:text-stone-100",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg bg-white/5 px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Core workflow
          </p>
          <p className="mt-1 text-xs leading-relaxed text-stone-400">
            Venue → Event → Staff → Rota → Mobile
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">{content}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close overlay"
          />
          <aside className="relative h-full w-72 max-w-[85vw] shadow-2xl">{content}</aside>
        </div>
      )}
    </>
  );
}
