import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarNavControlsProps {
  label: string;
}

export function CalendarNavControls({ label }: CalendarNavControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button type="button" variant="outline" size="sm" disabled>
          Today
        </Button>
        <Button type="button" variant="outline" size="sm" disabled className="gap-1">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
