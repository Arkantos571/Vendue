import Link from "next/link";
import { Building2 } from "lucide-react";

interface VenueRequiredEmptyStateProps {
  message?: string;
}

export function VenueRequiredEmptyState({
  message = "Set up your venue before creating events",
}: VenueRequiredEmptyStateProps) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Building2 className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-medium text-stone-900">{message}</p>
      <p className="mt-1 text-sm text-stone-500">
        Add your venue details, spaces, and event types in Settings first.
      </p>
      <Link
        href="/dashboard/settings#venue-setup"
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800"
      >
        Go to venue setup
      </Link>
    </div>
  );
}
