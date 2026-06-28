export const NOTIFICATIONS_READ_EVENT = "venudue:notifications-read";

export function dispatchNotificationsRead(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTIFICATIONS_READ_EVENT));
}
