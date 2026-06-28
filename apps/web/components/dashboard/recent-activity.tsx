import { CalendarDays, ClipboardCheck, UserCog, Users } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import type { ActivityItem } from "@/lib/mock/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const typeConfig: Record<
  ActivityItem["type"],
  { icon: typeof CalendarDays; color: string }
> = {
  event: { icon: CalendarDays, color: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300" },
  rota: { icon: UserCog, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300" },
  team: { icon: Users, color: "bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300" },
  onboarding: { icon: ClipboardCheck, color: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300" },
};

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Latest operational updates across your venue.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {items.map((item) => {
            const { icon: Icon, color } = typeConfig[item.type];

            return (
              <li key={item.id} className="flex gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-900 dark:text-slate-100">{item.message}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.actor} · {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
