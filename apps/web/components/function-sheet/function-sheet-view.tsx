import type { MockEvent } from "@/lib/mock/events";
import type { FunctionSheet } from "@/lib/mock/function-sheet";
import { FoodBeverageCard } from "@/components/function-sheet/food-beverage-card";
import { FunctionSheetActions } from "@/components/function-sheet/function-sheet-actions";
import { FunctionSheetEventSummary } from "@/components/function-sheet/function-sheet-event-summary";
import { InternalNotesSection } from "@/components/function-sheet/internal-notes-section";
import { OperationalChecklist } from "@/components/function-sheet/operational-checklist";
import { RunningOrderTable } from "@/components/function-sheet/running-order-table";
import { SetupRequirementsCard } from "@/components/function-sheet/setup-requirements-card";
import { StaffingPlanSummaryCard } from "@/components/function-sheet/staffing-plan-summary";

interface FunctionSheetViewProps {
  event: MockEvent;
  functionSheet: FunctionSheet;
  hasRotaBuilder: boolean;
}

export function FunctionSheetView({ event, functionSheet, hasRotaBuilder }: FunctionSheetViewProps) {
  return (
    <div className="space-y-6 print:space-y-4">
      <FunctionSheetActions eventId={event.id} hasRotaBuilder={hasRotaBuilder} />
      <FunctionSheetEventSummary event={event} />
      <RunningOrderTable items={functionSheet.runningOrder} />
      <div className="grid gap-6 lg:grid-cols-2">
        <SetupRequirementsCard setup={functionSheet.setup} />
        <FoodBeverageCard foodAndBeverage={functionSheet.foodAndBeverage} />
      </div>
      <StaffingPlanSummaryCard
        eventId={event.id}
        staffing={functionSheet.staffingPlan}
        hasRotaBuilder={hasRotaBuilder}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <OperationalChecklist items={functionSheet.checklist} />
        <InternalNotesSection notes={functionSheet.internalNotes} />
      </div>
    </div>
  );
}
