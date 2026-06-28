"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { AddShiftForm, type NewShiftInput } from "@/components/rota/add-shift-form";
import { AssignedShiftsList } from "@/components/rota/assigned-shifts-list";
import { AvailableStaffPanel } from "@/components/rota/available-staff-panel";
import { EventSummaryHeader } from "@/components/rota/event-summary-header";
import { LabourCostSummary } from "@/components/rota/labour-cost-summary";
import { RotaConfirmationSummary } from "@/components/rota/rota-confirmation-summary";
import { StaffingRequirementsSummary } from "@/components/rota/staffing-requirements-summary";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import { Button } from "@/components/ui/button";
import type { AvailableStaffMember, RotaBuilderData } from "@/lib/mock/rota";
import { buildLabourSummary } from "@/lib/rota/mappers";
import {
  createRotaShiftAction,
  deleteRotaShiftAction,
  loadRotaBuilderAction,
  publishRotaAction,
} from "@/lib/rota/actions";

interface RotaBuilderProps {
  eventId: string;
  initialData?: RotaBuilderData | null;
}

export function RotaBuilder({ eventId, initialData = null }: RotaBuilderProps) {
  const [data, setData] = useState<RotaBuilderData | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [noVenue, setNoVenue] = useState(false);
  const [isSubmittingShift, setIsSubmittingShift] = useState(false);
  const [deletingShiftId, setDeletingShiftId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    const result = await loadRotaBuilderAction(eventId);

    if (!result.success) {
      setError(result.error);
      setData(null);
      setNoVenue(false);
      return;
    }

    if (result.noVenue) {
      setNoVenue(true);
      setData(null);
      return;
    }

    setData(result.data);
    setNoVenue(false);
  }, [eventId]);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      await reload();
      if (!cancelled) {
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [eventId, initialData, reload]);

  const assignedStaffIds = useMemo(
    () => new Set((data?.assignedShifts ?? []).map((shift) => shift.staffMemberId)),
    [data?.assignedShifts],
  );

  const rosterStaff = data?.availableStaff ?? [];

  const unassignedStaff = useMemo(
    () => rosterStaff.filter((member) => !assignedStaffIds.has(member.id)),
    [rosterStaff, assignedStaffIds],
  );

  const labourSummary = useMemo(() => {
    if (!data) {
      return buildLabourSummary([], 0);
    }
    return buildLabourSummary(data.assignedShifts, data.labourSummary.requiredStaff);
  }, [data]);

  async function addShift(input: NewShiftInput) {
    setIsSubmittingShift(true);
    setError(null);

    const result = await createRotaShiftAction({
      event_id: eventId,
      team_member_id: input.staffMemberId,
      role_label: input.role,
      section: input.section,
      arrival_time: input.arrivalTime,
      start_time: input.startTime,
      finish_time: input.finishTime,
      finish_is_next_day: input.finishIsNextDay,
      break_minutes: input.breakMinutes,
      notes: input.notes ?? undefined,
    });

    setIsSubmittingShift(false);

    if (!result.success) {
      setError(result.error);
      throw new Error(result.error);
    }

    await reload();
  }

  async function addStaffQuick(member: AvailableStaffMember) {
    if (member.hourlyRate === null || !data) return;

    await addShift({
      staffMemberId: member.id,
      staffName: member.name,
      role: member.role,
      section: "Main floor",
      arrivalTime: data.startTime,
      startTime: data.startTime,
      finishTime: data.endTime,
      finishIsNextDay: data.endsNextDay ?? false,
      breakMinutes: 30,
      hourlyRate: member.hourlyRate,
      notes: null,
    });
  }

  async function deleteShift(shiftId: string) {
    setDeletingShiftId(shiftId);
    setError(null);

    const result = await deleteRotaShiftAction(shiftId, eventId);

    setDeletingShiftId(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    await reload();
  }

  async function handlePublish() {
    setIsPublishing(true);
    setError(null);

    const result = await publishRotaAction(eventId);

    setIsPublishing(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    await reload();
  }

  if (isLoading) {
    return (
      <div className="v-empty">
        <p className="text-sm text-stone-500">Loading rota…</p>
      </div>
    );
  }

  if (noVenue) {
    return (
      <VenueRequiredEmptyState
        message="Set up your venue before building rotas"
        description="Add your venue in Settings before scheduling event staff."
        href="/dashboard/settings"
        buttonLabel="Go to settings"
      />
    );
  }

  if (!data) {
    return (
      <div className="v-empty">
        <p className="text-sm font-medium text-stone-900">Event not found</p>
        <p className="mt-1 text-sm text-stone-500">
          This event may not exist or is not in your venue.
        </p>
      </div>
    );
  }

  const published = data.rotaStatus === "published";
  const canPublish = data.assignedShifts.length > 0 && !published;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <EventSummaryHeader data={data} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RotaConfirmationSummary summary={data.confirmationSummary} />
          <StaffingRequirementsSummary requirements={data.staffingRequirements} />
          <AssignedShiftsList
            shifts={data.assignedShifts}
            onDeleteShift={deleteShift}
            isDeletingShiftId={deletingShiftId}
          />
        </div>

        <div className="space-y-6">
          <LabourCostSummary summary={labourSummary} />

          <div className="v-panel">
            <h3 className="text-sm font-semibold text-stone-900">Publish rota</h3>
            <p className="mt-1 text-sm text-stone-500">
              {published
                ? "This rota has been published. Staff can confirm their assigned shifts."
                : canPublish
                  ? "Publish this rota so staff can review and confirm their shifts."
                  : "Add at least one shift before publishing."}
            </p>
            <Button
              type="button"
              className="mt-4 w-full"
              disabled={!canPublish || isPublishing}
              onClick={handlePublish}
            >
              <Send className="mr-2 h-4 w-4" />
              {isPublishing ? "Publishing…" : published ? "Published" : "Publish rota"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AvailableStaffPanel staff={unassignedStaff} onAddToRota={addStaffQuick} />
        <AddShiftForm
          staffOptions={rosterStaff}
          defaultStartTime={data.startTime}
          defaultFinishTime={data.endTime}
          defaultFinishIsNextDay={data.endsNextDay}
          isSubmitting={isSubmittingShift}
          onAddShift={addShift}
        />
      </div>
    </div>
  );
}
