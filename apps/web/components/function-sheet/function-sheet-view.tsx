"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FoodBeverageCard } from "@/components/function-sheet/food-beverage-card";
import { FunctionSheetActions } from "@/components/function-sheet/function-sheet-actions";
import { FunctionSheetEventSummary } from "@/components/function-sheet/function-sheet-event-summary";
import { InternalNotesSection } from "@/components/function-sheet/internal-notes-section";
import { OperationalChecklist } from "@/components/function-sheet/operational-checklist";
import { RunningOrderTable } from "@/components/function-sheet/running-order-table";
import { SetupRequirementsCard } from "@/components/function-sheet/setup-requirements-card";
import { StaffingPlanSummaryCard } from "@/components/function-sheet/staffing-plan-summary";
import { saveFunctionSheetAction } from "@/lib/function-sheets/actions";
import type { MockEvent } from "@/lib/mock/events";
import type { FunctionSheet, StaffingPlanSummary } from "@/lib/mock/function-sheet";

interface FunctionSheetViewProps {
  event: MockEvent;
  initialFunctionSheet: FunctionSheet;
  initialStaffingPlan: StaffingPlanSummary;
  isPersisted: boolean;
  hasRotaBuilder: boolean;
}

export function FunctionSheetView({
  event,
  initialFunctionSheet,
  initialStaffingPlan,
  isPersisted,
  hasRotaBuilder,
}: FunctionSheetViewProps) {
  const router = useRouter();
  const [functionSheet, setFunctionSheet] = useState(initialFunctionSheet);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setFunctionSheet(initialFunctionSheet);
  }, [initialFunctionSheet]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const result = await saveFunctionSheetAction({
      event_id: event.id,
      function_sheet_id: functionSheet.id,
      running_order: functionSheet.runningOrder,
      setup: functionSheet.setup,
      food_and_beverage: functionSheet.foodAndBeverage,
      checklist: functionSheet.checklist,
      internal_notes: functionSheet.internalNotes,
    });

    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setFunctionSheet(result.functionSheet);
    setSuccessMessage("Function sheet saved.");
    router.refresh();
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <FunctionSheetActions
        eventId={event.id}
        hasRotaBuilder={hasRotaBuilder}
        isSaving={isSaving}
        onSave={handleSave}
      />

      {!isPersisted && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          This function sheet has not been saved yet. Review the defaults below, then click Save function sheet.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      {successMessage && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          {successMessage}
        </p>
      )}

      <FunctionSheetEventSummary event={event} />
      <RunningOrderTable
        items={functionSheet.runningOrder}
        onChange={(runningOrder) => setFunctionSheet({ ...functionSheet, runningOrder })}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SetupRequirementsCard
          setup={functionSheet.setup}
          onChange={(setup) => setFunctionSheet({ ...functionSheet, setup })}
        />
        <FoodBeverageCard
          foodAndBeverage={functionSheet.foodAndBeverage}
          onChange={(foodAndBeverage) => setFunctionSheet({ ...functionSheet, foodAndBeverage })}
        />
      </div>
      <StaffingPlanSummaryCard
        eventId={event.id}
        staffing={initialStaffingPlan}
        hasRotaBuilder={hasRotaBuilder}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <OperationalChecklist
          items={functionSheet.checklist}
          onChange={(checklist) => setFunctionSheet({ ...functionSheet, checklist })}
        />
        <InternalNotesSection
          notes={functionSheet.internalNotes}
          onChange={(internalNotes) => setFunctionSheet({ ...functionSheet, internalNotes })}
        />
      </div>
    </div>
  );
}
