import Link from "next/link";
import { CalendarDays, ClipboardCheck, UserCog, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/lib/mock/dashboard";

interface OverviewCardsProps {
  stats: DashboardStats;
}

const cards = [
  {
    key: "upcomingEvents" as const,
    label: "Upcoming events",
    sublabel: "Next 7 days",
    icon: CalendarDays,
    accent: "text-sky-600 bg-sky-50 dark:text-sky-300 dark:bg-sky-950/60",
    href: "/dashboard/events/upcoming",
  },
  {
    key: "openRotaGaps" as const,
    label: "Open rota gaps",
    sublabel: "Needs assignment",
    icon: UserCog,
    accent: "text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60",
    href: "/dashboard/rota",
  },
  {
    key: "teamMembers" as const,
    label: "Team members",
    sublabel: "Active roster",
    icon: Users,
    accent: "text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-950/60",
    href: "/dashboard/team",
  },
  {
    key: "onboarding" as const,
    label: "Setup status",
    sublabel: "Venue setup",
    icon: ClipboardCheck,
    accent: "text-violet-600 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/60",
    href: "/dashboard/settings",
  },
];

export function OverviewCards({ stats }: OverviewCardsProps) {
  const values: Record<string, string> = {
    upcomingEvents: String(stats.upcomingEvents),
    openRotaGaps: String(stats.openRotaGaps),
    teamMembers: String(stats.teamMembers),
    onboarding: `${stats.onboardingComplete}/${stats.onboardingTotal}`,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, sublabel, icon: Icon, accent, href }) => (
        <Link
          key={key}
          href={href}
          className={cn(
            "block v-card p-5 shadow-sm",
            "cursor-pointer transition-all hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-md",
            "dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800/80",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {values[key]}
              </p>
              <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{sublabel}</p>
            </div>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
