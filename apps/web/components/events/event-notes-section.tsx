import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockEvent } from "@/lib/mock/events";

export function EventNotesSection({ event }: { event: MockEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event notes</CardTitle>
        <CardDescription>Notes captured on the event record.</CardDescription>
      </CardHeader>
      <CardContent>
        {event.notes ? (
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{event.notes}</p>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No notes recorded for this event.</p>
        )}
      </CardContent>
    </Card>
  );
}
