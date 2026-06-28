import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicEnquiryForm } from "@/components/enquiries/public-enquiry-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

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
    <div className="flex min-h-screen flex-col bg-surface">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to homepage
          </Link>

          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-700 dark:text-brand-400">
              Venudue
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              Event enquiry
            </h1>
            <p className="max-w-2xl text-sm text-stone-600 dark:text-stone-400 sm:text-base">
              Tell us about your event and the venue team will get back to you.
            </p>
          </div>

          <div className="mt-8">
            <PublicEnquiryForm initialVenueId={venue} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
