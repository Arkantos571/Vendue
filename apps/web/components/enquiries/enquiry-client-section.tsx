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
        <div className="rounded-lg border border-stone-200 bg-stone-50/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Preferences</p>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
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
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />}
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
        <dd className="mt-1 text-sm text-stone-900">{value}</dd>
      </div>
    </div>
  );
}
