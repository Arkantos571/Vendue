import Link from "next/link";
import { Building2 } from "lucide-react";

interface VenueRequiredEmptyStateProps {
  message?: string;
  description?: string;
  href?: string;
  buttonLabel?: string;
}

export function VenueRequiredEmptyState({
  message = "Set up your venue before creating events",
  description = "Add your venue details, spaces, and event types in Settings first.",
  href = "/dashboard/settings#venue-setup",
  buttonLabel = "Go to venue setup",
}: VenueRequiredEmptyStateProps) {
  return (
    <div className="v-empty">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Building2 className="h-6 w-6" />
      </div>
      <p className="mt-4 text-sm font-medium text-stone-900">{message}</p>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
      <Link
        href={href}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-brand-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-800"
      >
        {buttonLabel}
      </Link>
    </div>
  );
}
