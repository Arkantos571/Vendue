"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AddShiftForm, type NewShiftInput } from "@/components/rota/add-shift-form";
import type { EditShiftInput } from "@/components/rota/edit-shift-form";
import { AssignedShiftsList } from "@/components/rota/assigned-shifts-list";
import { AvailableStaffPanel } from "@/components/rota/available-staff-panel";
import { EventSummaryHeader } from "@/components/rota/event-summary-header";
import { LabourCostSummary } from "@/components/rota/labour-cost-summary";
import { RotaConfirmationSummary } from "@/components/rota/rota-confirmation-summary";
import { RotaPublishPanel } from "@/components/rota/rota-publish-panel";
import { StaffingRequirementsSummary } from "@/components/rota/staffing-requirements-summary";
import { VenueRequiredEmptyState } from "@/components/events/venue-required-empty-state";
import type { AvailableStaffMember, RotaBuilderData } from "@/lib/mock/rota";
import { buildLabourSummary } from "@/lib/rota/mappers";
import { UNAVAILABILITY_SCHEMA_HINT } from "@/lib/availability/constants";
import {
  createRotaShiftAction,
  deleteRotaShiftAction,
  loadRotaBuilderAction,
  markRotaReadyAction,
  publishRotaAction,
  revertRotaToDraftAction,
  updateRotaShiftAction,
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
  const [updatingShiftId, setUpdatingShiftId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [unavailabilityMigrationRequired, setUnavailabilityMigrationRequired] = useState(false);

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
    setMigrationRequired(Boolean(result.migrationRequired));
    setUnavailabilityMigrationRequired(Boolean(result.unavailabilityMigrationRequired));
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


  async function updateShift(input: EditShiftInput) {
    setUpdatingShiftId(input.shiftId);
    setError(null);

    const result = await updateRotaShiftAction({
      shift_id: input.shiftId,
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
      status: input.status,
    });

    setUpdatingShiftId(null);

    if (!result.success) {
      setError(result.error);
      throw new Error(result.error);
    }

    await reload();
  }

  async function handleMarkReady() {
    setIsUpdatingStatus(true);
    setError(null);
    setPublishMessage(null);

    const result = await markRotaReadyAction(eventId);
    setIsUpdatingStatus(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    await reload();
  }

  async function handlePublish() {
    setIsPublishing(true);
    setError(null);
    setPublishMessage(null);

    const result = await publishRotaAction(eventId);
    setIsPublishing(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setPublishMessage(result.message);
    await reload();
  }

  async function handleRevertToDraft() {
    setIsUpdatingStatus(true);
    setError(null);
    setPublishMessage(null);

    const result = await revertRotaToDraftAction(eventId);
    setIsUpdatingStatus(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    await reload();
  }

  if (isLoading) {
    return (
      <div className="v-empty">
        <p className="text-sm text-muted-foreground">Loading rota…</p>
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
        <p className="text-sm font-medium text-foreground">Event not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This event may not exist or is not in your venue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {unavailabilityMigrationRequired && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {UNAVAILABILITY_SCHEMA_HINT}
        </div>
      )}

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
            staffOptions={rosterStaff}
            onDeleteShift={deleteShift}
            onUpdateShift={updateShift}
            isDeletingShiftId={deletingShiftId}
            isUpdatingShiftId={updatingShiftId}
          />
        </div>

        <div className="space-y-6">
          <LabourCostSummary summary={labourSummary} />

          <RotaPublishPanel
            data={{ ...data, labourSummary }}
            isPublishing={isPublishing}
            isUpdatingStatus={isUpdatingStatus}
            publishMessage={publishMessage}
            migrationRequired={migrationRequired}
            onMarkReady={handleMarkReady}
            onPublish={handlePublish}
            onRevertToDraft={handleRevertToDraft}
          />
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
