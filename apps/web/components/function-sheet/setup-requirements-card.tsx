import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SetupRequirements } from "@/lib/mock/function-sheet";

export function SetupRequirementsCard({ setup }: { setup: SetupRequirements }) {
  const items = [
    { label: "Room layout", value: setup.roomLayout },
    { label: "Furniture", value: setup.furniture },
    { label: "AV requirements", value: setup.avRequirements },
    { label: "Signage", value: setup.signage },
    { label: "Cloakroom", value: setup.cloakroom },
    { label: "Accessibility notes", value: setup.accessibilityNotes },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup requirements</CardTitle>
        <CardDescription>Room, AV, and physical setup details.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          {items.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-stone-700">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
