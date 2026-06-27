import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Team & rota",
};

export default function TeamPage() {
  return (
    <DashboardShell
      title="Team & rota"
      description="Manage staff and assign shifts to events."
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-600">
            Staff roster and rota scheduling will live here.
          </p>
          <Button disabled>Add team member</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Team roster</CardTitle>
              <CardDescription>Invite and manage venue staff.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-500">No team members added yet.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rota shifts</CardTitle>
              <CardDescription>Assign staff to upcoming events.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-500">No shifts scheduled yet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
