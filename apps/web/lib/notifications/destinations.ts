import type { AppNotification } from "@/lib/notifications/mappers";

export type NotificationAudience = "manager" | "staff";

export function getNotificationHref(
  notification: AppNotification,
  audience: NotificationAudience,
): string | null {
  const { type, enquiryId, eventId, shiftId } = notification;

  if (audience === "manager") {
    if (type === "proposal_viewed" && enquiryId) {
      return `/dashboard/enquiries/${enquiryId}`;
    }

    if (type === "new_enquiry" && enquiryId) {
      return `/dashboard/enquiries/${enquiryId}`;
    }

    if (type === "enquiry_converted" && eventId) {
      return `/dashboard/events/${eventId}`;
    }

    if (type === "function_sheet_updated" && eventId) {
      return `/dashboard/events/${eventId}`;
    }

    if (
      (type === "rota_published" ||
        type === "shift_confirmed" ||
        type === "shift_declined" ||
        type === "shift_updated" ||
        type === "shift_added") &&
      eventId
    ) {
      return `/dashboard/rota/${eventId}`;
    }
  }

  if (audience === "staff") {
    if (
      (type === "rota_published" || type === "shift_added" || type === "shift_updated") &&
      shiftId
    ) {
      return `/staff/shifts/${shiftId}`;
    }
  }

  return null;
}
