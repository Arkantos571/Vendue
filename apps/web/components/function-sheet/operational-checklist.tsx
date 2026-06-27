import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/lib/mock/function-sheet";

export function OperationalChecklist({ items }: { items: ChecklistItem[] }) {
  const completedCount = items.filter((item) => item.completed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational checklist</CardTitle>
        <CardDescription>
          {completedCount} of {items.length} items complete
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-4 py-3",
                item.completed
                  ? "border-emerald-100 bg-emerald-50/50"
                  : "border-stone-200 bg-white",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  item.completed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-stone-300 bg-white text-transparent",
                )}
              >
                <Check className="h-3 w-3" />
              </span>
              <span
                className={cn(
                  "text-sm",
                  item.completed ? "text-stone-600 line-through" : "font-medium text-stone-900",
                )}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
