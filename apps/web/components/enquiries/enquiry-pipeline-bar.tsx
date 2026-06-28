import { Check } from "lucide-react";
import { enquiryStatusLabels, type EnquiryStatus } from "@/lib/mock/enquiries";
import { cn } from "@/lib/utils";

const PIPELINE_STEPS: EnquiryStatus[] = ["new", "contacted", "proposal_sent", "confirmed"];

interface EnquiryPipelineBarProps {
  status: EnquiryStatus;
}

function stepIndex(status: EnquiryStatus): number {
  if (status === "lost") return -1;
  return PIPELINE_STEPS.indexOf(status);
}

export function EnquiryPipelineBar({ status }: EnquiryPipelineBarProps) {
  const activeIndex = stepIndex(status);
  const isLost = status === "lost";

  return (
    <div className="v-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Sales pipeline</p>
        {isLost && (
          <span className="inline-flex w-fit items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            {enquiryStatusLabels.lost}
          </span>
        )}
      </div>

      <ol className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
        {PIPELINE_STEPS.map((step, index) => {
          const isComplete = !isLost && activeIndex > index;
          const isCurrent = !isLost && activeIndex === index;
          const isUpcoming = isLost || activeIndex < index;

          return (
            <li key={step} className="flex flex-1 items-center gap-2 sm:flex-col sm:gap-2 sm:text-center">
              <div className="flex items-center gap-2 sm:flex-col">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    isComplete && "border-emerald-600 bg-emerald-600 text-white",
                    isCurrent && "border-brand-700 bg-brand-700 text-white",
                    isUpcoming && "border-stone-200 bg-white text-stone-400 dark:border-stone-700 dark:bg-stone-900",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-brand-700 dark:text-brand-400",
                    isComplete && "text-emerald-700 dark:text-emerald-400",
                    isUpcoming && "text-stone-400",
                  )}
                >
                  {enquiryStatusLabels[step]}
                </span>
              </div>
              {index < PIPELINE_STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden h-0.5 flex-1 sm:block",
                    isComplete ? "bg-emerald-500" : "bg-stone-200 dark:bg-stone-700",
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
