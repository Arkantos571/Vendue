import { formatEnquiryTimeRange } from "@/lib/enquiries/mappers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEnquiryCurrency, type MockEnquiry } from "@/lib/mock/enquiries";
import { formatDate } from "@/lib/utils";

export function EnquiryEventRequestSection({ enquiry }: { enquiry: MockEnquiry }) {
  const items = [
    { label: "Requested date", value: formatDate(enquiry.requestedDate) },
    {
      label: "Time window",
      value: formatEnquiryTimeRange(enquiry),
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
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-sm text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        {enquiry.notes && (
          <div className="mt-6 rounded-lg border border-border bg-muted/50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">{enquiry.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
