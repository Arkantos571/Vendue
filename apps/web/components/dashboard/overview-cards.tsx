import { CalendarDays, ClipboardCheck, UserCog, Users } from "lucide-react";
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
    accent: "text-sky-600 bg-sky-50",
  },
  {
    key: "openRotaGaps" as const,
    label: "Open rota gaps",
    sublabel: "Needs assignment",
    icon: UserCog,
    accent: "text-amber-600 bg-amber-50",
  },
  {
    key: "teamMembers" as const,
    label: "Team members",
    sublabel: "Active roster",
    icon: Users,
    accent: "text-brand-700 bg-brand-50",
  },
  {
    key: "onboarding" as const,
    label: "Onboarding",
    sublabel: "Setup progress",
    icon: ClipboardCheck,
    accent: "text-violet-600 bg-violet-50",
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
      {cards.map(({ key, label, sublabel, icon: Icon, accent }) => (
        <div
          key={key}
          className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-stone-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                {values[key]}
              </p>
              <p className="mt-1 text-xs text-stone-400">{sublabel}</p>
            </div>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
