"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENT_START_TIME_OPTIONS,
  endSelectionKey,
  getEndTimeOptionsForStart,
  parseEndTimeSelection,
} from "@/lib/events/event-time";
import {
  rotaRoleOptions,
  rotaSections,
  type AssignedShift,
  type AvailableStaffMember,
} from "@/lib/mock/rota";
import type { RotaShiftStatus } from "@/types";

function uiStatusToDb(status: AssignedShift["status"]): RotaShiftStatus {
  if (status === "confirmed") return "confirmed";
  if (status === "declined") return "declined";
  return "scheduled";
}

export interface EditShiftInput {
  shiftId: string;
  staffMemberId: string;
  role: string;
  section: string;
  arrivalTime: string;
  startTime: string;
  finishTime: string;
  finishIsNextDay: boolean;
  breakMinutes: number;
  notes: string | null;
  status: RotaShiftStatus;
}

interface EditShiftFormProps {
  shift: AssignedShift;
  staffOptions: AvailableStaffMember[];
  isSubmitting?: boolean;
  onSave: (input: EditShiftInput) => Promise<void> | void;
  onCancel: () => void;
}

export function EditShiftForm({
  shift,
  staffOptions,
  isSubmitting = false,
  onSave,
  onCancel,
}: EditShiftFormProps) {
  const [staffMemberId, setStaffMemberId] = useState(shift.staffMemberId);
  const [role, setRole] = useState(shift.role);
  const [section, setSection] = useState(shift.section);
  const [arrivalTime, setArrivalTime] = useState(shift.arrivalTime);
  const [startTime, setStartTime] = useState(shift.startTime);
  const [finishSelection, setFinishSelection] = useState(
    endSelectionKey(shift.finishTime, shift.finishIsNextDay ?? false),
  );
  const [breakMinutes, setBreakMinutes] = useState(String(shift.breakMinutes));
  const [notes, setNotes] = useState(shift.notes ?? "");
  const [status, setStatus] = useState<RotaShiftStatus>(uiStatusToDb(shift.status));
  const [error, setError] = useState<string | null>(null);

  const finishOptions = useMemo(() => {
    if (!startTime) return { sameDay: [], nextDay: [] };
    return getEndTimeOptionsForStart(startTime);
  }, [startTime]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!startTime || !finishSelection) {
      setError("Start and finish times are required.");
      return;
    }
    const { time: finishTime, nextDay: finishIsNextDay } = parseEndTimeSelection(finishSelection);
    try {
      await onSave({
        shiftId: shift.id,
        staffMemberId,
        role,
        section,
        arrivalTime,
        startTime,
        finishTime,
        finishIsNextDay,
        breakMinutes: Number(breakMinutes) || 0,
        notes: notes.trim() || null,
        status,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to update shift.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-lg border border-brand-200 bg-brand-50/30 p-4 dark:border-brand-900 dark:bg-brand-950/20">
      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Edit shift — {shift.staffName}</p>
      {error ? <p className="text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Staff member</Label>
          <Select value={staffMemberId} onChange={(e) => setStaffMemberId(e.target.value)} required>
            {staffOptions.map((member) => (
              <option key={member.id} value={member.id}>{member.name} — {member.role}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2"><Label>Role</Label><Select value={role} onChange={(e) => setRole(e.target.value)}>{rotaRoleOptions.map((o) => <option key={o} value={o}>{o}</option>)}</Select></div>
        <div className="space-y-2"><Label>Section</Label><Select value={section} onChange={(e) => setSection(e.target.value)}>{rotaSections.map((o) => <option key={o} value={o}>{o}</option>)}</Select></div>
        <div className="space-y-2"><Label>Arrival</Label><Select value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)}>{EVENT_START_TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></div>
        <div className="space-y-2"><Label>Start</Label><Select value={startTime} onChange={(e) => setStartTime(e.target.value)}>{EVENT_START_TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></div>
        <div className="space-y-2 sm:col-span-2"><Label>Finish</Label><Select value={finishSelection} disabled={!startTime} onChange={(e) => setFinishSelection(e.target.value)}>{finishOptions.sameDay.map((o) => <option key={endSelectionKey(o.value, false)} value={endSelectionKey(o.value, false)}>{o.label}</option>)}{finishOptions.nextDay.map((o) => <option key={endSelectionKey(o.value, true)} value={endSelectionKey(o.value, true)}>{o.label} next day</option>)}</Select></div>
        <div className="space-y-2"><Label>Break (min)</Label><Input type="number" min={0} value={breakMinutes} onChange={(e) => setBreakMinutes(e.target.value)} /></div>
        <div className="space-y-2"><Label>Status</Label><Select value={status} onChange={(e) => setStatus(e.target.value as RotaShiftStatus)}><option value="scheduled">Scheduled</option><option value="confirmed">Confirmed</option><option value="declined">Declined</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></Select></div>
        <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save shift"}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
      </div>
    </form>
  );
}
