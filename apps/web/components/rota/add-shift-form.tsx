"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_START_TIME_OPTIONS } from "@/lib/events/event-time";
import {
  rotaRoleOptions,
  rotaSections,
  type AvailableStaffMember,
} from "@/lib/mock/rota";
import { getEndTimeOptionsForStart } from "@/lib/events/event-time";

export interface NewShiftInput {
  staffMemberId: string;
  staffName: string;
  role: string;
  section: string;
  arrivalTime: string;
  startTime: string;
  finishTime: string;
  finishIsNextDay: boolean;
  breakMinutes: number;
  hourlyRate: number;
  notes: string | null;
}

interface AddShiftFormProps {
  staffOptions: AvailableStaffMember[];
  defaultStartTime: string;
  defaultFinishTime: string;
  defaultFinishIsNextDay?: boolean;
  isSubmitting?: boolean;
  onAddShift: (shift: NewShiftInput) => Promise<void> | void;
}

function finishSelectionKey(time: string, nextDay: boolean): string {
  return nextDay ? `next|${time}` : `same|${time}`;
}

function parseFinishSelectionKey(key: string): { time: string; nextDay: boolean } {
  if (key.startsWith("next|")) {
    return { time: key.slice(5), nextDay: true };
  }
  if (key.startsWith("same|")) {
    return { time: key.slice(5), nextDay: false };
  }
  return { time: key, nextDay: false };
}

export function AddShiftForm({
  staffOptions,
  defaultStartTime,
  defaultFinishTime,
  defaultFinishIsNextDay = false,
  isSubmitting = false,
  onAddShift,
}: AddShiftFormProps) {
  const [staffMemberId, setStaffMemberId] = useState("");
  const [role, setRole] = useState(rotaRoleOptions[0]);
  const [section, setSection] = useState(rotaSections[0]);
  const [arrivalTime, setArrivalTime] = useState(defaultStartTime);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [finishSelection, setFinishSelection] = useState(
    finishSelectionKey(defaultFinishTime, defaultFinishIsNextDay),
  );
  const [breakMinutes, setBreakMinutes] = useState("30");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const finishOptions = useMemo(() => {
    if (!startTime) {
      return { sameDay: [], nextDay: [] };
    }
    return getEndTimeOptionsForStart(startTime);
  }, [startTime]);

  useEffect(() => {
    setArrivalTime(defaultStartTime);
    setStartTime(defaultStartTime);
    setFinishSelection(finishSelectionKey(defaultFinishTime, defaultFinishIsNextDay));
  }, [defaultStartTime, defaultFinishTime, defaultFinishIsNextDay]);

  useEffect(() => {
    if (!finishSelection) return;
    const { time, nextDay } = parseFinishSelectionKey(finishSelection);
    const isValid =
      finishOptions.sameDay.some((o) => o.value === time && !nextDay) ||
      finishOptions.nextDay.some((o) => o.value === time && nextDay);
    if (!isValid) {
      setFinishSelection("");
    }
  }, [finishOptions, finishSelection]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const member = staffOptions.find((option) => option.id === staffMemberId);
    if (!member || member.hourlyRate === null) {
      setError("Select a staff member with an hourly rate.");
      return;
    }

    if (!startTime || !finishSelection) {
      setError("Start and finish times are required.");
      return;
    }

    const { time: finishTime, nextDay: finishIsNextDay } = parseFinishSelectionKey(finishSelection);

    try {
      await onAddShift({
        staffMemberId: member.id,
        staffName: member.name,
        role,
        section,
        arrivalTime,
        startTime,
        finishTime,
        finishIsNextDay,
        breakMinutes: Number(breakMinutes) || 0,
        hourlyRate: member.hourlyRate,
        notes: notes.trim() || null,
      });

      setStaffMemberId("");
      setNotes("");
      setArrivalTime(defaultStartTime);
      setStartTime(defaultStartTime);
      setFinishSelection(finishSelectionKey(defaultFinishTime, defaultFinishIsNextDay));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to add shift.");
    }
  }

  return (
    <div className="v-panel">
      <h3 className="text-sm font-semibold text-stone-900">Add shift</h3>
      <p className="mt-1 text-sm text-stone-500">
        Assign a team member to a role and section for this event.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="staffMember">Staff member</Label>
            <Select
              id="staffMember"
              required
              value={staffMemberId}
              onChange={(e) => setStaffMemberId(e.target.value)}
            >
              <option value="">
                {staffOptions.length === 0
                  ? "No team members available — add staff on the Team page"
                  : "Select staff member…"}
              </option>
              {staffOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} — {member.role}
                  {member.hourlyRate === null ? " (no hourly rate)" : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              {rotaRoleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Select id="section" value={section} onChange={(e) => setSection(e.target.value)}>
              {rotaSections.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arrivalTime">Arrival time</Label>
            <Select
              id="arrivalTime"
              required
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
            >
              {EVENT_START_TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start time</Label>
            <Select
              id="startTime"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {EVENT_START_TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="finishTime">Finish time</Label>
            <Select
              id="finishTime"
              required
              value={finishSelection}
              disabled={!startTime}
              onChange={(e) => setFinishSelection(e.target.value)}
            >
              <option value="" disabled>
                {startTime ? "Select finish time" : "Select start time first"}
              </option>
              {finishOptions.sameDay.length > 0 && (
                <optgroup label="Same day">
                  {finishOptions.sameDay.map((option) => (
                    <option
                      key={finishSelectionKey(option.value, false)}
                      value={finishSelectionKey(option.value, false)}
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              )}
              {finishOptions.nextDay.length > 0 && (
                <optgroup label="Next day">
                  {finishOptions.nextDay.map((option) => (
                    <option
                      key={finishSelectionKey(option.value, true)}
                      value={finishSelectionKey(option.value, true)}
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              )}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="breakMinutes">Break (minutes)</Label>
            <Input
              id="breakMinutes"
              type="number"
              min={0}
              step={5}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Optional shift notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add shift to rota"}
        </Button>
      </form>
    </div>
  );
}
