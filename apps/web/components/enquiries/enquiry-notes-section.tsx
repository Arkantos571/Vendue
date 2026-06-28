import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockEnquiry } from "@/lib/mock/enquiries";

export function EnquiryNotesSection({ enquiry }: { enquiry: MockEnquiry }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
        <CardDescription>Internal notes for the sales and events team.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client notes</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {enquiry.notes ?? "No client notes recorded."}
          </p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50/40 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Internal notes</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {enquiry.internalNotes ?? "No internal notes recorded."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
