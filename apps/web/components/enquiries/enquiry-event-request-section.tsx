import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEnquiryCurrency, type MockEnquiry } from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";

export function EnquiryEventRequestSection({ enquiry }: { enquiry: MockEnquiry }) {
  const items = [
    { label: "Requested date", value: formatDate(enquiry.requestedDate) },
    {
      label: "Time window",
      value: `${enquiry.preferredStartTime} – ${enquiry.preferredEndTime}`,
    },
    { label: "Event type", value: enquiry.eventType },
    { label: "Space preference", value: enquiry.spacePreference },
    { label: "Guest count", value: String(enquiry.guestCount) },
    { label: "Budget estimate", value: formatEnquiryCurrency(enquiry.budgetEstimate) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event request</CardTitle>
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
        {enquiry.notes && (
          <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50/50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Notes</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{enquiry.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
