"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { NotificationTypeBadge } from "@/components/notifications/notification-type-badge";
import { Button } from "@/components/ui/button";
import {
  type NotificationCategory,
  notificationCategoryFilters,
  matchesNotificationCategory,
} from "@/lib/notifications/categories";
import { NOTIFICATIONS_SCHEMA_HINT } from "@/lib/notifications/constants";
import { getNotificationHref } from "@/lib/notifications/destinations";
import { dispatchNotificationsRead } from "@/lib/notifications/events";
import type { AppNotification } from "@/lib/notifications/mappers";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import { cn, formatDate, formatTime } from "@/lib/utils";

interface NotificationsListProps {
  initialNotifications: AppNotification[];
  loadError?: string | null;
  migrationRequired?: boolean;
  audience?: "manager" | "staff";
}

function NotificationRow({
  notification,
  onMarkRead,
  onNavigate,
  isMarking,
  audience,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onNavigate: (notification: AppNotification, href: string) => void;
  isMarking: string | null;
  audience: "manager" | "staff";
}) {
  const isUnread = !notification.readAt;
  const href = getNotificationHref(notification, audience);
  const isClickable = Boolean(href);

  function handleCardClick() {
    if (!href) {
      return;
    }
    onNavigate(notification, href);
  }

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (!href) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onNavigate(notification, href);
    }
  }

  return (
    <article
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? handleCardClick : undefined}
      onKeyDown={isClickable ? handleCardKeyDown : undefined}
      className={cn(
        "rounded-xl border p-4 transition-colors",
        isUnread
          ? "border-brand-200 bg-brand-50/40 dark:border-brand-900 dark:bg-brand-950/20"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
        isClickable &&
          "cursor-pointer hover:border-brand-300 hover:bg-brand-50/70 hover:shadow-sm dark:hover:border-brand-800 dark:hover:bg-brand-950/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900 dark:text-slate-100">{notification.title}</p>
            <NotificationTypeBadge type={notification.type} />
            {isUnread ? (
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Unread
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {formatDate(notification.createdAt)} at {formatTime(notification.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isUnread ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isMarking === notification.id}
              onClick={(event) => {
                event.stopPropagation();
                onMarkRead(notification.id);
              }}
            >
              {isMarking === notification.id ? "Marking…" : "Mark read"}
            </Button>
          ) : null}
          {isClickable ? (
            <ChevronRight
              className="h-5 w-5 text-stone-400 dark:text-stone-500"
              aria-hidden
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function NotificationsList({
  initialNotifications,
  loadError,
  migrationRequired = false,
  audience = "manager",
}: NotificationsListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<NotificationCategory>("all");
  const [error, setError] = useState<string | null>(loadError ?? null);
  const [isMarking, setIsMarking] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  );

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((notification) =>
        matchesNotificationCategory(notification.type, notification.readAt, filter),
      ),
    [notifications, filter],
  );

  function markNotificationReadLocally(notificationId: string) {
    const now = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, readAt: now } : notification,
      ),
    );
    dispatchNotificationsRead();
  }

  async function handleMarkRead(notificationId: string) {
    setIsMarking(notificationId);
    setError(null);

    const result = await markNotificationReadAction(notificationId);
    setIsMarking(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    markNotificationReadLocally(notificationId);
    router.refresh();
  }

  async function handleNavigate(notification: AppNotification, href: string) {
    if (!notification.readAt) {
      const result = await markNotificationReadAction(notification.id);
      if (result.success) {
        markNotificationReadLocally(notification.id);
      }
    }

    router.push(href);
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
    dispatchNotificationsRead();
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {migrationRequired ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {NOTIFICATIONS_SCHEMA_HINT}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {unreadCount} unread · {notifications.length} total
        </p>
        {unreadCount > 0 ? (
          <Button type="button" variant="outline" size="sm" disabled={isMarkingAll} onClick={handleMarkAllRead}>
            {isMarkingAll ? "Marking all…" : "Mark all read"}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {notificationCategoryFilters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === value
                ? "bg-brand-700 text-white"
                : "bg-white text-slate-600 dark:text-slate-300 ring-1 ring-stone-200 hover:bg-slate-50 dark:bg-slate-900  dark:ring-stone-700",
            )}
          >
            {label}
            {value === "unread" ? ` (${unreadCount})` : ""}
          </button>
        ))}
      </div>

      {visibleNotifications.length === 0 ? (
        <div className="v-empty">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {filter === "unread"
              ? "You're all caught up."
              : audience === "staff"
                ? "When your manager publishes a rota or updates your shifts, notifications appear here."
                : "When staff confirm shifts or rotas are published, notifications appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onNavigate={handleNavigate}
              isMarking={isMarking}
              audience={audience}
            />
          ))}
        </div>
      )}
    </div>
  );
}
