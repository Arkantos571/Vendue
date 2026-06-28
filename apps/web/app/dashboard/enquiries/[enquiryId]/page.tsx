import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EnquiryDetailView } from "@/components/enquiries/enquiry-detail-view";
import { loadEnquiryProposalForPage } from "@/lib/enquiries/data";

interface EnquiryDetailPageProps {
  params: Promise<{ enquiryId: string }>;
}

export async function generateMetadata({ params }: EnquiryDetailPageProps): Promise<Metadata> {
  const { enquiryId } = await params;
  const data = await loadEnquiryProposalForPage(enquiryId);

  return {
    title: data?.enquiry.eventName ?? "Enquiry",
  };
}

export default async function EnquiryDetailPage({ params }: EnquiryDetailPageProps) {
  const { enquiryId } = await params;
  const data = await loadEnquiryProposalForPage(enquiryId);

  if (!data) {
    notFound();
  }

  return (
    <DashboardShell title="Enquiry detail" description={data.enquiry.eventName}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/dashboard/enquiries"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to enquiries
        </Link>
        <EnquiryDetailView enquiry={data.enquiry} venueName={data.venue.name} />
      </div>
    </DashboardShell>
  );
}
