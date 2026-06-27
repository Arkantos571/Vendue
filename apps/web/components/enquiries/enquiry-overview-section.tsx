import { EnquiryPriorityBadge } from "@/components/enquiries/enquiry-priority-badge";
import { EnquiryStatusBadge } from "@/components/enquiries/enquiry-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  enquirySourceLabels,
  formatEnquiryCurrency,
  type MockEnquiry,
} from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";

export function EnquiryOverviewSection({ enquiry }: { enquiry: MockEnquiry }) {
  const items = [
    { label: "Estimated value", value: formatEnquiryCurrency(enquiry.estimatedValue) },
    { label: "Requested date", value: formatDate(enquiry.requestedDate) },
    { label: "Event type", value: enquiry.eventType },
    { label: "Guest count", value: String(enquiry.guestCount) },
    { label: "Assigned owner", value: enquiry.assignedOwner },
    { label: "Source", value: enquirySourceLabels[enquiry.source] },
    {
      label: "Last contact date",
      value: enquiry.lastContactDate ? formatDate(enquiry.lastContactDate) : "Not yet contacted",
    },
    {
      label: "Next follow-up",
      value: enquiry.nextFollowUpDate ? formatDate(enquiry.nextFollowUpDate) : "None scheduled",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>Overview</CardTitle>
          <EnquiryStatusBadge status={enquiry.status} />
          <EnquiryPriorityBadge priority={enquiry.priority} />
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {items.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
              <dd className="mt-1 text-sm text-stone-900">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
