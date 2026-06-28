import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockEnquiry } from "@/lib/mock/enquiries";

export function EnquiryClientSection({ enquiry }: { enquiry: MockEnquiry }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailItem label="Name" value={enquiry.clientName} />
        <DetailItem icon={Mail} label="Email" value={enquiry.clientEmail} />
        <DetailItem icon={Phone} label="Phone" value={enquiry.clientPhone ?? "Not provided"} />
        <DetailItem label="Company" value={enquiry.company ?? "Not provided"} />
        <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Preferences</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {enquiry.clientPreferences ?? "No preferences recorded yet."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}
