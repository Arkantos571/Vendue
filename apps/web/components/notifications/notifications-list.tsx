"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/lib/notifications/mappers";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import { cn, formatDate } from "@/lib/utils";

interface NotificationsListProps {
  initialNotifications: AppNotification[];
  loadError?: string | null;
}

function formatNotificationType(type: string): string {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function NotificationRow({
  notification,
  onMarkRead,
  isMarking,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  isMarking: string | null;
}) {
  const isUnread = !notification.readAt;
  const eventHref = notification.eventId ? `/dashboard/rota/${notification.eventId}` : null;

  return (
    <article
      className={cn(
        "rounded-xl border p-4 transition-colors",
        isUnread
          ? "border-brand-200 bg-brand-50/40 dark:border-brand-900 dark:bg-brand-950/20"
          : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-stone-900 dark:text-stone-100">{notification.title}</p>
            {isUnread && (
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Unread
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{notification.body}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
            <span>{formatNotificationType(notification.type)}</span>
            <span>{formatDate(notification.createdAt)}</span>
            {eventHref && (
              <Link href={eventHref} className="font-medium text-brand-700 hover:underline dark:text-brand-300">
                View rota
              </Link>
            )}
          </div>
        </div>
        {isUnread && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isMarking === notification.id}
            onClick={() => onMarkRead(notification.id)}
          >
            {isMarking === notification.id ? "Marking…" : "Mark read"}
          </Button>
        )}
      </div>
    </article>
  );
}

export function NotificationsList({ initialNotifications, loadError }: NotificationsListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [error, setError] = useState<string | null>(loadError ?? null);
  const [isMarking, setIsMarking] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  );

  const visibleNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.readAt);
    }
    return notifications;
  }, [filter, notifications]);

  async function handleMarkRead(notificationId: string) {
    setIsMarking(notificationId);
    setError(null);

    const result = await markNotificationReadAction(notificationId);
    setIsMarking(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, readAt: new Date().toISOString() }
          : notification,
      ),
    );
    router.refresh();
  }

  async function handleMarkAllRead() {
    setIsMarkingAll(true);
    setError(null);

    const result = await markAllNotificationsReadAction();
    setIsMarkingAll(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const now = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) =>
        notification.readAt ? notification : { ...notification, readAt: now },
      ),
    );
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === "all"
                ? "bg-brand-700 text-white"
                : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-700",
            )}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === "unread"
                ? "bg-brand-700 text-white"
                : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-700",
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <Button type="button" variant="outline" size="sm" disabled={isMarkingAll} onClick={handleMarkAllRead}>
            {isMarkingAll ? "Marking all…" : "Mark all read"}
          </Button>
        )}
      </div>

      {visibleNotifications.length === 0 ? (
        <div className="v-empty">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {filter === "unread"
              ? "You're all caught up."
              : "When staff confirm shifts, notifications will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              isMarking={isMarking}
            />
          ))}
        </div>
      )}
    </div>
  );
}
