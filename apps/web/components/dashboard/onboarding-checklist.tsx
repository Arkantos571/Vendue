import Link from "next/link";
import { Check } from "lucide-react";
import type { OnboardingChecklistItem } from "@/lib/mock/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OnboardingChecklistProps {
  items: OnboardingChecklistItem[];
  complete: number;
  total: number;
}

export function OnboardingChecklist({ items, complete, total }: OnboardingChecklistProps) {
  const progress = Math.round((complete / total) * 100);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Setup checklist</CardTitle>
            <CardDescription>
              Complete setup to unlock full event and rota workflows.
            </CardDescription>
          </div>
          <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-200">
            {progress}%
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-600 transition-all dark:bg-brand-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
                  item.completed
                    ? "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    : "border-brand-200 bg-brand-50/40 hover:bg-brand-50 dark:border-brand-800 dark:bg-brand-950/30 dark:hover:bg-brand-950/50",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    item.completed
                      ? "bg-brand-600 text-white dark:bg-brand-500"
                      : "border-2 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900",
                  )}
                >
                  {item.completed && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      item.completed
                        ? "text-slate-700 dark:text-slate-300 "
                        : "text-slate-900 dark:text-slate-100 ",
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
