"use client";

import { CheckCircle2, FileEdit, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RotaStatusBadge } from "@/components/rota/rota-status-badge";
import { formatCurrency } from "@/lib/mock/rota";
import type { RotaBuilderData } from "@/lib/mock/rota";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RotaPublishPanelProps {
  data: RotaBuilderData;
  isPublishing: boolean;
  isUpdatingStatus: boolean;
  publishMessage: string | null;
  migrationRequired?: boolean;
  onMarkReady: () => void;
  onPublish: () => void;
  onRevertToDraft: () => void;
}

export function RotaPublishPanel({
  data,
  isPublishing,
  isUpdatingStatus,
  publishMessage,
  migrationRequired = false,
  onMarkReady,
  onPublish,
  onRevertToDraft,
}: RotaPublishPanelProps) {
  const { labourSummary, confirmationSummary } = data;
  const hasShifts = data.assignedShifts.length > 0;
  const isPublished = data.rotaStatus === "published";
  const isReady = data.rotaStatus === "ready_to_publish";
  const isDraft = data.rotaStatus === "draft";
  const isBusy = isPublishing || isUpdatingStatus;
  const hasResponses = confirmationSummary.confirmedCount > 0 || confirmationSummary.declinedCount > 0;

  return (
    <div
      className={cn(
        "v-panel space-y-4",
        isPublished && "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/20",
        !isPublished && !hasShifts && "border-amber-200 bg-amber-50/20 dark:border-amber-900 dark:bg-amber-950/10",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Publish rota</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {isPublished
              ? "Staff can view and confirm their assigned shifts."
              : isReady
                ? "Ready to send to staff when you publish."
                : "Build shifts, mark ready, then publish for staff."}
          </p>
        </div>
        <RotaStatusBadge status={data.rotaStatus} />
      </div>

      {data.rotaPublishedAt && (
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Published {formatDate(data.rotaPublishedAt, { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-stone-500 dark:text-stone-400">Assigned staff</dt>
          <dd className="font-medium text-stone-900 dark:text-stone-100">{labourSummary.assignedStaff}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 dark:text-stone-400">Staffing gaps</dt>
          <dd className="font-medium text-stone-900 dark:text-stone-100">{labourSummary.remainingGaps}</dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 dark:text-stone-400">Scheduled hours</dt>
          <dd className="font-medium text-stone-900 dark:text-stone-100">
            {labourSummary.totalScheduledHours.toFixed(1)}h
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 dark:text-stone-400">Est. labour cost</dt>
          <dd className="font-medium text-stone-900 dark:text-stone-100">
            {formatCurrency(labourSummary.estimatedLabourCost)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 dark:text-stone-400">Confirmed</dt>
          <dd className="font-medium text-emerald-700 dark:text-emerald-300">
            {confirmationSummary.confirmedCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-stone-500 dark:text-stone-400">Pending</dt>
          <dd className="font-medium text-amber-700 dark:text-amber-300">
            {confirmationSummary.pendingCount}
          </dd>
        </div>
      </dl>

      {migrationRequired && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Apply{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-900/50">
            supabase/migrations/007_rota_publish.sql
          </code>{" "}
          in Supabase SQL Editor to enable publish workflow.
        </p>
      )}

      {!hasShifts && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Add at least one staff shift before marking ready or publishing.
        </p>
      )}

      {hasShifts && !isPublished && (
        <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-300">
          Shift changes save automatically. Staff cannot see this rota until it is published.
        </p>
      )}

      {isPublished && (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Rota published. Staff notification delivery for email-only accounts will be added later.
        </p>
      )}

      {publishMessage && (
        <p className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 dark:border-brand-900 dark:bg-brand-950/30 dark:text-brand-200">
          {publishMessage}
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {isDraft && (
          <Button
            type="button"
            variant="outline"
            disabled={!hasShifts || isBusy || migrationRequired}
            onClick={onMarkReady}
            className="sm:col-span-2"
          >
            <FileEdit className="mr-2 h-4 w-4" />
            {isUpdatingStatus ? "Updating…" : "Mark ready to publish"}
          </Button>
        )}

        {(isDraft || isReady) && (
          <Button
            type="button"
            disabled={!hasShifts || isBusy || migrationRequired}
            onClick={onPublish}
            className={isReady ? "sm:col-span-2" : undefined}
          >
            <Send className="mr-2 h-4 w-4" />
            {isPublishing ? "Publishing…" : "Publish rota"}
          </Button>
        )}

        {(isReady || isPublished) && (
          <Button
            type="button"
            variant="outline"
            disabled={isBusy || migrationRequired || (isPublished && hasResponses)}
            onClick={onRevertToDraft}
            className="sm:col-span-2"
            title={
              isPublished && hasResponses
                ? "Cannot unpublish after staff have confirmed or declined shifts."
                : undefined
            }
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {isUpdatingStatus
              ? "Reverting…"
              : isPublished
                ? "Unpublish / revert to draft"
                : "Revert to draft"}
          </Button>
        )}
      </div>
    </div>
  );
}
