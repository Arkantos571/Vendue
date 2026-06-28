"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SetupRequirements } from "@/lib/mock/function-sheet";

const fields: { key: keyof SetupRequirements; label: string; multiline?: boolean }[] = [
  { key: "roomLayout", label: "Room layout", multiline: true },
  { key: "furniture", label: "Furniture", multiline: true },
  { key: "avRequirements", label: "AV requirements", multiline: true },
  { key: "signage", label: "Signage" },
  { key: "cloakroom", label: "Cloakroom" },
  { key: "accessibilityNotes", label: "Accessibility notes", multiline: true },
];

export function SetupRequirementsCard({
  setup,
  onChange,
}: {
  setup: SetupRequirements;
  onChange: (setup: SetupRequirements) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup requirements</CardTitle>
        <CardDescription>Room, AV, and physical setup details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map(({ key, label, multiline }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`setup-${key}`}>{label}</Label>
            {multiline ? (
              <Textarea
                id={`setup-${key}`}
                value={setup[key]}
                onChange={(event) => onChange({ ...setup, [key]: event.target.value })}
                rows={3}
              />
            ) : (
              <Input
                id={`setup-${key}`}
                value={setup[key]}
                onChange={(event) => onChange({ ...setup, [key]: event.target.value })}
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
