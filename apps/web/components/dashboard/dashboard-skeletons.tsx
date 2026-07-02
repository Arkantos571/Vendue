import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function OverviewCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="v-card p-5 shadow-sm">
          <Pulse className="h-4 w-24" />
          <Pulse className="mt-3 h-8 w-16" />
          <Pulse className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function EnquiriesWidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Pulse className="h-5 w-40" />
        <Pulse className="mt-2 h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Pulse key={index} className="h-20 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Pulse className="h-5 w-36" />
        <Pulse className="mt-2 h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-3">
            <Pulse className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-4 w-full" />
              <Pulse className="h-3 w-40" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function OnboardingChecklistSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Pulse className="h-5 w-36" />
        <Pulse className="mt-2 h-4 w-64" />
        <Pulse className="mt-4 h-2 w-full rounded-full" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Pulse key={index} className="h-16 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

export function UpcomingEventsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Pulse className="h-5 w-40" />
        <Pulse className="mt-2 h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Pulse key={index} className="h-14 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export function RotaGapsPreviewSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Pulse className="h-5 w-28" />
        <Pulse className="mt-2 h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Pulse key={index} className="h-20 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}
