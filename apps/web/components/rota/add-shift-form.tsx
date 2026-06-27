"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  rotaRoleOptions,
  rotaSections,
  type AvailableStaffMember,
} from "@/lib/mock/rota";

export interface NewShiftInput {
  staffMemberId: string;
  staffName: string;
  role: string;
  section: string;
  arrivalTime: string;
  startTime: string;
  finishTime: string;
  breakMinutes: number;
  hourlyRate: number;
  notes: string | null;
}

interface AddShiftFormProps {
  staffOptions: AvailableStaffMember[];
  defaultStartTime: string;
  defaultFinishTime: string;
  onAddShift: (shift: NewShiftInput) => void;
}

const emptyForm = {
  staffMemberId: "",
  role: rotaRoleOptions[0],
  section: rotaSections[0],
  arrivalTime: "",
  startTime: "",
  finishTime: "",
  breakMinutes: "30",
  notes: "",
};

export function AddShiftForm({
  staffOptions,
  defaultStartTime,
  defaultFinishTime,
  onAddShift,
}: AddShiftFormProps) {
  const [form, setForm] = useState({
    ...emptyForm,
    startTime: defaultStartTime,
    finishTime: defaultFinishTime,
    arrivalTime: defaultStartTime,
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const member = staffOptions.find((option) => option.id === form.staffMemberId);
    if (!member || member.hourlyRate === null) return;

    onAddShift({
      staffMemberId: member.id,
      staffName: member.name,
      role: form.role,
      section: form.section,
      arrivalTime: form.arrivalTime,
      startTime: form.startTime,
      finishTime: form.finishTime,
      breakMinutes: Number(form.breakMinutes) || 0,
      hourlyRate: member.hourlyRate,
      notes: form.notes.trim() || null,
    });

    setForm({
      ...emptyForm,
      startTime: defaultStartTime,
      finishTime: defaultFinishTime,
      arrivalTime: defaultStartTime,
    });
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-stone-900">Add shift</h3>
      <p className="mt-1 text-sm text-stone-500">
        Assign a team member to a role and section for this event.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="staffMember">Staff member</Label>
            <Select
              id="staffMember"
              required
              value={form.staffMemberId}
              onChange={(e) => setForm((current) => ({ ...current, staffMemberId: e.target.value }))}
            >
              <option value="">Select staff member…</option>
              {staffOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} — {member.role}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              value={form.role}
              onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}
            >
              {rotaRoleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Select
              id="section"
              value={form.section}
              onChange={(e) => setForm((current) => ({ ...current, section: e.target.value }))}
            >
              {rotaSections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arrivalTime">Arrival time</Label>
            <Input
              id="arrivalTime"
              type="time"
              required
              value={form.arrivalTime}
              onChange={(e) => setForm((current) => ({ ...current, arrivalTime: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start time</Label>
            <Input
              id="startTime"
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm((current) => ({ ...current, startTime: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="finishTime">Finish time</Label>
            <Input
              id="finishTime"
              type="time"
              required
              value={form.finishTime}
              onChange={(e) => setForm((current) => ({ ...current, finishTime: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="breakMinutes">Break (minutes)</Label>
            <Input
              id="breakMinutes"
              type="number"
              min={0}
              step={5}
              value={form.breakMinutes}
              onChange={(e) => setForm((current) => ({ ...current, breakMinutes: e.target.value }))}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Optional shift notes…"
              value={form.notes}
              onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
            />
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-auto">
          Add shift to rota
        </Button>
      </form>
    </div>
  );
}
