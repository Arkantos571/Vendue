import { cn } from "@/lib/utils";

export type FunctionSheetSaveStatus = "saved" | "saving" | "unsaved" | "error";

const statusConfig: Record<
  FunctionSheetSaveStatus,
  { label: string; className: string }
> = {
  saved: {
    label: "Saved",
    className:
      "text-slate-500 dark:text-slate-400 ",
  },
  saving: {
    label: "Saving...",
    className: "text-slate-600 dark:text-slate-300 ",
  },
  unsaved: {
    label: "Unsaved changes",
    className: "text-amber-700 dark:text-amber-300",
  },
  error: {
    label: "Couldn't save changes",
    className: "text-red-700 dark:text-red-300",
  },
};

export function FunctionSheetSaveStatus({
  status,
  error,
}: {
  status: FunctionSheetSaveStatus;
  error?: string | null;
}) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
          status === "saved" &&
            "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60",
          status === "saving" &&
            "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60",
          status === "unsaved" &&
            "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
          status === "error" &&
            "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
          config.className,
        )}
        aria-live="polite"
      >
        {status === "saving" && (
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
        )}
        {config.label}
      </span>
      {status === "error" && error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}
