"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RunningOrderItem } from "@/lib/mock/function-sheet";

interface RunningOrderTableProps {
  items: RunningOrderItem[];
  onChange: (items: RunningOrderItem[]) => void;
}

export function RunningOrderTable({ items, onChange }: RunningOrderTableProps) {
  function updateItem(index: number, patch: Partial<RunningOrderItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([
      ...items,
      { time: "", activity: "", owner: "", notes: null },
    ]);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Timeline / running order</CardTitle>
          <CardDescription>Chronological plan for the event day.</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addItem}>
          <Plus className="h-4 w-4" />
          Add row
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No running order items yet.</p>
        ) : (
          items.map((item, index) => (
            <div
              key={`running-order-${index}`}
              className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/40 sm:grid-cols-12"
            >
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Time</label>
                <Input
                  value={item.time}
                  onChange={(event) => updateItem(index, { time: event.target.value })}
                  placeholder="18:00"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Activity</label>
                <Input
                  value={item.activity}
                  onChange={(event) => updateItem(index, { activity: event.target.value })}
                  placeholder="Guest arrival"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Owner / team</label>
                <Input
                  value={item.owner}
                  onChange={(event) => updateItem(index, { owner: event.target.value })}
                  placeholder="Events team"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Notes</label>
                <Input
                  value={item.notes ?? ""}
                  onChange={(event) =>
                    updateItem(index, { notes: event.target.value.trim() ? event.target.value : null })
                  }
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex items-end sm:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 dark:text-slate-400 hover:text-red-600"
                  onClick={() => removeItem(index)}
                  aria-label="Remove row"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
