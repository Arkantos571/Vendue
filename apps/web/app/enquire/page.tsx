import type { Metadata } from "next";
import { EnquirePageShell } from "@/components/enquiries/enquire-page-shell";
import { PublicEnquiryForm } from "@/components/enquiries/public-enquiry-form";

export const metadata: Metadata = {
  title: "Enquire",
  description: "Submit an event enquiry to the venue team.",
};

type EnquirePageProps = {
  searchParams: Promise<{ venue?: string }>;
};

export default async function EnquirePage({ searchParams }: EnquirePageProps) {
  const { venue } = await searchParams;

  return (
    <EnquirePageShell
      title="Event enquiry"
      description="Tell us about your event and the venue team will get back to you."
    >
      <PublicEnquiryForm initialVenueId={venue} />
    </EnquirePageShell>
  );
}
