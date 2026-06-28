"use client";

import { FoodBeverageCard } from "@/components/function-sheet/food-beverage-card";
import { FunctionSheetActions } from "@/components/function-sheet/function-sheet-actions";
import { FunctionSheetEventSummary } from "@/components/function-sheet/function-sheet-event-summary";
import { InternalNotesSection } from "@/components/function-sheet/internal-notes-section";
import { OperationalChecklist } from "@/components/function-sheet/operational-checklist";
import { RunningOrderTable } from "@/components/function-sheet/running-order-table";
import { SetupRequirementsCard } from "@/components/function-sheet/setup-requirements-card";
import { StaffingPlanSummaryCard } from "@/components/function-sheet/staffing-plan-summary";
import { useFunctionSheetAutosave } from "@/components/function-sheet/use-function-sheet-autosave";
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
  const { functionSheet, saveStatus, saveError, updateFunctionSheet, saveNow, isSaving } =
    useFunctionSheetAutosave({
      eventId: event.id,
      initialFunctionSheet,
    });

  return (
    <div className="space-y-6 print:space-y-4">
      <FunctionSheetActions
        eventId={event.id}
        hasRotaBuilder={hasRotaBuilder}
        saveStatus={saveStatus}
        saveError={saveError}
        isSaving={isSaving}
        onSaveNow={saveNow}
      />

      {!isPersisted && saveStatus === "saved" && (
        <p className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800/40 dark:text-stone-300">
          Review the default function sheet below. Changes save automatically as you edit.
        </p>
      )}

      <FunctionSheetEventSummary event={event} />
      <RunningOrderTable
        items={functionSheet.runningOrder}
        onChange={(runningOrder) =>
          updateFunctionSheet((current) => ({ ...current, runningOrder }))
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <SetupRequirementsCard
          setup={functionSheet.setup}
          onChange={(setup) => updateFunctionSheet((current) => ({ ...current, setup }))}
        />
        <FoodBeverageCard
          foodAndBeverage={functionSheet.foodAndBeverage}
          onChange={(foodAndBeverage) =>
            updateFunctionSheet((current) => ({ ...current, foodAndBeverage }))
          }
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
          onChange={(checklist) =>
            updateFunctionSheet((current) => ({ ...current, checklist }))
          }
        />
        <InternalNotesSection
          notes={functionSheet.internalNotes}
          onChange={(internalNotes) =>
            updateFunctionSheet((current) => ({ ...current, internalNotes }))
          }
        />
      </div>
    </div>
  );
}
