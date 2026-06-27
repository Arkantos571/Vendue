import type { EnquiryPipelineStats } from "@/lib/mock/enquiries";
import { cn } from "@/lib/utils";

interface EnquiryPipelineCardsProps {
  stats: EnquiryPipelineStats;
}

const cards = [
  { key: "newEnquiries" as const, label: "New enquiries", sublabel: "Awaiting first response" },
  { key: "awaitingReply" as const, label: "Awaiting reply", sublabel: "Needs follow-up" },
  { key: "proposalSent" as const, label: "Proposal sent", sublabel: "Pending client decision" },
  { key: "conversionRate" as const, label: "Conversion rate", sublabel: "Confirmed vs active pipeline" },
];

export function EnquiryPipelineCards({ stats }: EnquiryPipelineCardsProps) {
  const values: Record<string, string> = {
    newEnquiries: String(stats.newEnquiries),
    awaitingReply: String(stats.awaitingReply),
    proposalSent: String(stats.proposalSent),
    conversionRate: `${stats.conversionRate}%`,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, sublabel }) => (
        <div
          key={key}
          className={cn(
            "rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm",
            key === "conversionRate" && "bg-brand-50/30",
          )}
        >
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">{values[key]}</p>
          <p className="mt-1 text-xs text-stone-400">{sublabel}</p>
        </div>
      ))}
    </div>
  );
}
