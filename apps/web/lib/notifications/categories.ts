export type NotificationCategory = "all" | "unread" | "rota" | "staff" | "events" | "enquiries";

export const notificationCategoryFilters: { value: NotificationCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "rota", label: "Rota" },
  { value: "staff", label: "Staff" },
  { value: "events", label: "Events" },
  { value: "enquiries", label: "Enquiries" },
];

const rotaTypes = new Set(["rota_published", "shift_added", "shift_updated"]);
const staffTypes = new Set(["shift_confirmed", "shift_declined"]);
const eventTypes = new Set(["function_sheet_updated"]);
const enquiryTypes = new Set(["enquiry_converted", "new_enquiry", "proposal_viewed", "proposal_response"]);

export function notificationCategoryForType(type: string): NotificationCategory | null {
  if (rotaTypes.has(type)) return "rota";
  if (staffTypes.has(type)) return "staff";
  if (eventTypes.has(type)) return "events";
  if (enquiryTypes.has(type)) return "enquiries";
  return null;
}

export function matchesNotificationCategory(
  type: string,
  readAt: string | null,
  category: NotificationCategory,
): boolean {
  if (category === "all") return true;
  if (category === "unread") return !readAt;
  const mapped = notificationCategoryForType(type);
  return mapped === category;
}

export const notificationTypeLabels: Record<string, string> = {
  rota_published: "Rota",
  shift_added: "Shift added",
  shift_updated: "Shift updated",
  shift_confirmed: "Confirmed",
  shift_declined: "Declined",
  function_sheet_updated: "Function sheet",
  enquiry_converted: "Enquiry",
  new_enquiry: "New enquiry",
  proposal_viewed: "Proposal viewed",
  proposal_response: "Proposal response",
};
