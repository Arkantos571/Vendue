"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { AddShiftForm, type NewShiftInput } from "@/components/rota/add-shift-form";
import { AssignedShiftsList } from "@/components/rota/assigned-shifts-list";
import { AvailableStaffPanel } from "@/components/rota/available-staff-panel";
import { EventSummaryHeader } from "@/components/rota/event-summary-header";
import { LabourCostSummary } from "@/components/rota/labour-cost-summary";
import { StaffingRequirementsSummary } from "@/components/rota/staffing-requirements-summary";
import { Button } from "@/components/ui/button";
import {
  calculateShiftCost,
  type AssignedShift,
  type AvailableStaffMember,
  type RotaBuilderData,
} from "@/lib/mock/rota";

interface RotaBuilderProps {
  initialData: RotaBuilderData;
}

function createShiftId(): string {
  return `shift-new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildShiftFromInput(input: NewShiftInput): AssignedShift {
  return {
    id: createShiftId(),
    staffMemberId: input.staffMemberId,
    staffName: input.staffName,
    role: input.role,
    section: input.section,
    arrivalTime: input.arrivalTime,
    startTime: input.startTime,
    finishTime: input.finishTime,
    breakMinutes: input.breakMinutes,
    hourlyRate: input.hourlyRate,
    estimatedCost: calculateShiftCost(
      input.startTime,
      input.finishTime,
      input.breakMinutes,
      input.hourlyRate,
    ),
    notes: input.notes,
    status: "draft",
  };
}

export function RotaBuilder({ initialData }: RotaBuilderProps) {
  const [shifts, setShifts] = useState<AssignedShift[]>(initialData.assignedShifts);
  const [published, setPublished] = useState(initialData.rotaStatus === "published");

  const assignedStaffIds = useMemo(
    () => new Set(shifts.map((shift) => shift.staffMemberId)),
    [shifts],
  );

  const availableStaff = useMemo(
    () => initialData.availableStaff.filter((member) => !assignedStaffIds.has(member.id)),
    [initialData.availableStaff, assignedStaffIds],
  );

  const labourSummary = useMemo(() => {
    const totalScheduledHours = shifts.reduce((total, shift) => {
      const start = shift.startTime.split(":").map(Number);
      const finish = shift.finishTime.split(":").map(Number);
      let startMin = start[0] * 60 + start[1];
      let finishMin = finish[0] * 60 + finish[1];
      if (finishMin < startMin) finishMin += 24 * 60;
      return total + Math.max(0, (finishMin - startMin - shift.breakMinutes) / 60);
    }, 0);

    const estimatedLabourCost = shifts.reduce((total, shift) => total + shift.estimatedCost, 0);

    return {
      totalScheduledHours,
      estimatedLabourCost,
      requiredStaff: initialData.labourSummary.requiredStaff,
      assignedStaff: shifts.length,
      remainingGaps: Math.max(0, initialData.labourSummary.requiredStaff - shifts.length),
    };
  }, [shifts, initialData.labourSummary.requiredStaff]);

  function addShift(input: NewShiftInput) {
    setShifts((current) => [...current, buildShiftFromInput(input)]);
  }

  function addStaffQuick(member: AvailableStaffMember) {
    if (member.hourlyRate === null) return;

    addShift({
      staffMemberId: member.id,
      staffName: member.name,
      role: member.role,
      section: "Main floor",
      arrivalTime: initialData.startTime,
      startTime: initialData.startTime,
      finishTime: initialData.endTime,
      breakMinutes: 30,
      hourlyRate: member.hourlyRate,
      notes: null,
    });
  }

  function handlePublish() {
    setPublished(true);
  }

  const canPublish = labourSummary.remainingGaps === 0 && !published;

  return (
    <div className="space-y-6">
      <EventSummaryHeader data={initialData} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <StaffingRequirementsSummary requirements={initialData.staffingRequirements} />
          <AssignedShiftsList shifts={shifts} />
        </div>

        <div className="space-y-6">
          <LabourCostSummary summary={labourSummary} />

          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-stone-900">Publish rota</h3>
            <p className="mt-1 text-sm text-stone-500">
              {published
                ? "This rota has been published. Staff can view shifts in the mobile app when connected."
                : canPublish
                  ? "All required positions are filled. Ready to publish."
                  : "Fill remaining gaps before publishing."}
            </p>
            <Button
              type="button"
              className="mt-4 w-full"
              disabled={!canPublish}
              onClick={handlePublish}
            >
              <Send className="mr-2 h-4 w-4" />
              {published ? "Published" : "Publish rota"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AvailableStaffPanel staff={availableStaff} onAddToRota={addStaffQuick} />
        <AddShiftForm
          staffOptions={availableStaff}
          defaultStartTime={initialData.startTime}
          defaultFinishTime={initialData.endTime}
          onAddShift={addShift}
        />
      </div>
    </div>
  );
}
