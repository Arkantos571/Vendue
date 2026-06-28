import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { MockEnquiry } from "@/lib/mock/enquiries";

export function EnquiryActivitySection({ enquiry }: { enquiry: MockEnquiry }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Timeline of enquiry updates and follow-ups.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-6 border-l border-border pl-6">
          {enquiry.activity.map((item) => (
            <li key={item.id} className="relative">
              <span className="absolute -left-[1.95rem] top-1 flex h-3 w-3 rounded-full bg-brand-600 ring-4 ring-white" />
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(item.timestamp.slice(0, 10))} · {item.actor}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
