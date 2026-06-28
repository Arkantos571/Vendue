"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@/lib/mock/function-sheet";

export function OperationalChecklist({
  items,
  onChange,
}: {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}) {
  const completedCount = items.filter((item) => item.completed).length;

  function toggleItem(id: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  }

  function updateLabel(id: string, label: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, label } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function addItem() {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        label: "New checklist item",
        completed: false,
      },
    ]);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Operational checklist</CardTitle>
          <CardDescription>
            {completedCount} of {items.length} items complete
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addItem}>
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2",
                item.completed
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                  : "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900",
              )}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                className="h-4 w-4 rounded border-stone-300 text-brand-700 focus:ring-brand-500"
                aria-label={`Mark ${item.label} complete`}
              />
              <Input
                value={item.label}
                onChange={(event) => updateLabel(item.id, event.target.value)}
                className={cn(
                  "border-0 bg-transparent px-0 shadow-none focus-visible:ring-0",
                  item.completed && "text-stone-500 line-through",
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-stone-500 hover:text-red-600"
                onClick={() => removeItem(item.id)}
                aria-label="Remove checklist item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
