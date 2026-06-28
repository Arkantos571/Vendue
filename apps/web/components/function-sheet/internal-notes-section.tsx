"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { InternalNotes } from "@/lib/mock/function-sheet";

const fields: { key: keyof InternalNotes; label: string }[] = [
  { key: "managerNotes", label: "Manager notes" },
  { key: "riskNotes", label: "Risk notes" },
  { key: "clientPreferences", label: "Client preferences" },
];

export function InternalNotesSection({
  notes,
  onChange,
}: {
  notes: InternalNotes;
  onChange: (notes: InternalNotes) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal notes</CardTitle>
        <CardDescription>For venue staff only — not shared with clients.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`notes-${key}`}>{label}</Label>
            <Textarea
              id={`notes-${key}`}
              value={notes[key]}
              onChange={(event) => onChange({ ...notes, [key]: event.target.value })}
              rows={4}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
