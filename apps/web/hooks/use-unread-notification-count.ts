"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadUnreadNotificationCountAction } from "@/lib/notifications/actions";
import { NOTIFICATIONS_READ_EVENT } from "@/lib/notifications/events";

export function useUnreadNotificationCount(): number {
  const pathname = usePathname();
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

    function onRead() {
      void load();
    }

    window.addEventListener(NOTIFICATIONS_READ_EVENT, onRead);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_READ_EVENT, onRead);
    };
  }, [pathname]);

  return unreadCount;
}

export function formatUnreadBadgeCount(count: number): string | null {
  if (count <= 0) return null;
  return count > 9 ? "9+" : String(count);
}
