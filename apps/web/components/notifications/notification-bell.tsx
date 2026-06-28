"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import {
  formatUnreadBadgeCount,
  useUnreadNotificationCount,
} from "@/hooks/use-unread-notification-count";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  href?: string;
  className?: string;
}

export function NotificationBell({ href = "/dashboard/notifications", className }: NotificationBellProps) {
  const unreadCount = useUnreadNotificationCount();
  const unreadBadge = formatUnreadBadgeCount(unreadCount);

  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100  dark:hover:bg-slate-800",
        className,
      )}
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
    >
      <Bell className="h-5 w-5" />
      {unreadBadge ? (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
          {unreadBadge}
        </span>
      ) : null}
    </Link>
  );
}
