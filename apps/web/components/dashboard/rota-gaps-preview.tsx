import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { RotaGapPreview } from "@/lib/mock/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RotaGapsPreviewProps {
  gaps: RotaGapPreview[];
}

export function RotaGapsPreview({ gaps }: RotaGapsPreviewProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Rota gaps</CardTitle>
          <CardDescription>Shifts that still need staff assigned.</CardDescription>
        </div>
        <Link
          href="/dashboard/team"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Manage rota
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {gaps.map((gap) => (
            <li
              key={gap.id}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50/50 px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    gap.priority === "high" ? "text-amber-600" : "text-stone-400",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{gap.role}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300">{gap.eventTitle}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(gap.date)} · {gap.time} · {gap.space}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                    gap.priority === "high"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600 dark:text-slate-300",
                  )}
                >
                  {gap.priority === "high" ? "Urgent" : "Open"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
