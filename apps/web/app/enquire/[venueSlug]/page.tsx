import type { Metadata } from "next";
import Link from "next/link";
import { EnquirePageShell } from "@/components/enquiries/enquire-page-shell";
import { PublicEnquiryForm } from "@/components/enquiries/public-enquiry-form";
import { loadPublicVenueBySlugAction } from "@/lib/enquiries/public-actions";

type VenueEnquirePageProps = {
  params: Promise<{ venueSlug: string }>;
};

export async function generateMetadata({ params }: VenueEnquirePageProps): Promise<Metadata> {
  const { venueSlug } = await params;
  const result = await loadPublicVenueBySlugAction(venueSlug);

  if (!result.success || !result.venue) {
    return { title: "Enquiry form" };
  }

  return {
    title: `Enquire — ${result.venue.venueName}`,
    description: `Submit an event enquiry to ${result.venue.venueName}.`,
  };
}

export default async function VenueEnquirePage({ params }: VenueEnquirePageProps) {
  const { venueSlug } = await params;
  const result = await loadPublicVenueBySlugAction(venueSlug);

  if (!result.success) {
    return (
      <EnquirePageShell
        title="Enquiry form unavailable"
        description="We could not load this enquiry form right now. Please try again later."
      >
        <div className="v-panel">
          <p className="text-sm text-slate-600 dark:text-slate-300">{result.error}</p>
        </div>
      </EnquirePageShell>
    );
  }

  if (!result.venue) {
    return (
      <EnquirePageShell
        title="Enquiry form not found"
        description="This link does not match a venue enquiry form."
      >
        <div className="v-panel space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Check the link you were given, or contact the venue directly.
          </p>
          <Link
            href="/enquire"
            className="inline-flex text-sm font-medium text-brand-700 hover:text-brand-800 dark:text-brand-400"
          >
            Browse available enquiry forms
          </Link>
        </div>
      </EnquirePageShell>
    );
  }

  if (!result.venue.enquiryFormEnabled) {
    return (
      <EnquirePageShell
        venueName={result.venue.venueName}
        title="Enquiry form unavailable"
        description="This enquiry form is currently unavailable."
      >
        <div className="v-panel">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {result.venue.venueName} is not accepting online enquiries at the moment. Please contact
            the venue team directly.
          </p>
        </div>
      </EnquirePageShell>
    );
  }

  return (
    <EnquirePageShell
      venueName={result.venue.venueName}
      title="Event enquiry"
      description="Tell us about your event and the venue team will get back to you."
    >
      <PublicEnquiryForm
        fixedVenue={{
          id: result.venue.venueId,
          name: result.venue.venueName,
        }}
      />
    </EnquirePageShell>
  );
}
