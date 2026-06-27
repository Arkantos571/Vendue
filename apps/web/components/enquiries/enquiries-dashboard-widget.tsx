import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import type { EnquiryPipelineStats } from "@/lib/mock/enquiries";

interface EnquiriesDashboardWidgetProps {
  stats: EnquiryPipelineStats;
}

export function EnquiriesDashboardWidget({ stats }: EnquiriesDashboardWidgetProps) {
  return (
    <Link
      href="/dashboard/enquiries"
      className="block v-card p-5 transition-all hover:border-stone-300 hover:bg-stone-50/80 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Enquiries pipeline</p>
            <p className="mt-1 text-sm text-stone-500">
              {stats.newEnquiries} new · {stats.awaitingReply} awaiting reply · {stats.proposalSent} proposals out
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700">
          View pipeline
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
