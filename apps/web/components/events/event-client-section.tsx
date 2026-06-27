import { Mail, Phone } from "lucide-react";
import { EventDetailItem } from "@/components/events/event-detail-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockEvent } from "@/lib/mock/events";

export function EventClientSection({ event }: { event: MockEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <EventDetailItem label="Name" value={event.clientName} />
        <EventDetailItem icon={Mail} label="Email" value={event.clientEmail} />
        <EventDetailItem
          icon={Phone}
          label="Phone"
          value={event.clientPhone ?? "Not provided"}
        />
      </CardContent>
    </Card>
  );
}
