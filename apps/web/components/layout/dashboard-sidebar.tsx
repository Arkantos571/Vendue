"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Bell,
  Inbox,
  LayoutDashboard,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeSelector } from "@/components/settings/theme-selector";
import {
  formatUnreadBadgeCount,
  useUnreadNotificationCount,
} from "@/hooks/use-unread-notification-count";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/rota", label: "Rota", icon: ClipboardList },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badge: true },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ open = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const unreadCount = useUnreadNotificationCount();
  const unreadBadge = formatUnreadBadgeCount(unreadCount);

  const content = (
    <div className="flex h-full min-h-0 flex-col bg-brand-950">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <Logo variant="inverse" href="/dashboard" />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-white dark:bg-slate-950/10 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ href, label, icon: Icon, exact, badge }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          const showBadge = badge && unreadBadge;

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white dark:bg-slate-950/10 text-white"
                  : "text-stone-400 hover:bg-white dark:bg-slate-950/5 hover:text-stone-100",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {showBadge ? (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold leading-none text-white"
                  aria-label={`${unreadCount} unread notifications`}
                >
                  {unreadBadge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-white/10 p-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Theme</p>
          <ThemeSelector compact />
        </div>
        <SignOutButton />
        <div className="rounded-lg bg-white dark:bg-slate-950/5 px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-hidden">{content}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close overlay"
          />
          <aside className="relative h-full w-72 max-w-[85vw] shadow-2xl">{content}</aside>
        </div>
      )}
    </>
  );
}
