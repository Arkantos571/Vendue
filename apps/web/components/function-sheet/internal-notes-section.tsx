import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { InternalNotes } from "@/lib/mock/function-sheet";

export function InternalNotesSection({ notes }: { notes: InternalNotes }) {
  const sections = [
    { label: "Manager notes", value: notes.managerNotes },
    { label: "Risk notes", value: notes.riskNotes },
    { label: "Client preferences", value: notes.clientPreferences },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal notes</CardTitle>
        <CardDescription>For venue staff only — not shared with clients.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-stone-50/50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
