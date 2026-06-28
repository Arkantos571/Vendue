"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { loadUnreadNotificationCountAction } from "@/lib/notifications/actions";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  href?: string;
  className?: string;
}

export function NotificationBell({ href = "/dashboard/notifications", className }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await loadUnreadNotificationCountAction();
      if (!cancelled && result.success) {
        setUnreadCount(result.count);
      }
    }

    void load();
    const interval = window.setInterval(load, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
        className,
      )}
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 ? (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
